/**
 * SIP-ATS WAJO — API Client
 * Membungkus pemanggilan ke Google Apps Script Web App.
 * Jika API_URL belum diisi di config.js, seluruh fungsi mengembalikan
 * data contoh (DEMO MODE) agar tampilan tetap bisa ditinjau.
 */
(function (global) {
  const CFG = global.SIP_ATS_CONFIG || {};
  const API_URL = CFG.API_URL || '';
  const DEMO_MODE = !API_URL;

  function isDemoMode() { return DEMO_MODE; }

  async function apiGet(action, params) {
    if (DEMO_MODE) return demoResponse_(action, params || {});
    const qs = new URLSearchParams(Object.assign({ action: action }, params || {})).toString();
    const res = await fetch(API_URL + '?' + qs, { method: 'GET' });
    if (!res.ok) throw new Error('Gagal menghubungi server (' + res.status + ')');
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json;
  }

  async function apiPost(action, body) {
    if (DEMO_MODE) return demoResponse_(action, body || {});
    const res = await fetch(API_URL, {
      method: 'POST',
      // text/plain dipakai agar tidak memicu CORS preflight yang tidak
      // didukung Google Apps Script; body tetap berisi JSON valid.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ action: action }, body || {}))
    });
    if (!res.ok) throw new Error('Gagal menghubungi server (' + res.status + ')');
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json;
  }

  function getAdminKey() {
    return sessionStorage.getItem(CFG.ADMIN_KEY_STORAGE || 'sipats_admin_key') || '';
  }
  function setAdminKey(key) {
    sessionStorage.setItem(CFG.ADMIN_KEY_STORAGE || 'sipats_admin_key', key);
  }
  function clearAdminKey() {
    sessionStorage.removeItem(CFG.ADMIN_KEY_STORAGE || 'sipats_admin_key');
  }

  // ---- Public API -------------------------------------------------
  const SipAtsAPI = {
    isDemoMode,
    getStats: () => apiGet('stats'),
    getDirectory: (params) => apiGet('directory', params),
    checkNik: (nik) => apiGet('checkNik', { nik }),
    getWilayah: () => apiGet('wilayah'),
    getConfig: () => apiGet('config'),
    submitLaporan: (payload) => apiPost('laporkan', payload),
    getQueue: (params) => apiGet('queue', Object.assign({ key: getAdminKey() }, params)),
    updateStatus: (payload) => apiPost('updateStatus', Object.assign({ key: getAdminKey() }, payload)),
    getAdminKey, setAdminKey, clearAdminKey
  };

  global.SipAtsAPI = SipAtsAPI;

  // ---- Demo data (dipakai hanya bila API_URL kosong) ---------------
  function demoResponse_(action, params) {
    switch (action) {
      case 'stats':
        return {
          totalTerdata: 1428,
          kembaliBersekolah: 482,
          persenKembali: 33.7,
          cakupanKecamatan: 14,
          sebaranKecamatan: [
            { kecamatan: 'Tempe', jumlah: 342 },
            { kecamatan: 'Pitumpanua', jumlah: 245 },
            { kecamatan: 'Belawa', jumlah: 198 },
            { kecamatan: 'Maniangpajo', jumlah: 164 },
            { kecamatan: 'Pammana', jumlah: 132 },
            { kecamatan: 'Sabbangparu', jumlah: 115 }
          ],
          faktorPenyebab: [
            { faktor: 'Keterbatasan Ekonomi & Biaya Perlengkapan', jumlah: 628, persen: 44 },
            { faktor: 'Hambatan Akses / Jarak Geografis', jumlah: 314, persen: 22 },
            { faktor: 'Pernikahan Usia Dini', jumlah: 257, persen: 18 },
            { faktor: 'Pekerja Anak / Membantu Orang Tua', jumlah: 229, persen: 16 }
          ],
          usulanBantuan: 272,
          asesmenLapangan: 614
        };
      case 'config':
        return {};
      case 'wilayah':
        return { kecamatan: ['Tempe', 'Pitumpanua', 'Belawa', 'Maniangpajo', 'Pammana', 'Sabbangparu', 'Tanasitolo', 'Majauleng', 'Takkalalla', 'Sajoanging', 'Penrang', 'Bola', 'Keera', 'Gilireng'] };
      case 'directory': {
        let demo = demoDirectoryRows_();
        if (params.kecamatan) demo = demo.filter(r => r.kecamatan === params.kecamatan);
        if (params.status) demo = demo.filter(r => r.statusIntervensi === params.status);
        return { total: demo.length, page: 1, pageSize: 8, totalPages: 1, data: demo };
      }
      case 'checkNik':
        if (String(params.nik).replace(/\D/g, '') === '7372130104090004' || String(params.nik) === '7372 1301 0409 0004') {
          return { found: true, data: demoDirectoryRows_()[0] };
        }
        return { found: false };
      case 'laporkan':
        return { success: true, idTiket: '#WJO-' + new Date().getFullYear() + '-DEMO (mode demo — belum tersimpan ke Sheet)' };
      case 'queue':
        return { total: 3, counts: { SEMUA: 18, PENDING: 12, DITUGASKAN_UPTD: 6, VERIFIKASI_VALID: 0, REJECTED: 0 }, data: demoQueueRows_() };
      case 'updateStatus':
        return { success: true };
      default:
        return { error: 'Aksi demo tidak dikenal: ' + action };
    }
  }

  function demoDirectoryRows_() {
    return [
      { idRegistrasi: 'REG-ATS/WJ-2024/0841', nikTerproteksi: '737213******0004', namaTersamar: 'Ahmad M*****', usia: 14, jenisKelamin: 'Laki-laki', kecamatan: 'Tempe', kelurahanDesa: 'Maddukelleng', faktorKendala: 'Keterbatasan Ekonomi Keluarga', statusIntervensi: 'Binaan UPTD', mitraPendidikan: 'PKBM Al-Ikhlas Tempe' },
      { idRegistrasi: 'REG-ATS/WJ-2024/0842', nikTerproteksi: '731301******0011', namaTersamar: 'Nur A****', usia: 11, jenisKelamin: 'Perempuan', kecamatan: 'Tempe', kelurahanDesa: 'Maddukelleng', faktorKendala: 'Keterbatasan Ekonomi Keluarga', statusIntervensi: 'Verifikasi Valid', mitraPendidikan: '' },
      { idRegistrasi: 'REG-ATS/WJ-2024/0843', nikTerproteksi: '731302******0002', namaTersamar: 'Muhammad F*****', usia: 15, jenisKelamin: 'Laki-laki', kecamatan: 'Maniangpajo', kelurahanDesa: 'Ananbaru', faktorKendala: 'Bekerja Membantu Orang Tua', statusIntervensi: 'Binaan UPTD', mitraPendidikan: '' },
      { idRegistrasi: 'REG-ATS/WJ-2024/0844', nikTerproteksi: '731385******0003', namaTersamar: 'Siti R****', usia: 16, jenisKelamin: 'Perempuan', kecamatan: 'Pitumpanua', kelurahanDesa: 'Siwa', faktorKendala: 'Jarak Akses Sekolah Jauh', statusIntervensi: 'Diusulkan Beasiswa', mitraPendidikan: '' },
      { idRegistrasi: 'REG-ATS/WJ-2024/0845', nikTerproteksi: '731301******0009', namaTersamar: 'Andi H*****', usia: 9, jenisKelamin: 'Laki-laki', kecamatan: 'Tempe', kelurahanDesa: 'Teddaopu', faktorKendala: 'Kebutuhan Pendidikan Inklusi', statusIntervensi: 'Binaan UPTD', mitraPendidikan: '' },
      { idRegistrasi: 'REG-ATS/WJ-2024/0846', nikTerproteksi: '731307******0005', namaTersamar: 'Fitri N*****', usia: 17, jenisKelamin: 'Perempuan', kecamatan: 'Belawa', kelurahanDesa: 'Wele', faktorKendala: 'Pernikahan Dini / Kerentanan Sosial', statusIntervensi: 'Kembali Bersekolah (Paket C)', mitraPendidikan: 'SMP Terbuka Sengkang' },
      { idRegistrasi: 'REG-ATS/WJ-2024/0847', nikTerproteksi: '731304******0006', namaTersamar: 'Reza S*****', usia: 13, jenisKelamin: 'Laki-laki', kecamatan: 'Pammana', kelurahanDesa: 'Kampiri', faktorKendala: 'Putus Kontak / Rawan Ekonomi', statusIntervensi: 'Diusulkan Beasiswa', mitraPendidikan: '' },
      { idRegistrasi: 'REG-ATS/WJ-2024/0848', nikTerproteksi: '731303******0007', namaTersamar: 'Karmila M*****', usia: 8, jenisKelamin: 'Perempuan', kecamatan: 'Sabbangparu', kelurahanDesa: 'Salojampu', faktorKendala: 'Ketiadaan Akta Kelahiran & Dokumen', statusIntervensi: 'Binaan UPTD', mitraPendidikan: '' }
    ];
  }

  function demoQueueRows_() {
    return [
      { ID_Tiket: '#WJO-2025-0481', Timestamp: new Date().toISOString(), NIK_Anak: '7313011405090001', Nama_Anak: 'Andi Muhammad Fadil', Jenis_Kelamin: 'Laki-laki', Tanggal_Lahir: '2011-05-14', Jenjang_Pendidikan_Terakhir: 'Putus Kelas VII SMP', Kecamatan: 'Tempe', Kelurahan_Desa: 'Maddukelleng, Lingk. 3', Alamat_Rinci_Patokan: 'Pesisir Danau Tempe, Pos Perahu Nelayan', Faktor_Penyebab: 'Ekonomi & Beban Keluarga', Catatan_Observasi: 'Terkendala biaya seragam, transportasi air, dan buku. Saat ini ikut membantu orang tua mencari ikan air tawar di Danau Tempe.', Hubungan_Pelapor: 'Ibu Kandung', Nama_Pelapor: 'Ibu Nurhayati', No_WA_Pelapor: '0812-4211-8921', Sumber_Laporan: 'Formulir Publik', Status_SLA: 'PENDING', Ditugaskan_Ke: '', Catatan_Verifikator: '' },
      { ID_Tiket: '#WJO-2025-0480', Timestamp: new Date(Date.now() - 86400000).toISOString(), NIK_Anak: '7313086208110003', Nama_Anak: 'Siti Fatimah Azzahra', Jenis_Kelamin: 'Perempuan', Tanggal_Lahir: '2013-08-22', Jenjang_Pendidikan_Terakhir: 'Belum Lulus SD (Kelas V)', Kecamatan: 'Pitumpanua', Kelurahan_Desa: 'Desa Lauwa, Dusun Bessi RT 02', Alamat_Rinci_Patokan: 'Pesisir Teluk Bone, 600m dari TPI Lauwa', Faktor_Penyebab: 'Geografis & Disabilitas Orang Tua', Catatan_Observasi: 'Jarak sekolah negeri 6.5 km tanpa angkutan umum perintis. Orang tua tunggal sakit disabilitas fisik, anak merawat di rumah.', Hubungan_Pelapor: 'Ketua RT', Nama_Pelapor: 'Pak Ambo Sakka', No_WA_Pelapor: '0853-9912-0044', Sumber_Laporan: 'Kader Posyandu/RT', Status_SLA: 'DITUGASKAN_UPTD', Ditugaskan_Ke: 'UPTD Pitumpanua', Catatan_Verifikator: '' },
      { ID_Tiket: '#WJO-2025-0479', Timestamp: new Date(Date.now() - 172800000).toISOString(), NIK_Anak: '7313042210080005', Nama_Anak: 'Muh. Reski Anugrah', Jenis_Kelamin: 'Laki-laki', Tanggal_Lahir: '2010-10-22', Jenjang_Pendidikan_Terakhir: 'Putus SMA Kelas X', Kecamatan: 'Tanasitolo', Kelurahan_Desa: 'Baru Tancung, RT 01', Alamat_Rinci_Patokan: 'Sentra Pengrajin Tenun Sutera Wajo', Faktor_Penyebab: 'Pekerja Anak / Tenun Tradisional', Catatan_Observasi: 'Bekerja menenun sutera untuk menopang nafkah adik. Berminat tinggi melanjutkan sekolah kesetaraan Program Paket C fleksibel sore/malam.', Hubungan_Pelapor: 'Bibi / Wali Pelapor', Nama_Pelapor: 'Ibu Hasnah', No_WA_Pelapor: '0821-8840-1923', Sumber_Laporan: 'Bot WhatsApp Resmi', Status_SLA: 'VERIFIKASI_VALID', Ditugaskan_Ke: 'PKBM Cendekia', Catatan_Verifikator: 'Siap PKBM Paket C — Rekomendasi Satuan Siap' }
    ];
  }
})(window);
