const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config({
  path: ".env.local",
});

const MONGODB_URI = process.env.MONGODB_URI;

const teachers = [
  {
    name: process.env.DEMO_TEACHER_1_NAME || "Ibu Siti Aminah",
    nip: process.env.DEMO_TEACHER_1_NIP || "198005122005012003",
    email: process.env.DEMO_TEACHER_1_EMAIL || "siti.aminah.guru.demo@gmail.com",
    password: process.env.DEMO_TEACHER_1_PASSWORD || "SitiGuru#2026!",
  },
  {
    name: process.env.DEMO_TEACHER_2_NAME || "Bapak Budi Santoso",
    nip: process.env.DEMO_TEACHER_2_NIP || "197508212011012001",
    email: process.env.DEMO_TEACHER_2_EMAIL || "budi.santoso.guru.demo@gmail.com",
    password: process.env.DEMO_TEACHER_2_PASSWORD || "BudiGuru#2026!",
  },
];

async function createTeachers() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI tidak ditemukan di .env.local");
  }

  await mongoose.connect(MONGODB_URI);
  const users = mongoose.connection.db.collection("users");

  for (const teacher of teachers) {
    const passwordHash = await bcrypt.hash(teacher.password, 12);
    await users.updateOne(
      {
        $or: [
          { email: teacher.email },
          { nip: teacher.nip },
        ],
      },
      {
        $set: {
          name: teacher.name,
          email: teacher.email,
          nip: teacher.nip,
          passwordHash,
          role: "Guru",
          status: "Aktif",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  console.log("Akun Guru berhasil dibuat atau diperbarui di MongoDB:");
  for (const teacher of teachers) {
    console.log(`${teacher.name} | ${teacher.email} | NIP: ${teacher.nip}`);
  }

  await mongoose.disconnect();
}

createTeachers().catch(async (error) => {
  console.error("Gagal membuat akun Guru:", error.message);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exitCode = 1;
});
