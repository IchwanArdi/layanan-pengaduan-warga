const express = require('express');
const router = express.Router();
const path = require('path');
const Pengaduan = require('../models/Pengaduan');
const PengajuanDokumen = require('../models/PengajuanDokumen');

// Import encryption utilities
const { encryptPengajuanDokumen, decryptPengajuanDokumen, encryptPengaduan, decryptPengaduan } = require('../utils/encryption');

// Middleware untuk cek login
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'Silakan login terlebih dahulu');
    return res.redirect('/auth/login');
  }
  next();
};

// Helper function untuk dekripsi array data
const decryptArrayData = (dataArray, decryptFunction) => {
  return dataArray.map((item) => {
    const itemObj = item.toObject ? item.toObject() : item;
    return decryptFunction(itemObj);
  });
};

// Redirect root ke dashboard
router.get('/', (req, res) => {
  res.redirect('/index');
});

// GET - Halaman dashboard
router.get('/index', requireLogin, async (req, res) => {
  try {
    const userId = req.session.user._id;
    console.log('Dashboard - User ID:', userId);

    // Data Pengaduan
    const totalPengaduan = await Pengaduan.countDocuments({ warga: userId });
    const totalPengaduanProses = await Pengaduan.countDocuments({
      warga: userId,
      status: { $in: ['menunggu', 'proses', 'ditindaklanjuti'] },
    });
    const totalPengaduanSelesai = await Pengaduan.countDocuments({
      warga: userId,
      status: 'selesai',
    });

    // Data Pengajuan Dokumen
    const totalPengajuanDokumen = await PengajuanDokumen.countDocuments({ userId: userId });
    const totalPengajuanDokumenProses = await PengajuanDokumen.countDocuments({
      userId: userId,
      status: { $in: ['pending', 'diproses'] },
    });
    const totalPengajuanDokumenSelesai = await PengajuanDokumen.countDocuments({
      userId: userId,
      status: 'selesai',
    });

    // Data terbaru - dekripsi untuk tampilan
    const pengaduanTerbarulain = await Pengaduan.find({ warga: userId }).sort({ createdAt: -1 }).limit(5);
    const pengajuanDokumenTerbarulain = await PengajuanDokumen.find({ userId: userId }).sort({ createdAt: -1 }).limit(5);

    // Dekripsi data untuk tampilan
    const pengaduanTerbaru = decryptArrayData(pengaduanTerbarulain, decryptPengaduan);
    const pengajuanDokumenTerbaru = decryptArrayData(pengajuanDokumenTerbarulain, decryptPengajuanDokumen);

    console.log('Dashboard stats:', {
      totalPengaduan,
      totalPengaduanProses,
      totalPengaduanSelesai,
      totalPengajuanDokumen,
      totalPengajuanDokumenProses,
      totalPengajuanDokumenSelesai,
      pengaduanTerbaru: pengaduanTerbaru.length,
      pengajuanDokumenTerbaru: pengajuanDokumenTerbaru.length,
    });

    res.render('index', {
      nama: req.session.user.nama || 'User',
      // Data Pengaduan
      totalPengaduan,
      totalPengaduanProses,
      totalPengaduanSelesai,
      pengaduanTerbaru,
      totalPengaduanUser: totalPengaduan,
      totalPengaduanSelesaiUser: totalPengaduanSelesai,
      totalPengaduanProsesUser: totalPengaduanProses,
      // Data Pengajuan Dokumen
      totalPengajuanDokumen,
      totalPengajuanDokumenProses,
      totalPengajuanDokumenSelesai,
      pengajuanDokumenTerbaru,
      totalPengajuanDokumenUser: totalPengajuanDokumen,
      totalPengajuanDokumenSelesaiUser: totalPengajuanDokumenSelesai,
      totalPengajuanDokumenProsesUser: totalPengajuanDokumenProses,
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.render('index', {
      nama: req.session.user?.nama || 'User',
      // Default values untuk pengaduan
      totalPengaduan: 0,
      totalPengaduanProses: 0,
      totalPengaduanSelesai: 0,
      pengaduanTerbaru: [],
      totalPengaduanUser: 0,
      totalPengaduanSelesaiUser: 0,
      totalPengaduanProsesUser: 0,
      // Default values untuk pengajuan dokumen
      totalPengajuanDokumen: 0,
      totalPengajuanDokumenProses: 0,
      totalPengajuanDokumenSelesai: 0,
      pengajuanDokumenTerbaru: [],
      totalPengajuanDokumenUser: 0,
      totalPengajuanDokumenSelesaiUser: 0,
      totalPengajuanDokumenProsesUser: 0,
    });
  }
});

// ========================
// ROUTES PENGADUAN
// ========================

// POST - Submit pengaduan baru
router.post('/pengaduan', requireLogin, async (req, res) => {
  try {
    console.log('=== PENGADUAN SUBMISSION DEBUG ===');
    console.log('Session user:', req.session.user);
    console.log('Request body:', req.body);

    const { judul, kategori, lokasi, deskripsi } = req.body;
    const userId = req.session.user._id;

    console.log('Parsed data:', { judul, kategori, lokasi, deskripsi, userId });

    // Validasi input
    if (!judul || !kategori || !lokasi || !deskripsi) {
      console.log('Validation failed - missing fields');
      req.flash('error', 'Semua field wajib diisi');
      return res.redirect('/index');
    }

    // Validasi userId
    if (!userId) {
      console.log('Validation failed - no user ID');
      req.flash('error', 'Session tidak valid, silakan login ulang');
      return res.redirect('/auth/login');
    }

    // Siapkan data untuk enkripsi
    const pengaduanData = {
      judul: judul.trim(),
      kategori,
      lokasi: lokasi.trim(),
      deskripsi: deskripsi.trim(),
      warga: userId,
      status: 'menunggu',
    };

    // Enkripsi data sensitif
    const encryptedPengaduanData = encryptPengaduan(pengaduanData);

    console.log('Pengaduan object before save (encrypted):', {
      ...encryptedPengaduanData,
      deskripsi: '[ENCRYPTED]',
      lokasi: '[ENCRYPTED]',
    });

    const pengaduanBaru = new Pengaduan(encryptedPengaduanData);
    const savedPengaduan = await pengaduanBaru.save();

    console.log('Pengaduan berhasil disimpan dengan enkripsi');

    req.flash('success', 'Pengaduan berhasil dikirim! Kami akan segera menindaklanjuti laporan Anda.');
    res.redirect('/index');
  } catch (error) {
    console.error('Error saat menyimpan pengaduan:', error);
    console.error('Error stack:', error.stack);

    // Handle specific errors
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map((err) => err.message);
      req.flash('error', 'Validasi gagal: ' + errorMessages.join(', '));
    } else if (error.name === 'CastError') {
      req.flash('error', 'Format data tidak valid');
    } else {
      req.flash('error', 'Terjadi kesalahan saat menyimpan pengaduan. Silakan coba lagi.');
    }

    res.redirect('/index');
  }
});

// GET - Lihat semua pengaduan user
router.get('/pengaduan/riwayat', requireLogin, async (req, res) => {
  try {
    const userId = req.session.user._id;
    console.log('Riwayat - User ID:', userId);

    const pengaduanListEncrypted = await Pengaduan.find({ warga: userId }).sort({ createdAt: -1 });
    console.log('Riwayat - Found pengaduan:', pengaduanListEncrypted.length);

    // Dekripsi data untuk tampilan
    const pengaduanList = decryptArrayData(pengaduanListEncrypted, decryptPengaduan);

    res.render('riwayat-pengaduan', {
      nama: req.session.user.nama,
      pengaduanList,
    });
  } catch (error) {
    console.error('Error mengambil riwayat pengaduan:', error);
    req.flash('error', 'Terjadi kesalahan saat mengambil data pengaduan');
    res.redirect('/index');
  }
});

// GET - Detail pengaduan
router.get('/pengaduan/detail/:id', requireLogin, async (req, res) => {
  try {
    const pengaduanId = req.params.id;
    const userId = req.session.user._id;

    console.log('Detail - Pengaduan ID:', pengaduanId, 'User ID:', userId);

    const pengaduanEncrypted = await Pengaduan.findOne({ _id: pengaduanId, warga: userId });

    if (!pengaduanEncrypted) {
      console.log('Detail - Pengaduan not found');
      req.flash('error', 'Pengaduan tidak ditemukan');
      return res.redirect('/pengaduan/riwayat');
    }

    // Dekripsi data untuk tampilan
    const pengaduan = decryptPengaduan(pengaduanEncrypted.toObject());

    res.render('detail-pengaduan', {
      nama: req.session.user.nama,
      pengaduan,
    });
  } catch (error) {
    console.error('Error mengambil detail pengaduan:', error);
    req.flash('error', 'Terjadi kesalahan saat mengambil detail pengaduan');
    res.redirect('/pengaduan/riwayat');
  }
});

// ========================
// ROUTES PENGAJUAN DOKUMEN
// ========================

// POST - Submit pengajuan dokumen baru
router.post('/dokumen', requireLogin, async (req, res) => {
  try {
    console.log('=== PENGAJUAN DOKUMEN SUBMISSION DEBUG ===');
    console.log('Session user:', req.session.user);
    console.log('Request body:', req.body);

    const { type, name, nik, phone, address, purpose } = req.body;
    const userId = req.session.user._id;

    console.log('Parsed data:', { type, name, nik, phone, address, purpose, userId });

    // Validasi input
    if (!type || !name || !nik || !phone || !address || !purpose) {
      console.log('Validation failed - missing fields');
      req.flash('error', 'Semua field wajib diisi');
      return res.redirect('/index');
    }

    // Validasi userId
    if (!userId) {
      console.log('Validation failed - no user ID');
      req.flash('error', 'Session tidak valid, silakan login ulang');
      return res.redirect('/auth/login');
    }

    // Siapkan data untuk enkripsi
    const pengajuanDokumenData = {
      jenisDokumen: type,
      namaLengkap: name.trim(),
      nik: nik.trim(),
      telepon: phone.trim(),
      alamat: address.trim(),
      keperluan: purpose.trim(),
      userId: userId,
      status: 'pending',
    };

    // Enkripsi data sensitif
    const encryptedPengajuanData = encryptPengajuanDokumen(pengajuanDokumenData);

    console.log('PengajuanDokumen object before save (encrypted):', {
      ...encryptedPengajuanData,
      nik: '[ENCRYPTED]',
      telepon: '[ENCRYPTED]',
      alamat: '[ENCRYPTED]',
      keperluan: '[ENCRYPTED]',
    });

    const pengajuanDokumenBaru = new PengajuanDokumen(encryptedPengajuanData);
    const savedPengajuanDokumen = await pengajuanDokumenBaru.save();

    console.log('PengajuanDokumen berhasil disimpan dengan enkripsi');

    req.flash('success', 'Pengajuan dokumen berhasil dikirim! Kami akan memproses permintaan Anda dalam 1-3 hari kerja.');
    res.redirect('/index');
  } catch (error) {
    console.error('Error saat menyimpan pengajuan dokumen:', error);
    console.error('Error stack:', error.stack);

    // Handle specific errors
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map((err) => err.message);
      req.flash('error', 'Validasi gagal: ' + errorMessages.join(', '));
    } else if (error.name === 'CastError') {
      req.flash('error', 'Format data tidak valid');
    } else if (error.code === 11000) {
      req.flash('error', 'Data sudah ada dalam sistem');
    } else {
      req.flash('error', 'Terjadi kesalahan saat menyimpan pengajuan dokumen. Silakan coba lagi.');
    }

    res.redirect('/index');
  }
});

