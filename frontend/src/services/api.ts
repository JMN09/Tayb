import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export async function createUser(
  username: string,
  email: string,
  password: string
): Promise<User> {
  const res = await axios.post<User>(`${API_BASE}/users/`, {
    username,
    email,
    password,
  });
  return res.data;
}

export interface User {
    id: number;
    username: string;
    email: string;
}