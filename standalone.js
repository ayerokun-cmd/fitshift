/* Fitshift standalone extras: runs only outside claude.ai.
   - Stores your exercise photos/videos on this device (IndexedDB)
   - Backup export/import of your settings and workout log
   - Install button and offline support (service worker) */
(function () {
  if (window.claude && window.claude.use) return;

  /* ---------- photos & videos on this device ---------- */
  const DB_NAME = "fitshift-media", STORE = "media";
  const openDb = () => new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  async function run(mode, fn) {
    const db = await openDb();
    return new Promise((res, rej) => { const t = db.transaction(STORE, mode); fn(t.objectStore(STORE)); t.oncomplete = res; t.onerror = () => rej(t.error); });
  }
  async function readAll() {
    const db = await openDb();
    return new Promise((res, rej) => {
      const out = {}, req = db.transaction(STORE).objectStore(STORE).openCursor();
      req.onsuccess = () => { const c = req.result; if (c) { out[c.key] = c.value; c.continue(); } else res(out); };
      req.onerror = () => rej(req.error);
    });
  }
  let urls = [];
  async function refreshMedia() {
    try {
      const all = await readAll();
      urls.forEach(u => URL.revokeObjectURL(u)); urls = [];
      MEDIA.map = {};
      for (const [id, v] of Object.entries(all)) { const url = URL.createObjectURL(v.blob); urls.push(url); MEDIA.map[id] = { url, type: v.type }; }
      if (S.workout) renderWorkout();
    } catch (e) { /* storage unavailable: media stays hidden */ }
  }
  if (window.indexedDB) {
    MEDIA.canUpload = true;
    window.uploadMedia = async function (exId, file) {
      const st = document.querySelector('[data-media-status="' + exId + '"]');
      const say = (t, err) => { if (st) { st.textContent = t; st.className = "status" + (err ? " err" : ""); } };
      if (file.size > 100 * 1024 * 1024) { say("That file is over 100 MB. Trim the clip or use a photo.", true); return; }
      say("Saving…");
      try { await run("readwrite", s => s.put({ blob: file, type: file.type || "video/mp4", at: Date.now() }, exId)); await refreshMedia(); }
      catch (e) { say("Couldn't save it. Your device may be out of storage.", true); }
    };
    window.removeMedia = async function (exId) { try { await run("readwrite", s => s.delete(exId)); } catch (e) {} refreshMedia(); };
    refreshMedia();
  }

  /* ---------- footer: backup + install ---------- */
  const foot = document.createElement("footer");
  foot.className = "app-foot";
  foot.innerHTML = `
    <div><b>Your data stays on this device.</b> Back it up before clearing your browser or switching phones. Photos and videos aren't included in the backup.</div>
    <div class="btn-row">
      <button class="small-btn" id="export-btn">Export backup</button>
      <label class="small-btn file-label" style="border-style:solid">Import backup<input type="file" accept="application/json,.json" id="import-input"></label>
      <button class="small-btn" id="install-btn" hidden>Install app</button>
    </div>
    <div class="status" id="foot-status"></div>`;
  document.querySelector(".wrap").appendChild(foot);
  const css = document.createElement("style");
  css.textContent = ".app-foot{margin-top:40px;padding-top:16px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:10px;font-size:13.5px;color:var(--muted)}.app-foot b{color:var(--ink)}";
  document.head.appendChild(css);
  const status = t => { document.getElementById("foot-status").textContent = t; };

  document.getElementById("export-btn").onclick = () => {
    const data = { app: "fitshift", version: 1, exportedAt: new Date().toISOString(), settings: localStorage.getItem("fitshift"), log: localStorage.getItem("fitshift-log") };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "fitshift-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    status("Backup downloaded.");
  };
  document.getElementById("import-input").onchange = async ev => {
    const f = ev.target.files[0]; if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (d.app !== "fitshift") throw new Error("not a Fitshift backup");
      if (d.settings) localStorage.setItem("fitshift", d.settings);
      if (d.log) localStorage.setItem("fitshift-log", d.log);
      status("Backup restored. Reloading…"); setTimeout(() => location.reload(), 600);
    } catch (e) { status("That file isn't a Fitshift backup."); }
  };

  let deferred = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; document.getElementById("install-btn").hidden = false; });
  document.getElementById("install-btn").onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; document.getElementById("install-btn").hidden = true; };
  window.addEventListener("appinstalled", () => status("Installed. Open Fitshift from your home screen or app list."));
  if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone) status("On iPhone: tap Share, then Add to Home Screen to install.");

  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("./sw.js").catch(() => {});
})();
