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

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRestaurant, setIsRestaurant] = useState(false);
  const [message, setMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await createUser(username, email, password, isRestaurant) as any;
      setMessage(`User ${user.username} registered!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error(error);
      setMessage('Registration failed.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <div>
      <Navbar />
      <Box
        sx={{
          backgroundColor: 'rgb(252, 251, 241)',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="xs">
          <Paper elevation={3} sx={{ padding: 4, borderRadius: 3 }}>
            <Typography variant="h4" align="center" gutterBottom>
              Register
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={isRestaurant}
                    onChange={(e) => setIsRestaurant(e.target.checked)}
                    color="primary"
                  />
                }
                label="Register as a Restaurant"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  backgroundColor: '#b8d8be',
                  color: '#000',
                  '&:hover': {
                    backgroundColor: '#a0cfae',
                  },
                }}
              >
                Submit
              </Button>
            </form>

            {/* Snackbar Notification */}
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={4000}
              onClose={() => setSnackbarOpen(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert
                onClose={() => setSnackbarOpen(false)}
                severity={snackbarSeverity}
                sx={{ width: '100%' }}
              >
                {message}
              </Alert>
            </Snackbar>
          </Paper>
        </Container>
      </Box>
    </div>
  );
}
