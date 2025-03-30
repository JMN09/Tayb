// App.tsx
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';

function Home() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>Welcome to Tayib</h1>
      <button
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        onClick={() => navigate('/register')}
      >
        Register
      </button>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}
