// spotify-dashboard/src/components/Sidebar.jsx
import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  InputLabel,
  Button as MuiButton,
  Divider,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import {
  // Speed as SpeedIcon,
  EmojiEvents as TrophyIcon,
  Group as TeamIcon,
  Timeline as StatsIcon,
  Email as EmailIcon,
  Dashboard as DashboardIcon,
  Map as MapIcon,
  // People as PeopleIcon,
  // BarChart as BarChartIcon,
  Unsubscribe as UnsubscribeIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { Modal, Form, Input, Checkbox, Space, Select, Button } from "antd";
import { useFilter } from "../context/FilterContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { DRAWER_WIDTH, NAVBAR_HEIGHT } from "../constants/layout";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

const Sidebar = () => {
  const { constructor, setConstructor, season, setSeason } = useFilter();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [showNewsletterPreferences, setShowNewsletterPreferences] =
    useState(false);
  const [newsletterForm] = Form.useForm();

  const handleConstructorChange = (event) => {
    setConstructor(event.target.value);
  };

  const handleSeasonChange = (event) => {
    setSeason(event.target.value);
  };

  const handleNewsletterOpen = () => {
    setShowNewsletterPreferences(true);
  };

  const handleNewsletterClose = () => {
    setShowNewsletterPreferences(false);
  };

  const handleNewsletterPreferences = async (values) => {
    try {
      console.log("Submitting newsletter preferences:", values);
      const response = await axios.post(
        `${API_URL}/save-newsletter-preferences`,
        {
          emailFrequency: values.emailFrequency,
          favoriteDriver: values.favoriteDriver,
          favoriteConstructor: values.favoriteConstructor,
          eventName: values.eventName,
          preferences: {
            f1News: values.preferences?.f1News || false,
            raceUpdates: values.preferences?.raceUpdates || false,
            driverUpdates: values.preferences?.driverUpdates || false,
            teamUpdates: values.preferences?.teamUpdates || false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.status === "success") {
        setShowNewsletterPreferences(false);
        toast.success("Newsletter preferences saved successfully!", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#4CAF50",
            color: "#fff",
          },
        });
      }
    } catch (error) {
      console.error("Newsletter preferences error:", error);
      toast.error("Failed to save newsletter preferences", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#f44336",
          color: "#fff",
        },
      });
    }
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
      <Toaster />
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
                  // sx={{
                  //   "&.Mui-selected": {
                  //     bgcolor: "primary.main",
                  //     "&:hover": {
                  //       bgcolor: "primary.dark",
                  //     },
                  //     "& .MuiListItemIcon-root": {
                  //       color: "white",
                  //     },
                  //     "& .MuiListItemText-root": {
                  //       color: "white",
                  //     },
                  //   },
                  // }}

                  sx={{
                    "&.Mui-selected": {
                      // "& .MuiListItemText-primary": {
                      //   color: "primary.main", // Change text color for active route
                      // },
                    },
                    "&:hover": {
                      "& .MuiListItemText-primary": {
                        color: "inherit", // Darker text color on hover
                      },
                    },
                  }}
                  selected={location.pathname === item.path}
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
            <MuiSelect
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
            </MuiSelect>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="constructor-select-label">Constructor</InputLabel>
            <MuiSelect
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
            </MuiSelect>
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
            <MuiButton
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={<EmailIcon />}
              onClick={handleNewsletterOpen}
            >
              Newsletter
            </MuiButton>
          </ListItem>
          <ListItem>
            <MuiButton
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<UnsubscribeIcon />}
              onClick={handleUnsubscribe}
            >
              Unsubscribe
            </MuiButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Newsletter Preferences Modal */}
      <Modal
        title={
          <Typography style={{ fontSize: "16px", fontWeight: 500 }}>
            Newsletter Preferences
          </Typography>
        }
        open={showNewsletterPreferences}
        onCancel={handleNewsletterClose}
        footer={null}
        width={400}
        style={{ top: 50 }}
      >
        <Form
          form={newsletterForm}
          onFinish={handleNewsletterPreferences}
          layout="vertical"
          style={{
            padding: "20px 0",
          }}
        >
          <Form.Item
            name="emailFrequency"
            label={
              <>
                Email Frequency <span style={{ color: "#ff4d4f" }}>*</span>
              </>
            }
            rules={[
              { required: true, message: "Please select email frequency!" },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Select placeholder="Select frequency">
              <Select.Option value="daily">Daily</Select.Option>
              <Select.Option value="weekly">Weekly</Select.Option>
              <Select.Option value="monthly">Monthly</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="favoriteDriver"
            label={
              <>
                Favorite Driver <span style={{ color: "#ff4d4f" }}>*</span>
              </>
            }
            rules={[
              { required: true, message: "Please enter your favorite driver!" },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input placeholder="e.g., Lewis Hamilton" />
          </Form.Item>

          <Form.Item
            name="favoriteConstructor"
            label={
              <>
                Favorite Constructor <span style={{ color: "#ff4d4f" }}>*</span>
              </>
            }
            rules={[
              {
                required: true,
                message: "Please enter your favorite constructor!",
              },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input placeholder="e.g., Mercedes" />
          </Form.Item>

          <Form.Item
            name="eventName"
            label={
              <>
                Favorite Event <span style={{ color: "#ff4d4f" }}>*</span>
              </>
            }
            rules={[
              { required: true, message: "Please enter your favorite event!" },
            ]}
            style={{ marginBottom: 24 }}
          >
            <Input placeholder="e.g., Monaco Grand Prix" />
          </Form.Item>

          <Typography style={{ marginBottom: "12px" }}>
            Newsletter Preferences
          </Typography>
          <Space
            direction="vertical"
            style={{ width: "100%", marginBottom: 24 }}
          >
            <Form.Item
              name={["preferences", "f1News"]}
              valuePropName="checked"
              noStyle
            >
              <Checkbox>Receive general F1 news and updates</Checkbox>
            </Form.Item>
            <Form.Item
              name={["preferences", "raceUpdates"]}
              valuePropName="checked"
              noStyle
            >
              <Checkbox>Receive race weekend updates and results</Checkbox>
            </Form.Item>
            <Form.Item
              name={["preferences", "driverUpdates"]}
              valuePropName="checked"
              noStyle
            >
              <Checkbox>Receive driver news and updates</Checkbox>
            </Form.Item>
            <Form.Item
              name={["preferences", "teamUpdates"]}
              valuePropName="checked"
              noStyle
            >
              <Checkbox>Receive team news and updates</Checkbox>
            </Form.Item>
          </Space>

          <Space
            style={{ display: "flex", justifyContent: "flex-start", gap: 8 }}
          >
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "#1890ff",
                borderColor: "#1890ff",
              }}
            >
              Save Preferences
            </Button>
            <Button
              onClick={handleNewsletterClose}
              style={{
                borderColor: "#d9d9d9",
              }}
            >
              Skip
            </Button>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default Sidebar;
