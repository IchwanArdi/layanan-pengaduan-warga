const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const CryptoJS = require('crypto-js');

const secretKey = process.env.SECRET_KEY || 'desa12345';

// Halaman login
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/index');
  }
  res.render('login');
});

// Proses login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render('login', {
        errors: [{ msg: 'Email tidak terdaftar' }],
        email,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render('login', {
        errors: [{ msg: 'Password salah' }],
        email,
      });
    }

    // ✅ Simpan data user ke session
    req.session.user = {
      _id: user._id,
      nama: user.nama,
      email: user.email,
      telepon: user.telepon,
      rt: user.rt,
      rw: user.rw,
    };

    res.redirect('/index');
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', {
      errors: [{ msg: 'Terjadi kesalahan pada server' }],
      email,
    });
  }
});

// Halaman registrasi
router.get('/register', (req, res) => {
  res.render('register');
});

// Proses register
router.post('/register', async (req, res) => {
  const { nama, email, telepon, rt, rw, jalan, nik, password } = req.body; // ✅ Ubah no_hp menjadi telepon
  let errors = [];

  if (password.length < 5) {
    errors.push({ msg: 'Password harus memiliki minimal 5 karakter' });
  }

  if (nik.length !== 16 || isNaN(nik)) {
    errors.push({ msg: 'NIK harus 16 digit angka' });
  }

  if (errors.length > 0) {
    return res.render('register', {
      errors,
      nama,
      email,
      telepon,
      rt,
      rw,
      jalan,
    });
  }

  try {
    // Cek apakah email atau NIK sudah terdaftar
    const userExists = await User.findOne({
      $or: [{ email }, { nik }], // ✅ Cek NIK juga
    });

    if (userExists) {
      errors.push({ msg: 'Email atau NIK sudah terdaftar' });
      return res.render('register', {
        errors,
        nama,
        email,
        telepon,
        rt,
        rw,
        jalan,
      });
    }

    // ✅ Enkripsi NIK dan telepon
    const encryptedNIK = CryptoJS.AES.encrypt(nik, secretKey).toString();
    const encryptedTelepon = CryptoJS.AES.encrypt(telepon, secretKey).toString();

    const hashedPassword = await bcrypt.hash(password, 10);

    const userBaru = new User({
      nama,
      email,
      telepon: encryptedTelepon, // ✅ Gunakan nama field yang konsisten
      rt,
      rw,
      jalan,
      nik: encryptedNIK,
      password: hashedPassword,
    });

    await userBaru.save();

    req.flash('success_msg', 'Anda berhasil registrasi dan dapat login');
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Register error:', err);
    res.render('register', {
      errors: [{ msg: 'Terjadi kesalahan pada server' }],
      nama,
      email,
      telepon,
      rt,
      rw,
      jalan,
    });
  }
});

// Proses Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/index');
    }
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
});

// 404 handler
router.use('/', (req, res) => {
  res.render('404');
});

module.exports = router;
