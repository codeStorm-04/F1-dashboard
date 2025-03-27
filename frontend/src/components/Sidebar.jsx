// spotify-dashboard/src/components/Sidebar.jsx
import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import {
  Speed as SpeedIcon,
  EmojiEvents as TrophyIcon,
  Group as TeamIcon,
  Timeline as StatsIcon,
  Email as EmailIcon,
  Dashboard as DashboardIcon,
  Map as MapIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Unsubscribe as UnsubscribeIcon,
} from "@mui/icons-material";
import { useFilter } from "../context/FilterContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { DRAWER_WIDTH, NAVBAR_HEIGHT } from "../constants/layout";
import NewsletterForm from "./NewsletterForm";

const Sidebar = () => {
  const { constructor, setConstructor, season, setSeason } = useFilter();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  const handleConstructorChange = (event) => {
    setConstructor(event.target.value);
  };

  const handleSeasonChange = (event) => {
    setSeason(event.target.value);
  };

  const handleNewsletterOpen = () => {
    setNewsletterOpen(true);
  };

  const handleNewsletterClose = () => {
    setNewsletterOpen(false);
  };

  const handleUnsubscribe = () => {
    // Here you would typically handle the unsubscribe logic
    console.log("Unsubscribe clicked");
  };

  const menuItems = [
    { text: "Overview", icon: <DashboardIcon />, path: "/" },
    { text: "Circuits", icon: <MapIcon />, path: "/circuits" },
    { text: "Races", icon: <TrophyIcon />, path: "/races" },
    { text: "Teams", icon: <TeamIcon />, path: "/teams" },
    { text: "Statistics", icon: <StatsIcon />, path: "/statistics" },
  ];

  const constructorOptions = [
    { value: "all", label: "All Teams" },
    { value: "mercedes", label: "Mercedes" },
    { value: "red_bull", label: "Red Bull" },
    { value: "ferrari", label: "Ferrari" },
    { value: "mclaren", label: "McLaren" },
  ];

  const seasonOptions = [
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" },
    { value: "2022", label: "2022" },
    { value: "2021", label: "2021" },
  ];

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            mt: `${NAVBAR_HEIGHT}px`,
          },
        }}
      >
        <Box sx={{ overflow: "auto", mt: 2 }}>
          {/* <Typography variant="h6" sx={{ px: 2, mb: 2 }}>
            F1 Dashboard
          </Typography> */}
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.text}
                disablePadding
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
              >
                <ListItemButton
                  sx={{
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                      "& .MuiListItemIcon-root": {
                        color: "white",
                      },
                      "& .MuiListItemText-root": {
                        color: "white",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color:
                        theme.palette.mode === "dark" ? "white" : "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      color:
                        theme.palette.mode === "dark" ? "white" : "inherit",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Filters
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="season-select-label">Season</InputLabel>
            <Select
              labelId="season-select-label"
              id="season-select"
              value={season}
              label="Season"
              onChange={handleSeasonChange}
            >
              {seasonOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="constructor-select-label">Constructor</InputLabel>
            <Select
              labelId="constructor-select-label"
              id="constructor-select"
              value={constructor}
              label="Constructor"
              onChange={handleConstructorChange}
            >
              {constructorOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider />

        <List>
          <ListItem>
            <Typography variant="subtitle2" color="textSecondary">
              Preferences
            </Typography>
          </ListItem>
          <ListItem>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={<EmailIcon />}
              onClick={handleNewsletterOpen}
            >
              Newsletter
            </Button>
          </ListItem>
          <ListItem>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<UnsubscribeIcon />}
              onClick={handleUnsubscribe}
            >
              Unsubscribe
            </Button>
          </ListItem>
        </List>
      </Drawer>
      <NewsletterForm open={newsletterOpen} onClose={handleNewsletterClose} />
    </>
  );
};

export default Sidebar;
