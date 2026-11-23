import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const account = {
  name: process.env.DEMO_CURRICULUM_NAME || "Admin Kurikulum",
  username: (process.env.DEMO_CURRICULUM_USERNAME || "kurikulum").toLowerCase(),
  email: (process.env.DEMO_CURRICULUM_EMAIL || "kurikulum.demo@citra.local").toLowerCase(),
  password: process.env.DEMO_CURRICULUM_PASSWORD || "Kurikulum#2026!",
};

async function createCurriculumAccount() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI tidak ditemukan di .env.local");
  }
  if (account.password.length < 12) {
    throw new Error("Password akun Kurikulum harus memiliki minimal 12 karakter.");
  }

  await mongoose.connect(MONGODB_URI);
  const users = mongoose.connection.db.collection("users");
  const existing = await users.findOne({
    $or: [{ email: account.email }, { username: account.username }],
  });

  if (
    existing &&
    (existing.email !== account.email || existing.username !== account.username)
  ) {
    throw new Error("Email atau username akun Kurikulum sudah digunakan akun lain.");
  }
  if (existing && existing.role !== "Kurikulum") {
    throw new Error("Email atau username tersebut dimiliki role lain.");
  }

  const now = new Date();
  const passwordHash = await bcrypt.hash(account.password, 12);
  await users.updateOne(
    { email: account.email },
    {
      $set: {
        name: account.name,
        username: account.username,
        passwordHash,
        role: "Kurikulum",
        status: "Aktif",
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );

  console.log("Akun Kurikulum aktif berhasil dibuat atau diperbarui:");
  console.log(`Email: ${account.email}`);
  console.log(`Username: ${account.username}`);
  console.log("Password: tersimpan sebagai hash bcrypt");
}

createCurriculumAccount()
  .catch((error) => {
    console.error("Gagal membuat akun Kurikulum:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
