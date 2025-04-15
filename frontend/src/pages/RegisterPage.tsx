import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert
} from '@mui/material';
import { createUser } from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRestaurant, setIsRestaurant] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'success' as 'success' | 'error' });

  const { login } = useAuth();        // ⬅️ Auth context
  const navigate = useNavigate();     // ⬅️ For redirect

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await createUser(username, email, password, isRestaurant) as any;

      login(user);

      setSnack({ open: true, msg: `Welcome, ${user.username}!`, sev: 'success' });
      setTimeout(() => navigate('/'), 1000);  
    } catch {
      setSnack({ open: true, msg: 'Registration failed.', sev: 'error' });
    }
  };

  return (
    <div>
      <Navbar />
      <Box sx={{ bg: 'rgb(252,251,241)', minHeight: '100vh', display:'flex', justifyContent:'center', alignItems:'center' }}>
        <Container maxWidth="xs">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h4" align="center" gutterBottom>Register</Typography>

            <form onSubmit={handleSubmit}>
              <TextField label="Username" fullWidth margin="normal"
                value={username} onChange={e => setUsername(e.target.value)} />
              <TextField label="Email" type="email" fullWidth margin="normal"
                value={email} onChange={e => setEmail(e.target.value)} />
              <TextField label="Password" type="password" fullWidth margin="normal"
                value={password} onChange={e => setPassword(e.target.value)} />

              <FormControlLabel
                control={<Switch checked={isRestaurant} onChange={e => setIsRestaurant(e.target.checked)} color="primary" />}
                label="Register as a Restaurant"
              />

              <Button type="submit" fullWidth variant="contained"
                sx={{ mt: 3, backgroundColor:'#b8d8be', color:'#000',
                     '&:hover':{ backgroundColor:'#a0cfae' } }}>
                Submit
              </Button>
            </form>
          </Paper>
        </Container>
      </Box>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack({ ...snack, open:false })}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert severity={snack.sev} sx={{ width:'100%' }} onClose={() => setSnack({ ...snack, open:false })}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </div>
  );
}
