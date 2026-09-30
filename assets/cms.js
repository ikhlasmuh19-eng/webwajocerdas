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
    var photoKeys = ['hero_photo_url', 'hero_photo_url_2', 'hero_photo_url_3', 'hero_photo_url_4', 'hero_photo_url_5'];
    var photos = photoKeys.map(function (key) { return cfg[key]; })
      .filter(function (url) { return typeof url === 'string' && /^https:\/\//i.test(url.trim()); })
      .map(function (url) { return url.trim(); })
      .filter(function (url, index, all) {
        return all.indexOf(url) === index;
      });
    var heroPhoto = document.querySelector('[data-cms-src="hero_photo_url"]');
    var controls = document.getElementById('heroPhotoControls');
    if (heroPhoto && controls && photos.length > 1) {
      var count = document.getElementById('heroPhotoCount');
      var index = 0;
      function showPhoto(nextIndex) {
        index = (nextIndex + photos.length) % photos.length;
        heroPhoto.setAttribute('src', photos[index].trim());
        count.textContent = (index + 1) + ' / ' + photos.length;
      }
      document.getElementById('heroPhotoPrevious').addEventListener('click', function () {
        showPhoto(index - 1);
      });
      document.getElementById('heroPhotoNext').addEventListener('click', function () {
        showPhoto(index + 1);
      });
      controls.classList.remove('hidden');
      showPhoto(0);
      var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) window.setInterval(function () { showPhoto(index + 1); }, 5000);
    }
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
