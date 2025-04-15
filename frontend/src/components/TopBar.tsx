import React from "react";
import { Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Global top bar with auth‑aware actions.
 * Adds a "Browse" button (→ /browse) visible only when the user is logged in.
 */
const TopBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2,
        display: "flex",
        gap: 2,
      }}
    >
      {user ? (
        <>
          <Button
            component={Link}
            to="/browse"
            variant="outlined"
            color="inherit"
          >
            Browse
          </Button>

          <Button component={Link} to="/chat" variant="outlined" color="inherit">
            Tayb.ai
          </Button>

          <Button variant="contained" color="success" onClick={handleLogout}>
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button component={Link} to="/register" variant="outlined" color="inherit">
            Register
          </Button>
          <Button component={Link} to="/login" variant="contained" color="success">
            Login
          </Button>
        </>
      )}
    </Box>
  );
};

export default TopBar;
