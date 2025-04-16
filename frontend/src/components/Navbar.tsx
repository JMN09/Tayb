// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();          // ⬅️ grab state & actions
  const isLoggedIn = Boolean(user);

  return (
    <AppBar position="absolute" color="transparent" elevation={0}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Button component={Link} to="/" color="inherit" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
          Tayb
        </Button>

        {isLoggedIn ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
          {/* NEW browse button */}
          <Button component={Link} to="/browse" variant="outlined" color="inherit">
            Browse
          </Button>
          
          <Button component={Link} to="/map" variant="outlined" color="inherit">
            Map
          </Button>
      
          <Button component={Link} to="/chat" variant="outlined" color="inherit">
            Tayb.ai
          </Button>
          <Button variant="contained" color="success" onClick={logout}>
            Logout
          </Button>
        </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button component={Link} to="/register" variant="outlined" color="inherit">
              Register
            </Button>
            <Button component={Link} to="/login" variant="contained" color="success">
              Login
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
