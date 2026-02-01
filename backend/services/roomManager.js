import { Pool } from "pg";

const pool = new Pool({
  user: 'neon',
  host: '127.0.0.1',
  database: 'NeoDB',
  password: 'Safaa123',
  port: 5432
});

/* =========================
   STACK DEFINITIONS
========================= */
const STACK_FILES = {
  'js': [
    { filename: 'script.js', language: 'javascript' }
  ],
  'php': [
    { filename: 'index.php', language: 'php' }
  ],
  'ruby': [
    { filename: 'app.rb', language: 'ruby' }
  ]
};

/* =========================
   CREATE ROOM
========================= */
async function createRoom({ ownerId, name, stack }) {
  if (!STACK_FILES[stack]) {
    throw new Error('Unsupported stack');
  }

  const roomRes = await pool.query(
    `
    INSERT INTO rooms (owner_id, name, stack)
    VALUES ($1, $2, $3)
    RETURNING id
    `,
    [ownerId, name, stack]
  );

  const roomId = roomRes.rows[0].id;

  for (const file of STACK_FILES[stack]) {
    await pool.query(
      `
      INSERT INTO room_files (room_id, filename, language)
      VALUES ($1, $2, $3)
      `,
      [roomId, file.filename, file.language]
    );
  }

  return roomId;
}

/* =========================
   GET ROOM + FILES
========================= */
async function getRoom(roomId) {
  const roomRes = await pool.query(
    'SELECT * FROM rooms WHERE id = $1',
    [roomId]
  );

  if (!roomRes.rowCount) return null;

  const filesRes = await pool.query(
    'SELECT * FROM room_files WHERE room_id = $1 ORDER BY id',
    [roomId]
  );

  return {
    ...roomRes.rows[0],
    files: filesRes.rows
  };
}

/* =========================
   UPDATE FILE CONTENT
========================= */
async function updateFile(fileId, content) {
  await pool.query(
    `
    UPDATE room_files
    SET content = $1
    WHERE id = $2
    `,
    [content, fileId]
  );
  return true;
}

/* =========================
   DELETE ROOM
========================= */
async function deleteRoom(roomId, userId) {
  await pool.query(
    `
    DELETE FROM rooms
    WHERE id = $1 AND owner_id = $2
    `,
    [roomId, userId]
  );
  return true;
}

/* =========================
   LIST USER ROOMS
========================= */
async function listUserRooms(userId) {
  const res = await pool.query(
    `
    SELECT id, name, stack, created_at
    FROM rooms
    WHERE owner_id = $1
    ORDER BY created_at DESC
    `,
    [userId]
  );
  return res.rows;
}

export {
  createRoom,
  getRoom,
  updateFile,
  deleteRoom,
  listUserRooms
};