const bcrypt = require("bcryptjs");

const email = "admin@citra.local";
const username = "admin";

const passwordHash =
  "$2b$12$pjx5l2XRfAqmgc4azZltfutcGLhppq2WjsFHUqLw/j4FnNtAw00K";

async function checkPassword() {
  const passwordInput = "MASUKKAN_PASSWORD_YANG_INGIN_DICEK";

  const result = await bcrypt.compare(
    passwordInput,
    passwordHash
  );

  console.log("Email:", email);
  console.log("Username:", username);
  console.log("Password cocok:", result);
}

checkPassword();