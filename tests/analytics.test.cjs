const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../analytics.js'), 'utf8');

function browser(options = {}) {
  const storage = new Map(Object.entries(options.storage || {}));
  const nodes = new Map(), listeners = {}, scripts = [], cookieWrites = [];
  function element(tag) {
    const e = { tag, dataset: {}, children: new Map(), appended: [], listeners: {},
      setAttribute() {},
      appendChild(child) { this.appended.push(child); if (child.id) nodes.set(child.id, child); if (child.tag === 'script') scripts.push(child); },
      addEventListener(name, fn) { this.listeners[name] = fn; },
      querySelector(selector) {
        if (!this.children.has(selector)) this.children.set(selector, element('button'));
        return this.children.get(selector);
      },
      remove() { nodes.delete(this.id); }
    };
    return e;
  }
  const footer = element('footer');
  const document = { readyState: 'complete', referrer: options.referrer || '',
    head: element('head'), body: element('body'), createElement: element,
    getElementById: id => nodes.get(id), querySelector: s => s === 'footer' ? footer : null,
    addEventListener: (n, fn) => { listeners[n] = fn; }
  };
  let cookies = options.cookie ?? ('_ga=123; _ga_5T60FR1W0L=456; auth_session=private' +
    (options.storage?.mindago_analytics_consent === 'granted' ? '; mindago_analytics_consent=granted' : ''));
  Object.defineProperty(document, 'cookie', { get: () => cookies, set: v => {
    cookieWrites.push(v);
    const key=v.split('=')[0];
    cookies=cookies.split(';').filter(s=>s.trim().split('=')[0]!==key).concat(v.split(';')[0]).join('; ');
  } });
  const context = { window: {}, document, URL, Date,
    location: new URL(options.url || 'https://mindago.my/'),
    navigator: { globalPrivacyControl: options.gpc, doNotTrack: options.dnt },
    localStorage: { getItem: k => { if (options.storageFails) throw Error(); return storage.get(k) || null; },
      setItem: (k, v) => { if (options.storageFails) throw Error(); storage.set(k, v); },
      removeItem: k => { if (options.storageFails) throw Error(); storage.delete(k); } }
  };
  vm.runInNewContext(source, context);
  return { context, scripts, cookieWrites, storage,
    events: () => JSON.parse(JSON.stringify((context.window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'event'))),
    choose: name => nodes.get('mindago-analytics-consent').querySelector('.mindago-consent__' + name).listeners.click(),
    openPreferences: () => footer.appended.at(-1).listeners.click(),
    click: (href, dataset = {}, placement = '') => {
      const link = { href, dataset, closest: s => s === placement ? {} : null };
      listeners.click({ target: { closest: () => link } });
    },
    banner: () => nodes.get('mindago-analytics-consent')
  };
}

test('no consent and denied consent do not load Google or report events', () => {
  for (const storage of [{}, { mindago_analytics_consent: 'denied' }]) {
    const b = browser({ storage });
    assert.equal(b.scripts.length, 0);
    assert.equal(b.events().length, 0);
  }
});

test('grant queues exactly one sanitized page view and sales item view', () => {
  const b = browser({ url: 'https://mindago.my/?email=private@example.com#access_token=secret',
    referrer: 'https://search.example/results?email=private@example.com' });
  b.choose('allow');
  assert.equal(b.scripts.length, 1);
  const events = b.events();
  assert.deepEqual(events.map(e => e[1]), ['page_view', 'view_item']);
  assert.equal(events[0][2].page_location, 'https://mindago.my/');
  assert.equal(events[0][2].page_referrer, 'https://search.example/');
  assert.equal(events[1][2].value, 4.99);
  assert.equal(JSON.stringify(b.context.window.dataLayer).includes('private@example.com'), false);
  assert.equal(JSON.stringify(b.context.window.dataLayer).includes('access_token'), false);
});

test('resource visits report a page view without falsely claiming an item view', () => {
  const b = browser({ url: 'https://mindago.my/teaching-resources/free-sample/', storage: { mindago_analytics_consent: 'granted' } });
  assert.deepEqual(b.events().map(e => e[1]), ['page_view']);
});

test('Founding 50 CTA records a sanitized navigation click, never checkout or purchase', () => {
  const b = browser({ storage: { mindago_analytics_consent: 'granted' } });
  b.click('https://join.mindago.my/founding50?email=private@example.com#secret', {}, 'header');
  assert.deepEqual(b.events().at(-1), ['event', 'founding50_cta_click', {
    cta_placement: 'header', link_url: 'https://join.mindago.my/founding50', transport_type: 'beacon'
  }]);
  assert.equal(b.events().some(e => ['purchase', 'begin_checkout'].includes(e[1])), false);
});

