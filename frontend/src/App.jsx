import React, { useState, useMemo } from "react";
import {
  Box,
  Container,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { FilterProvider } from "./context/FilterContext";
import { Routes, Route } from "react-router-dom";
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import CircuitMap from "./components/CircuitMap";
import Teams from "./components/Teams";
import Races from "./components/Races";
import Statistics from "./components/Statistics";
import Dashboard from "./components/Dashboard";
import UserAuth from "./components/UserAuth";
import {
  DRAWER_WIDTH,
  NAVBAR_HEIGHT,
  CONTENT_MARGIN,
} from "./constants/layout";

const App = () => {
  const [mode, setMode] = useState("dark");
  const [open, setOpen] = useState(true);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#E10600", // F1 red
          },
          secondary: {
            main: "#1F1F1F",
          },
          background: {
            default: mode === "dark" ? "#121212" : "#F5F5F5",
            paper: mode === "dark" ? "#1A1A1A" : "#FFFFFF",
          },
        },
        typography: {
          fontFamily:
            '"Titillium Web", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        components: {
          MuiListItem: {
            styleOverrides: {
              root: {
                "&.Mui-selected": {
                  backgroundColor:
                    mode === "dark"
                      ? "rgba(225, 6, 0, 0.2)"
                      : "rgba(225, 6, 0, 0.1)",
                  "&:hover": {
                    backgroundColor:
                      mode === "dark"
                        ? "rgba(225, 6, 0, 0.3)"
                        : "rgba(225, 6, 0, 0.2)",
                  },
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  const toggleDarkMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <AppBar
          position="fixed"
          sx={{
            width: "100%",
            ml: 0,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              F1 Dashboard
            </Typography>
            <IconButton color="inherit" onClick={toggleDarkMode} sx={{ mr: 2 }}>
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <UserAuth />
          </Toolbar>
        </AppBar>
        <FilterProvider>
          <Sidebar open={open} onClose={handleDrawerToggle} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
              ml: { sm: `${CONTENT_MARGIN}px` },
              mt: `${NAVBAR_HEIGHT}px`,
              transition: theme.transitions.create("margin", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
          >
            <Container maxWidth="xl">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/races" element={<Races />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/circuits" element={<CircuitMap />} />
              </Routes>
            </Container>
          </Box>
        </FilterProvider>
      </Box>
    </ThemeProvider>
  );
};

export default App;
