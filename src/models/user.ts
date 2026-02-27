import { query } from '../db/index.js';
import type { User } from '../types/index.js';

interface UserRow {
  id: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

function mapRowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createUser(email: string, hashedPassword: string): Promise<User> {
  const result = await query<UserRow>(
    `INSERT INTO users (email, password)
     VALUES ($1, $2)
     RETURNING id, email, password, created_at, updated_at`,
    [email, hashedPassword]
  );

  return mapRowToUser(result.rows[0]);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query<UserRow>(
    `SELECT id, email, password, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToUser(result.rows[0]);
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await query<UserRow>(
    `SELECT id, email, password, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToUser(result.rows[0]);
}
