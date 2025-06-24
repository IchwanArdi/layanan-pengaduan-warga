const CryptoJS = require('crypto-js');

// Secret key untuk enkripsi - sebaiknya disimpan di environment variable
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-change-this-in-production';

/**
 * Enkripsi data menggunakan AES
 * @param {string} text - Text yang akan dienkripsi
 * @returns {string} - Text yang sudah dienkripsi
 */
const encrypt = (text) => {
  if (!text || typeof text !== 'string') {
    return text; // Return original jika bukan string atau kosong
  }

  try {
    const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Error saat enkripsi:', error);
    return text; // Return original jika gagal enkripsi
  }
};

/**
 * Dekripsi data menggunakan AES
 * @param {string} encryptedText - Text yang sudah dienkripsi
 * @returns {string} - Text yang sudah didekripsi
 */
const decrypt = (encryptedText) => {
  if (!encryptedText || typeof encryptedText !== 'string') {
    return encryptedText; // Return original jika bukan string atau kosong
  }

  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);

    // Jika hasil dekripsi kosong, kemungkinan data tidak terenkripsi atau key salah
    if (!originalText) {
      return encryptedText; // Return original data
    }

    return originalText;
  } catch (error) {
    console.error('Error saat dekripsi:', error);
    return encryptedText; // Return original jika gagal dekripsi
  }
};

/**
 * Enkripsi multiple fields dalam object
 * @param {object} data - Object yang berisi data
 * @param {array} fields - Array field names yang akan dienkripsi
 * @returns {object} - Object dengan field yang sudah dienkripsi
 */
const encryptFields = (data, fields) => {
  const encryptedData = { ...data };

  fields.forEach((field) => {
    if (encryptedData[field]) {
      encryptedData[field] = encrypt(encryptedData[field]);
    }
  });

  return encryptedData;
};

/**
 * Dekripsi multiple fields dalam object
 * @param {object} data - Object yang berisi data terenkripsi
 * @param {array} fields - Array field names yang akan didekripsi
 * @returns {object} - Object dengan field yang sudah didekripsi
 */
const decryptFields = (data, fields) => {
  const decryptedData = { ...data };

  fields.forEach((field) => {
    if (decryptedData[field]) {
      decryptedData[field] = decrypt(decryptedData[field]);
    }
  });

  return decryptedData;
};

/**
 * Enkripsi data untuk PengajuanDokumen
 * @param {object} pengajuanData - Data pengajuan dokumen
 * @returns {object} - Data dengan field sensitif terenkripsi
 */
const encryptPengajuanDokumen = (pengajuanData) => {
  const sensitiveFields = ['nik', 'telepon', 'alamat', 'keperluan'];
  return encryptFields(pengajuanData, sensitiveFields);
};

/**
 * Dekripsi data untuk PengajuanDokumen
 * @param {object} pengajuanData - Data pengajuan dokumen terenkripsi
 * @returns {object} - Data dengan field sensitif didekripsi
 */
const decryptPengajuanDokumen = (pengajuanData) => {
  const sensitiveFields = ['nik', 'telepon', 'alamat', 'keperluan'];
  return decryptFields(pengajuanData, sensitiveFields);
};

/**
 * Enkripsi data untuk Pengaduan
 * @param {object} pengaduanData - Data pengaduan
 * @returns {object} - Data dengan field sensitif terenkripsi
 */
const encryptPengaduan = (pengaduanData) => {
  const sensitiveFields = ['deskripsi', 'lokasi'];
  return encryptFields(pengaduanData, sensitiveFields);
};

/**
 * Dekripsi data untuk Pengaduan
 * @param {object} pengaduanData - Data pengaduan terenkripsi
 * @returns {object} - Data dengan field sensitif didekripsi
 */
const decryptPengaduan = (pengaduanData) => {
  const sensitiveFields = ['deskripsi', 'lokasi'];
  return decryptFields(pengaduanData, sensitiveFields);
};

module.exports = {
  encrypt,
  decrypt,
  encryptFields,
  decryptFields,
  encryptPengajuanDokumen,
  decryptPengajuanDokumen,
  encryptPengaduan,
  decryptPengaduan,
};
