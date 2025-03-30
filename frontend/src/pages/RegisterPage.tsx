// pages/RegisterPage.tsx
import React, { useState } from 'react';
import { createUser } from '../services/api';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await createUser(username, email, password);
      setMessage(`User ${user.username} registered!`);
    } catch (error: any) {
      console.error(error);
      setMessage("Registration failed.");
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} /><br />
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /><br />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><br />
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
