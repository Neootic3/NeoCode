import jwt from "jsonwebtoken";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "../db.js";

/* =========================
   USER CREATION
========================= */
async function createUser({ username, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);

  const verifyToken = crypto.randomBytes(32).toString('hex');

  const existing = await pool.query(
    "SELECT id FROM users WHERE username=$1 OR email=$2",
    [username, email]
);

  if (existing.rows.length > 0) {
    throw new Error("Username or email already in use");
};

  const result = await pool.query(
    `
    INSERT INTO users (username, email, password_hash, verify_token)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, email
    `,
    [username, email.toLowerCase(), passwordHash, verifyToken]
  );

  return {
    user: result.rows[0],
    verifyToken
  };
};

/* =========================
   LOGIN USER
========================= */
async function loginUser({ email, password }) {
  // 1. Find user
const result = await pool.query(
  "SELECT id, username, email, password_hash, email_verified FROM users WHERE email = $1",
  [email.toLowerCase()]
);

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = result.rows[0];

  // 2. Check password
const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // 3. check email verification
  if (!user.email_verified) {
    throw new Error("Invalid email or password");
  }

  // 4. Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // 5. Return safe user data
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      verified: user.email_verified,
    },
    token,
  };
};

/* =========================
   DELETE USER
========================= */
async function deleteUser(userId) {
  await pool.query(
    'DELETE FROM users WHERE id = $1',
    [userId]
  );
  return true;
};

/* =========================
   UPDATE PROFILE
========================= */
async function updateUser(userId, data) {
  const fields = [];
  const values = [];
  let index = 1;

  if (data.username) {
    fields.push(`username = $${index++}`);
    values.push(data.username);
  }

  if (data.email) {
    fields.push(`email = $${index++}`);
    values.push(data.email);
    fields.push(`email_verified = false`);
  }

  if (data.password) {
    const hash = await bcrypt.hash(data.password, 10);
    fields.push(`password_hash = $${index++}`);
    values.push(hash);
  }

  if (data.profile_image) {
    fields.push(`profile_image = $${index++}`);
    values.push(data.profile_image);
  }

  if (!fields.length) return false;

  values.push(userId);

  await pool.query(
    `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${index}
    `,
    values
  );

  return true;
};

/* =========================
   EMAIL VERIFICATION
========================= */
async function verifyEmail(token) {
  const result = await pool.query(
    `
    UPDATE users
    SET email_verified = true,
        verify_token = NULL
    WHERE verify_token = $1
    RETURNING id
    `,
    [token]
  );

  if (!result.rowCount) return { success: false, user: null };

  return { success: true, user: result.rows[0] };
};

export {
  createUser,
  loginUser,
  deleteUser,
  updateUser,
  verifyEmail
};