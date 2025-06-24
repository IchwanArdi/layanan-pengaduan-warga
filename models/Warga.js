const mongoose = require('mongoose');

const WargaSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  no_hp: {
    type: String,
    required: true,
  },
  rt: {
    type: Number,
    required: true,
  },
  rw: {
    type: Number,
    required: true,
  },
  jalan: {
    type: String,
    required: true,
  },
  nik: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Warga', WargaSchema);
