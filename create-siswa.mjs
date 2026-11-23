import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const account = {
  name: process.env.DEMO_STUDENT_NAME?.trim(),
  nisn: process.env.DEMO_STUDENT_NISN?.trim(),
  email: process.env.DEMO_STUDENT_EMAIL?.trim().toLowerCase(),
  password: process.env.DEMO_STUDENT_PASSWORD,
  classroomId: process.env.DEMO_STUDENT_CLASSROOM_ID?.trim(),
};

async function createStudentAccount() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI tidak ditemukan di .env.local");
  }
  if (!account.name || !account.nisn || !account.email || !account.password) {
    throw new Error(
      "Isi DEMO_STUDENT_NAME, DEMO_STUDENT_NISN, DEMO_STUDENT_EMAIL, dan DEMO_STUDENT_PASSWORD di .env.local.",
    );
  }
  if (account.password.length < 12 || Buffer.byteLength(account.password, "utf8") > 72) {
    throw new Error("Kata sandi harus memiliki 12-72 byte.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) {
    throw new Error("Format DEMO_STUDENT_EMAIL tidak valid.");
  }
  if (account.classroomId && !/^[\da-f]{24}$/i.test(account.classroomId)) {
    throw new Error("DEMO_STUDENT_CLASSROOM_ID harus berupa ObjectId MongoDB.");
  }

  await mongoose.connect(MONGODB_URI);
  const users = mongoose.connection.db.collection("users");
  const classrooms = mongoose.connection.db.collection("classrooms");
  if (
    account.classroomId &&
    !(await classrooms.findOne({
      _id: new mongoose.Types.ObjectId(account.classroomId),
      status: "Aktif",
    }))
  ) {
    throw new Error("Kelas tidak ditemukan atau tidak aktif.");
  }

  const matches = await users
    .find({ $or: [{ email: account.email }, { nisn: account.nisn }] })
    .toArray();
  if (matches.some((user) => user.role !== "Siswa")) {
    throw new Error("Email atau NISN tersebut sudah digunakan role lain.");
  }
  if (
    matches.length > 1 &&
    matches.some((user) => user._id.toString() !== matches[0]._id.toString())
  ) {
    throw new Error("Email dan NISN menunjuk ke akun siswa yang berbeda.");
  }

  const now = new Date();
  const existingStudent = matches[0];
  const $set = {
    name: account.name,
    email: account.email,
    nisn: account.nisn,
    passwordHash: await bcrypt.hash(account.password, 12),
    role: "Siswa",
    status: "Aktif",
    updatedAt: now,
    ...(account.classroomId
      ? { classroom: new mongoose.Types.ObjectId(account.classroomId) }
      : {}),
  };
  await users.updateOne(
    existingStudent ? { _id: existingStudent._id } : { email: account.email },
    {
      $set,
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );

  console.log(`Akun Siswa aktif siap digunakan: ${account.email} (NISN: ${account.nisn})`);
  console.log("Kata sandi tersimpan sebagai hash bcrypt dan tidak ditampilkan.");
}

createStudentAccount()
  .catch((error) => {
    console.error("Gagal membuat akun Siswa:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
