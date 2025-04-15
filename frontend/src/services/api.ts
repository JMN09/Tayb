import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export async function createUser(username: string, email: string, password: string, is_restaurant: boolean) {
  const response = await axios.post('http://localhost:8000/users/', {
    username,
    email,
    password,
    is_restaurant
  });
  return response.data;
}

export interface User {
    id: number;
    username: string;
    email: string;
    is_restaurant: boolean;
}

export async function getRestaurants() {
  const res = await fetch('http://localhost:8000/restaurants/');
  return await res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await axios.post('http://localhost:8000/login', { email, password });
  return res.data;        // expected to be the User object
}
