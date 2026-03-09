import db from '../config/db.ts';

export interface User {
     id: number;
     username: string;
     email: string;
}
export const createUser = async (name: string, email: string, hash: string) => {
     const querytext = `INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email;`;
     const values = [name, email, hash];
     const result = await db.query(querytext, values);
     return result.rows[0];
}

export const findByemail = async (email: string) => {
     const querytext = `Select * from users where email = $1`;
     const values = [email];
     const result = await db.query(querytext, values);
     return result.rows[0];
}