test('checkout return query cannot create a purchase event', () => {
  const b = browser({ url: 'https://mindago.my/?checkout=success&paid=true&transaction_id=pretend', storage: { mindago_analytics_consent: 'granted' } });
  assert.equal(b.events().some(e => e[1] === 'purchase'), false);
});

for (const url of ['http://localhost:8080/', 'https://preview.mindago-website.pages.dev/',
  'https://join.mindago.my/founding50', 'https://play.mindago.my/', 'https://mindago.my/account.html',
  'https://mindago.my/not-a-real-page/', 'http://mindago.my/']) {
  test('no Google collection on noncanonical/private/preview route: ' + url, () => {
    const b = browser({ url, storage: { mindago_analytics_consent: 'granted' } });
    assert.equal(b.scripts.length, 0);
    assert.equal(b.events().length, 0);
  });
}

test('browser privacy signals and internal exclusion override stored consent', () => {
  for (const extra of [{ gpc: true }, { dnt: '1' }, { storage: { mindago_analytics_consent: 'granted', mindago_analytics_internal: 'true' } }]) {
    const b = browser({ storage: { mindago_analytics_consent: 'granted' }, ...extra });
    assert.equal(b.scripts.length, 0);
  }
});

test('internal browser exclusion persists without sending personal identifiers', () => {
  const b = browser(); b.choose('internal');
  assert.equal(b.storage.get('mindago_analytics_internal'), 'true');
  assert.equal(b.storage.get('mindago_analytics_consent'), 'denied');
  assert.equal(b.scripts.length, 0);
  assert.equal(b.cookieWrites.some(s => s.includes('auth_session')), false);
});

test('consent works for this page when localStorage is unavailable', () => {
  const b = browser({ storageFails: true }); b.choose('allow');
  assert.equal(b.scripts.length, 1);
  assert.equal(b.events().filter(e => e[1] === 'page_view').length, 1);
});

test('existing resource conversions preserve event names and strip URL queries', () => {
  const b = browser({ storage: { mindago_analytics_consent: 'granted' } });
  b.click('https://payhip.com/b/9gBRV?email=secret', { action: 'buy', product: 'minda-dots' });
  assert.equal(b.events().at(-1)[1], 'payhip_click');
  assert.equal(b.events().at(-1)[2].link_url, 'https://payhip.com/b/9gBRV');
  b.click('https://mindago.my/teaching-resources/free-sample/sample.zip?token=secret', { action: 'free-sample', sample: 'minda-dots-a4' });
  assert.equal(b.events().at(-1)[1], 'free_sample_download');
});

test('withdrawal stops events and deletes only GA cookies', () => {
  const b = browser(); b.choose('allow'); b.openPreferences(); b.choose('essential');
  const count = b.events().length;
  b.click('https://join.mindago.my/founding50');
  assert.equal(b.events().length, count);
  assert.equal(b.context.window['ga-disable-G-5T60FR1W0L'], true);
  assert.equal(b.cookieWrites.filter(s => /^_ga/.test(s)).length, 4);
  assert.equal(b.cookieWrites.some(s => s.includes('auth_session')), false);
});

test('regrant does not duplicate page views or inject another Google script', () => {
  const b = browser(); b.choose('allow'); b.openPreferences(); b.choose('essential');
  b.openPreferences(); b.choose('allow');
  assert.equal(b.scripts.length, 1);
  assert.equal(b.events().filter(e => e[1] === 'page_view').length, 1);
});

test('explicit allow can undo team-browser exclusion', () => {
  const b = browser(); b.choose('internal'); b.openPreferences(); b.choose('allow');
  assert.equal(b.storage.has('mindago_analytics_internal'), false);
  assert.equal(b.scripts.length, 1);
});

test('shared Checkout withdrawal overrides an old local grant', () => {
  const b=browser({cookie:'mindago_analytics_consent=denied',storage:{mindago_analytics_consent:'granted'}});
  assert.equal(b.scripts.length,0);
});

test('only the consent choice is shared with parent Checkout', () => {
  const b=browser();b.choose('allow');
  assert.ok(b.cookieWrites.includes('mindago_analytics_consent=granted; Path=/; Domain=mindago.my; SameSite=Lax; Secure'));
  assert.equal(b.cookieWrites.some(s=>s.includes('internal')||s.includes('@')),false);
});

test('legacy website-only grant requires fresh consent for the expanded scope',()=>{
  const b=browser({cookie:'',storage:{mindago_analytics_consent:'granted'}});
  assert.equal(b.scripts.length,0);assert.ok(b.banner());
});
