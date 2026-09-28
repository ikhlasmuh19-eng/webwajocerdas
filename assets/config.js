/**
 * KONFIGURASI SIP-ATS WAJO
 * -------------------------------------------------------------
 * Ganti API_URL dengan URL Web App hasil deploy Code.gs Anda.
 * Contoh: https://script.google.com/macros/s/AKfycbx.../exec
 *
 * Selama API_URL masih kosong, seluruh halaman otomatis berjalan
 * dalam MODE DEMO (memakai data contoh statis) supaya desain tetap
 * bisa ditinjau sebelum backend selesai di-deploy.
 */
window.SIP_ATS_CONFIG = {
  API_URL:
    "https://script.google.com/macros/s/AKfycbwpIvBETI2OJklDrYuM4FINnfhfyFl9_bRRpneSwWOuPbpwWFO9yZdyAranyqgVT2iE/exec", // <-- TEMPEL URL WEB APP GOOGLE APPS SCRIPT DI SINI
  ADMIN_KEY_STORAGE: "sipats_admin_key", // nama key di sessionStorage utk kunci admin
};
