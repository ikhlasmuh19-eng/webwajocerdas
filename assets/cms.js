/**
 * Menerapkan pengaturan Beranda dari Google Sheet (tab Pengaturan_Beranda)
 * ke elemen bertanda data-cms="kunci" (teks) dan data-cms-src="kunci" (gambar).
 * Nilai kosong = tetap memakai teks bawaan di HTML.
 */
(function () {
  function apply(cfg) {
    document.querySelectorAll('[data-cms]').forEach(function (el) {
      var v = cfg[el.getAttribute('data-cms')];
      if (v) el.textContent = v;
    });
    document.querySelectorAll('[data-cms-src]').forEach(function (el) {
      var v = cfg[el.getAttribute('data-cms-src')];
      if (v && /^https:\/\//i.test(v)) el.setAttribute('src', v);
    });
    if (cfg.banner_aktif === 'true' && cfg.banner_teks) {
      var b = document.createElement('div');
      b.className = 'bg-amber-500 text-slate-900 text-xs sm:text-sm font-semibold text-center py-2 px-4';
      b.textContent = cfg.banner_teks;
      document.body.insertBefore(b, document.body.firstChild);
    }
  }
  var ready = Promise.resolve({});
  if (window.SipAtsAPI) {
    ready = SipAtsAPI.getConfig().then(function (cfg) { cfg = cfg || {}; apply(cfg); return cfg; })
      .catch(function () { return {}; });
  }
  window.SipAtsCMS = { ready: ready };
})();
