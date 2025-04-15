import React from "react";
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
  Button,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserAuth from "./UserAuth";

const Navbar = ({ toggleDarkMode, onMenuClick }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  console.log("Navbar rendered, isLoggedIn:", isLoggedIn, "user:", user);

  const handleLiveClick = () => {
    console.log("Live button clicked, isLoggedIn:", isLoggedIn);
    if (isLoggedIn) {
      navigate("/live");
    } else {
      navigate("/login");
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: "100%",
        ml: 0,
        backgroundColor: theme.palette.mode === "dark" ? "#1A1A1A" : "#E10600",
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, color: "white" }}
        >
          F1Pulse
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleLiveClick}
            sx={{
              backgroundColor: isLoggedIn ? "#E10600" : "grey",
              color: "white",
              "&:hover": {
                backgroundColor: isLoggedIn ? "#C10500" : "grey",
              },
            }}
          >
            Live
          </Button>
          <IconButton onClick={toggleDarkMode} color="inherit">
            {theme.palette.mode === "dark" ? (
              <Brightness7Icon />
            ) : (
              <Brightness4Icon />
            )}
          </IconButton>
          <UserAuth />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
