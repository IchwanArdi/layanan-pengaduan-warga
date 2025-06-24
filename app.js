const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const connectDB = require('./config/db');
const flash = require('connect-flash');
const flashGlobal = require('./middleware/flashGlobal');

dotenv.config();
connectDB();

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parsing data dari form dan JSON
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Menyajikan file statis (CSS, JS, gambar, dll)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/icon', express.static(path.join(__dirname, 'public/img')));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: true,
    // Tidak ada store, akan menggunakan memory store default
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 hari dalam milliseconds
    },
  })
);

// Middleware untuk flash message (pesan sementara seperti notifikasi sukses/gagal)
app.use(flash());
app.use(flashGlobal);

// Routing ke berbagai bagian aplikasi
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));

module.exports = app;
