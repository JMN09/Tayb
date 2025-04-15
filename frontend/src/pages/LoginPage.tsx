import React, { useState } from 'react';
import {
  Box, Button, Container, TextField, Typography, Paper,
  Snackbar, Alert
} from '@mui/material';
import { loginUser } from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await loginUser(email, password) as any;   // backend must verify
      login(user);                                     // store in context / localStorage
      setSnack({ open: true, msg: 'Logged‑in successfully!', sev: 'success' });
      setTimeout(() => navigate('/'), 1000);            // 0.5 s, feels natural                                 // optional redirect
    } catch {
      setSnack({ open: true, msg: 'Invalid credentials.', sev: 'error' });
    }
  };

  return (
    <div>
      <Navbar />
      <Box sx={{ bg: 'rgb(252,251,241)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Container maxWidth="xs">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h4" align="center" gutterBottom>Login</Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Email" type="email" fullWidth margin="normal"
                value={email} onChange={e => setEmail(e.target.value)}
              />
              <TextField
                label="Password" type="password" fullWidth margin="normal"
                value={password} onChange={e => setPassword(e.target.value)}
              />
              <Button
                type="submit" fullWidth variant="contained"
                sx={{ mt: 3, backgroundColor: '#b8d8be', color: '#000',
                      '&:hover': { backgroundColor: '#a0cfae' } }}
              >
                Sign in
              </Button>
            </form>
          </Paper>
        </Container>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.sev} sx={{ width: '100%' }} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </div>
  );
}
