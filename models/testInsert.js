const mongoose = require('mongoose');
const Pengaduan = require('./Pengaduan');

// Ganti dengan Mongo URI kamu
const mongoURI = 'mongodb+srv://ichwanpwt22:tuZypM0rL2woSfKu@datawarga.6ubwryd.mongodb.net/DataWargaDB?retryWrites=true&w=majority&appName=DataWarga';

// Ganti dengan ID user yang valid dari koleksi User
const userId = '665abc1234567890abcdef01'; // <- ganti sesuai ObjectId user kamu

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('🟢 MongoDB Connected');
    return insertDummyPengaduan();
  })
  .catch((err) => console.error('❌ MongoDB Connection Failed:', err));

async function insertDummyPengaduan() {
  try {
    const pengaduanList = [
      {
        judul: 'Jalan Rusak Parah di RT 03',
        kategori: 'Infrastruktur Jalan',
        lokasi: 'RT 03 RW 05, Jalan Melati',
        deskripsi: 'Sudah lebih dari 1 tahun jalan rusak ini belum diperbaiki.',
        status: 'proses',
        file: '/uploads/jalan-rusak.jpg',
        warga: userId,
        createdAt: new Date('2025-06-20T09:00:00Z'),
      },
      {
        judul: 'Lampu Jalan Mati',
        kategori: 'Fasilitas Umum',
        lokasi: 'Jalan Dahlia No.10',
        deskripsi: 'Lampu jalan mati sudah 3 hari, membuat lingkungan gelap.',
        status: 'ditindaklanjuti',
        file: '/uploads/lampu-jalan.jpg',
        warga: userId,
        createdAt: new Date('2025-06-21T14:30:00Z'),
      },
      {
        judul: 'Sampah Menumpuk',
        kategori: 'Kebersihan Lingkungan',
        lokasi: 'Depan Lapangan RT 02',
        deskripsi: 'Sampah tidak diangkut selama seminggu.',
        status: 'selesai',
        file: '/uploads/sampah.jpg',
        warga: userId,
        createdAt: new Date('2025-06-22T10:15:00Z'),
      },
      {
        judul: 'Gangguan Keamanan Malam Hari',
        kategori: 'Keamanan',
        lokasi: 'Jl. Mawar 1',
        deskripsi: 'Beberapa warga melaporkan adanya orang mencurigakan mondar-mandir.',
        status: 'menunggu',
        file: '/uploads/keamanan.jpg',
        warga: userId,
        createdAt: new Date('2025-06-23T18:45:00Z'),
      },
      {
        judul: 'Antrian Administrasi Terlalu Lama',
        kategori: 'Pelayanan Administrasi',
        lokasi: 'Kantor RW 05',
        deskripsi: 'Proses administrasi terlalu lambat dan tidak efisien.',
        status: 'proses',
        file: '/uploads/antrian.jpg',
        warga: userId,
        createdAt: new Date('2025-06-24T08:10:00Z'),
      },
    ];

    await Pengaduan.insertMany(pengaduanList);
    console.log('✅ Data dummy pengaduan berhasil ditambahkan!');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Gagal insert data dummy:', err.message);
    mongoose.disconnect();
  }
}
