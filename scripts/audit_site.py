"""Dependency-free static SEO/link audit and optional read-only HTTP evidence."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urljoin, urlsplit
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://mindago.my"


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.title, self.description, self.canonical, self.robots = "", [], [], []
        self.h1, self.links, self.refs, self.ids, self.text, self.stack = [], [], [], [], [], []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.append(a["id"])
        if tag == "meta":
            name = a.get("name", "").lower()
            if name == "description":
                self.description.append(a.get("content", ""))
            if name == "robots":
                self.robots.append(a.get("content", ""))
        if tag == "link" and a.get("rel") == "canonical":
            self.canonical.append(a.get("href", ""))
        if tag == "a" and "href" in a:
            self.links.append(a["href"])
        if "src" in a:
            self.refs.append(a["src"])
        if tag == "link" and a.get("rel") in ("stylesheet", "icon"):
            self.refs.append(a.get("href", ""))
        if tag not in ("meta", "link", "img", "input", "br", "hr", "source", "wbr"):
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in self.stack:
            self.stack = self.stack[:len(self.stack) - 1 - self.stack[::-1].index(tag)]

    def handle_data(self, data):
        if "title" in self.stack:
            self.title += data
        if "h1" in self.stack:
            self.h1.append(data)
        if not any(t in self.stack for t in ("script", "style", "head", "svg")):
            self.text.append(data)


def route(path):
    relative = path.relative_to(ROOT).as_posix()
    return "/" if relative == "index.html" else "/" + relative.removesuffix("index.html")


def audit():
    files = [p for p in sorted(ROOT.rglob("index.html"))
             if not any(part.startswith(".") for part in p.relative_to(ROOT).parts)]
    pages = {route(p): Page(p.read_text(encoding="utf-8")) for p in files}
    sitemap = [e.text for e in ET.parse(ROOT / "sitemap.xml").iter() if e.tag.endswith("}loc")]
    errors, summary = [], []
    for path, page in pages.items():
        prefix = path + ": "
        if not page.title.strip() or len(page.description) != 1 or not page.description[0]:
            errors.append(prefix + "missing/duplicate title or description")
        if page.canonical != [ORIGIN + path]:
            errors.append(prefix + "canonical mismatch")
        if "noindex" in ",".join(page.robots).lower():
            errors.append(prefix + "public page is noindex")
        if ORIGIN + path not in sitemap:
            errors.append(prefix + "missing from sitemap")
        if not page.h1 or len(" ".join(page.text).split()) < 100:
            errors.append(prefix + "missing heading or unexpectedly thin page")
        if len(page.ids) != len(set(page.ids)):
            errors.append(prefix + "duplicate element IDs")
        for ref in page.links + page.refs:
            url = urlsplit(urljoin(ORIGIN + path, ref))
            if url.netloc != "mindago.my":
                continue
            target = ROOT / unquote(url.path).lstrip("/")
            if target.is_dir():
                target /= "index.html"
            if not target.is_file():
                errors.append(prefix + "missing local target " + url.path)
            elif url.fragment and target.suffix == ".html":
                other = Page(target.read_text(encoding="utf-8"))
                if unquote(url.fragment) not in other.ids:
                    errors.append(prefix + "missing fragment " + url.path + "#" + url.fragment)
        incoming = sum(any(urljoin(ORIGIN + source, link).split("#")[0] == ORIGIN + path
                           for link in other.links) for source, other in pages.items() if source != path)
        if path != "/" and not incoming:
            errors.append(prefix + "orphan page")
        summary.append({"path": path, "title": page.title, "description": page.description,
                        "canonical": page.canonical, "robots": page.robots, "incoming_pages": incoming,
                        "words": len(" ".join(page.text).split())})
    for field in ("title", "description"):
        values = [p.title if field == "title" else str(p.description) for p in pages.values()]
        if len(values) != len(set(values)):
            errors.append("duplicate " + field)
    if set(sitemap) != {ORIGIN + p for p in pages} or len(sitemap) != len(set(sitemap)):
        errors.append("sitemap has noncanonical/private/duplicate URLs or misses a public page")
    return {"pages": summary, "errors": errors}


def fetch(url):
    try:
        response = urlopen(Request(url, headers={"User-Agent": "MindAgo-SEO-Audit/1.0"}), timeout=25)
    except HTTPError as e:
        response = e
    except (URLError, TimeoutError) as e:
        return {"url": url, "error": str(e)}
    text = response.read().decode("utf-8", errors="replace")
    result = {"url": url, "final_url": response.url, "status": response.status,
              "content_type": response.headers.get("Content-Type"),
              "x_robots_tag": response.headers.get("X-Robots-Tag")}
    if "html" in (result["content_type"] or ""):
        p = Page(text)
        result.update(title=p.title, description=p.description, canonical=p.canonical,
                      robots=p.robots, words=len(" ".join(p.text).split()))
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--live", action="store_true")
    parser.add_argument("--output")
    args = parser.parse_args()
    result = audit()
    if args.live:
        urls = [ORIGIN + p["path"] for p in result["pages"]]
        urls += [ORIGIN + "/robots.txt", ORIGIN + "/sitemap.xml", ORIGIN + "/not-a-real-page-seo-probe/",
                 "https://www.mindago.my/", "http://www.mindago.my/teaching-resources/?source=seo-probe",
                 "http://mindago.my/books/?source=seo-probe", "https://join.mindago.my/robots.txt",
                 "https://join.mindago.my/founding50", "https://play.mindago.my/robots.txt"]
        with ThreadPoolExecutor(max_workers=5) as pool:
            result["live"] = list(pool.map(fetch, urls))
    if args.output:
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))
    raise SystemExit(bool(result["errors"]))
