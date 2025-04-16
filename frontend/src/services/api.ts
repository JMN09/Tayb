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

export interface Restaurant {
  id: number;
  name: string;
  image_url: string;
  rating: number;
  location: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  cuisine_id: number;
}

export interface Review {
  id: number;
  content: string;
  rating: number;
  created_at: string;
  user_id: number;
  restaurant_id: number;
  username: string;
}

export async function getRestaurants() {
  const res = await fetch('http://localhost:8000/restaurants/');
  return await res.json();
}

export async function getRestaurantById(id: number): Promise<Restaurant> {
  const res = await fetch(`http://localhost:8000/restaurants/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch restaurant');
  }
  return await res.json();
}

export async function getRestaurantReviews(restaurantId: number): Promise<Review[]> {
  const res = await fetch(`http://localhost:8000/restaurants/${restaurantId}/reviews`);
  if (!res.ok) {
    throw new Error('Failed to fetch reviews');
  }
  return await res.json();
}

export async function postReview(restaurantId: number, content: string, rating: number, userId: number): Promise<Review> {
  const res = await fetch(`http://localhost:8000/restaurants/${restaurantId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      rating,
      user_id: userId
    }),
  });
  
  if (!res.ok) {
    throw new Error('Failed to post review');
  }
  
  return await res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await axios.post('http://localhost:8000/login', { email, password });
  return res.data;        // expected to be the User object
}