// GET - Lihat semua pengajuan dokumen user
router.get('/dokumen/riwayat', requireLogin, async (req, res) => {
  try {
    const userId = req.session.user._id;
    console.log('Riwayat Dokumen - User ID:', userId);

    const pengajuanDokumenListEncrypted = await PengajuanDokumen.find({ userId: userId }).sort({ createdAt: -1 });
    console.log('Riwayat Dokumen - Found pengajuan:', pengajuanDokumenListEncrypted.length);

    // Dekripsi data untuk tampilan
    const pengajuanDokumenList = decryptArrayData(pengajuanDokumenListEncrypted, decryptPengajuanDokumen);

    res.render('riwayat-dokumen', {
      nama: req.session.user.nama,
      pengajuanDokumenList,
    });
  } catch (error) {
    console.error('Error mengambil riwayat pengajuan dokumen:', error);
    req.flash('error', 'Terjadi kesalahan saat mengambil data pengajuan dokumen');
    res.redirect('/index');
  }
});

// GET - Detail pengajuan dokumen
router.get('/dokumen/detail/:id', requireLogin, async (req, res) => {
  try {
    const pengajuanId = req.params.id;
    const userId = req.session.user._id;

    console.log('Detail Dokumen - Pengajuan ID:', pengajuanId, 'User ID:', userId);

    const pengajuanDokumenEncrypted = await PengajuanDokumen.findOne({ _id: pengajuanId, userId: userId });

    if (!pengajuanDokumenEncrypted) {
      console.log('Detail Dokumen - Pengajuan not found');
      req.flash('error', 'Pengajuan dokumen tidak ditemukan');
      return res.redirect('/dokumen/riwayat');
    }

    // Dekripsi data untuk tampilan
    const pengajuanDokumen = decryptPengajuanDokumen(pengajuanDokumenEncrypted.toObject());

    res.render('detail-dokumen', {
      nama: req.session.user.nama,
      pengajuanDokumen,
    });
  } catch (error) {
    console.error('Error mengambil detail pengajuan dokumen:', error);
    req.flash('error', 'Terjadi kesalahan saat mengambil detail pengajuan dokumen');
    res.redirect('/dokumen/riwayat');
  }
});

