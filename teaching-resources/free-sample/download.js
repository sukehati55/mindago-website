(() => {
  "use strict";

  const button = document.getElementById("free-sample-download");
  const status = document.getElementById("download-status");
  if (!button) return;

  const filename = "MindAgo_Minda_Dots_Free_Sample_A4.zip";
  const chunkCount = 8;

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  button.addEventListener("click", async (event) => {
    event.preventDefault();
    if (button.dataset.loading === "true") return;

    button.dataset.loading = "true";
    button.setAttribute("aria-disabled", "true");
    setStatus("Preparing your free sample…");

    try {
      const requests = Array.from({ length: chunkCount }, (_, index) => {
        const part = String(index + 1).padStart(2, "0");
        return fetch(`chunks/part-${part}.txt`, { cache: "force-cache" }).then((response) => {
          if (!response.ok) throw new Error(`Sample part ${part} could not be loaded.`);
          return response.text();
        });
      });

      const parts = await Promise.all(requests);
      const base64 = parts.join("").replace(/\s+/g, "");
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "application/zip" });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setStatus("Download ready. Check your browser’s downloads.");
    } catch (error) {
      console.error(error);
      setStatus("The download could not be prepared. Please refresh the page and try again.");
    } finally {
      button.dataset.loading = "false";
      button.removeAttribute("aria-disabled");
    }
  });
})();