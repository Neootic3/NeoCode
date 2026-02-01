import pkg from "pg";
import dotenv from "dotenv";
const { Pool } = pkg;
dotenv.config()

const pool = new Pool({
  user: 'neon',
  host: '127.0.0.1',
  database: 'NeoDB',
  password: process.env.DB_PASS,
  port: 5432
});

export default pool;