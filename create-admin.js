
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config({
  path: ".env.local"
});

const MONGODB_URI = process.env.MONGODB_URI;

// Konfigurasi akun administrator
const ADMIN = {
  email: "admin2@citra.local",
  username: "admin2",
  password: "AdminBaru123!",
  role: "Admin",
  status: "Aktif"
};

async function createAdmin() {
  try {
    // 1. Periksa koneksi MongoDB
    if (!MONGODB_URI) {
      throw new Error(
        "MONGODB_URI tidak ditemukan di .env.local"
      );
    }

    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB Atlas berhasil terhubung!");

    const db = mongoose.connection.db;
    const users = db.collection("users");

    // 2. Cari akun berdasarkan email dan username
    const existingEmail = await users.findOne({
      email: ADMIN.email
    });

    const existingUsername = await users.findOne({
      username: ADMIN.username
    });

    // 3. Pastikan kedua identitas merujuk ke akun yang sama
    if (!existingEmail || !existingUsername) {
      throw new Error(
        "Akun tidak ditemukan. Periksa email dan username di MongoDB."
      );
    }

    if (
      existingEmail._id.toString() !==
      existingUsername._id.toString()
    ) {
      throw new Error(
        "Email dan username dimiliki akun berbeda. Tidak ada perubahan dilakukan."
      );
    }

    const existing = existingEmail;

    // 4. Lindungi akun admin utama
    if (existing.bootstrap === true) {
      throw new Error(
        "Akun ini adalah admin utama. Perubahan kredensial dibatasi."
      );
    }

    // 5. Hash password baru
    const passwordHash = await bcrypt.hash(
      ADMIN.password,
      12
    );

    // 6. Perbarui akun
    const result = await users.updateOne(
      { _id: existing._id },
      {
        $set: {
          passwordHash: passwordHash,
          role: ADMIN.role,
          status: ADMIN.status,
          updatedAt: new Date()
        },
        $unset: {
          password: ""
        }
      }
    );

    if (result.matchedCount !== 1) {
      throw new Error("Akun gagal diperbarui.");
    }

    // 7. Verifikasi password hash
    const updatedUser = await users.findOne({
      _id: existing._id
    });

    const passwordValid = await bcrypt.compare(
      ADMIN.password,
      updatedUser.passwordHash
    );

    if (!passwordValid) {
      throw new Error(
        "Verifikasi password gagal."
      );
    }

    console.log("\n================================");
    console.log("ADMIN BERHASIL DIPERBARUI");
    console.log("================================");
    console.log("Email    :", updatedUser.email);
    console.log("Username :", updatedUser.username);
    console.log("Role     :", updatedUser.role);
    console.log("Status   :", updatedUser.status);
    console.log("Password :", "Hash bcrypt valid");
    console.log("================================");

  } catch (error) {
    console.error("\nGAGAL:");
    console.error(error.message);

  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("\nKoneksi MongoDB ditutup.");
    }
  }
}

createAdmin();
