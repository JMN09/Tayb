import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Navbar: React.FC = () => {
  return (
    <AppBar position="absolute" color="transparent" elevation={0}>
      <Toolbar
        style={{
          display: 'flex',
          justifyContent: 'space-between', // ← changed from flex-end
          width: '100%',
        }}
      >
        {/* Home / Logo Button */}
        <Button
          component={Link}
          to="/"
          color="inherit"
          sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}
        >
          Tayb
        </Button>

        {/* Register / Login buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            to="/register"
            variant="outlined"
            color="inherit"
          >
            Register
          </Button>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            color="success"
          >
            Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
