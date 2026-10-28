/**
 * Menerapkan pengaturan Beranda dari Google Sheet (tab Pengaturan_Beranda)
 * ke elemen bertanda data-cms="kunci" (teks) dan data-cms-src="kunci" (gambar).
 * Nilai kosong = tetap memakai teks bawaan di HTML.
 */
(function () {
  function imageUrl(value) {
    var trimmed = String(value || '').trim();
    var match = trimmed.match(/^https:\/\/drive\.google\.com\/(?:file\/d\/([^/?#]+)|[^?#]*)(?:\?([^#]*))?/i);
    if (!match) return trimmed;
    var queryId = (match[2] || '').match(/(?:^|&)id=([^&]+)/i);
    var id = match[1] || (queryId && queryId[1]);
    if (id) return 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w1600';
    return trimmed;
  }

  function watchPublicImages() {
    document.querySelectorAll('img[data-cms-src]').forEach(function (img) {
      var parent = img.parentElement;
      if (!parent) return;
      var fallback = parent.querySelector('.public-image-fallback');
      if (!fallback) {
        fallback = document.createElement('div');
        fallback.className = 'public-image-fallback';
        fallback.hidden = true;
        fallback.setAttribute('role', 'img');
        fallback.setAttribute('aria-label', img.alt || 'Foto tidak tersedia');
        fallback.innerHTML = '<span class="public-image-fallback-content"><span class="material-symbols-outlined" aria-hidden="true">image_not_supported</span><span>Foto belum dapat ditampilkan. Periksa tautan foto pada pengaturan Beranda.</span></span>';
        parent.insertBefore(fallback, img.nextSibling);
      }
      function showFallback() {
        img.classList.add('image-unavailable');
        fallback.hidden = false;
      }
      function showImage() {
        img.classList.remove('image-unavailable');
        fallback.hidden = true;
      }
      img.addEventListener('error', showFallback);
      img.addEventListener('load', showImage);
      if (img.complete) {
        if (img.naturalWidth > 0) showImage();
        else showFallback();
      }
    });
  }

  function apply(cfg) {
    var contactPhone = String(cfg.kontak_wa || '').replace(/\D/g, '');
    if (contactPhone === '08114200989' || contactPhone === '628114200989') {
      cfg.kontak_wa = '0851-3991-1440';
    }
    document.querySelectorAll('[data-cms]').forEach(function (el) {
      var v = cfg[el.getAttribute('data-cms')];
      if (v) el.textContent = v;
    });
    document.querySelectorAll('[data-cms-src]').forEach(function (el) {
      var v = cfg[el.getAttribute('data-cms-src')];
      if (v && /^https:\/\//i.test(v)) el.setAttribute('src', imageUrl(v));
    });
    document.querySelectorAll('[data-cms-whatsapp]').forEach(function (el) {
      var phone = String(cfg[el.getAttribute('data-cms-whatsapp')] || '').replace(/\D/g, '');
      if (phone.charAt(0) === '0') phone = '62' + phone.slice(1);
      else if (phone.charAt(0) === '8') phone = '62' + phone;
      if (phone.length >= 9 && phone.length <= 15) {
        el.setAttribute('href', 'https://wa.me/' + phone);
      }
    });
    var photoKeys = ['hero_photo_url', 'hero_photo_url_2', 'hero_photo_url_3', 'hero_photo_url_4', 'hero_photo_url_5'];
    var photos = photoKeys.map(function (key) { return cfg[key]; })
      .filter(function (url) { return typeof url === 'string' && /^https:\/\//i.test(url.trim()); })
      .map(imageUrl)
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
  watchPublicImages();
  if (window.SipAtsAPI) {
    ready = SipAtsAPI.getConfig().then(function (cfg) { cfg = cfg || {}; apply(cfg); return cfg; })
      .catch(function () { return {}; });
  }
  window.SipAtsCMS = { ready: ready };
})();
