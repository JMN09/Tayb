// src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // previously created
import ChatPage from './pages/ChatPage'
import BrowsePage from './pages/BrowsePage';
import RestaurantPage from './pages/RestaurantPage';
import MapPage from './pages/MapPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/browse" element={<BrowsePage />} /> 
      <Route path="/restaurant/:id" element={<RestaurantPage />} />
      <Route path="/map" element={<MapPage />} />
    </Routes>
  );
}

export default App;