// GET - Download dokumen (jika sudah selesai)
router.get('/dokumen/download/:id', requireLogin, async (req, res) => {
  try {
    const pengajuanId = req.params.id;
    const userId = req.session.user._id;

    console.log('Download Dokumen - Pengajuan ID:', pengajuanId, 'User ID:', userId);

    const pengajuanDokumenEncrypted = await PengajuanDokumen.findOne({
      _id: pengajuanId,
      userId: userId,
      status: 'selesai',
    });

    if (!pengajuanDokumenEncrypted) {
      console.log('Download Dokumen - Pengajuan not found or not completed');
      req.flash('error', 'Dokumen tidak ditemukan atau belum selesai diproses');
      return res.redirect('/dokumen/riwayat');
    }

    // Dekripsi data untuk tampilan
    const pengajuanDokumen = decryptPengajuanDokumen(pengajuanDokumenEncrypted.toObject());

    // TODO: Implement file download logic
    // For now, just redirect back with info message
    req.flash('info', `Dokumen ${pengajuanDokumen.jenisDokumen} dengan nomor ${pengajuanDokumen.nomorSurat} siap diunduh`);
    res.redirect('/dokumen/detail/' + pengajuanId);
  } catch (error) {
    console.error('Error downloading dokumen:', error);
    req.flash('error', 'Terjadi kesalahan saat mengunduh dokumen');
    res.redirect('/dokumen/riwayat');
  }
});

module.exports = router;
