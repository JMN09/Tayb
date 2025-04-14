// src/components/TopBar.tsx
import React from 'react';
import { Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const TopBar: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2,
        display: 'flex',
        gap: 2,
      }}
    >
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
  );
};

export default TopBar;
