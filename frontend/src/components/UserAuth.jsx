import React, { useState } from "react";
import { UserOutlined, LogoutOutlined, MailOutlined } from "@ant-design/icons";
import {
  Dropdown,
  Modal,
  Form,
  Input,
  Button,
  Checkbox,
  Space,
  Select,
} from "antd";
import { Box } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000/api/auth";

// Configure axios defaults
axios.defaults.withCredentials = true; // Enable sending cookies
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";

// Add request interceptor to add token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Request headers:", config.headers); // Debug log
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.data); // Debug log
    return response;
  },
  (error) => {
    console.error("Response error:", error.response || error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

const UserAuth = () => {
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isSignupModalVisible, setIsSignupModalVisible] = useState(false);
  const [showNewsletterPreferences, setShowNewsletterPreferences] =
    useState(false);
  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });
  const navigate = useNavigate();
  const { isLoggedIn, user, handleLogin, handleLogout } = useAuth();

  const [form] = Form.useForm();
  const [loginForm] = Form.useForm();
  const [signupForm] = Form.useForm();
  const [newsletterForm] = Form.useForm();

  const showFlashMessage = (type, message) => {
    setFlashMessage({ type, message });
    setTimeout(() => {
      setFlashMessage({ type: "", message: "" });
    }, 3000);
  };

  const handleLoginSubmit = async (values) => {
    try {
      console.log("Attempting login with values:", {
        ...values,
        password: "[HIDDEN]",
      });

      // Clear any existing token
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];

      const response = await axios.post(
        `${API_URL}/login`,
        {
          email: values.email,
          password: values.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          withCredentials: true,
        }
      );

      console.log("Login response:", response.data);

      if (response.data.status === "success" && response.data.data?.token) {
        const { token, user } = response.data.data;
        handleLogin(token, user);
        setIsLoginModalVisible(false);
        loginForm.resetFields();
        showFlashMessage("success", "Successfully logged in! Welcome back!");
      } else {
        console.error("Invalid response structure:", response.data);
        throw new Error(
          response.data.message || "Invalid response from server"
        );
      }
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      showFlashMessage(
        "error",
        error.response?.data?.message ||
          "Failed to login. Please check your credentials."
      );

      loginForm.setFields([
        {
          name: "password",
          errors: ["Invalid credentials"],
        },
      ]);
    }
  };

  const handleSignup = async (values) => {
    try {
      console.log("Attempting signup with values:", {
        ...values,
        password: "[HIDDEN]",
      });
      const response = await axios.post(`${API_URL}/register`, {
        name: values.name,
        email: values.email,
        password: values.password,
        newsletter: values.newsletter,
      });

      console.log("Signup response:", response.data);

      if (response.data.status === "success" && response.data.data?.token) {
        const { token, user } = response.data.data;
        handleLogin(token, user);
        setIsSignupModalVisible(false);
        signupForm.resetFields();

        // If user opted for newsletter, show preferences form
        if (user.newsletter) {
          setShowNewsletterPreferences(true);
        } else {
          showFlashMessage(
            "success",
            "Successfully registered! Welcome to F1 Dashboard!"
          );
        }
      } else {
        throw new Error(
          response.data.message || "Invalid response from server"
        );
      }
    } catch (error) {
      console.error("Signup error:", error.response || error);
      showFlashMessage(
        "error",
        error.response?.data?.message || "Failed to register. Please try again."
      );
    }
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
        showFlashMessage(
          "success",
          "Newsletter preferences saved successfully!"
        );
      }
    } catch (error) {
      console.error("Newsletter preferences error:", error);
      showFlashMessage("error", "Failed to save newsletter preferences");
    }
  };

  const handleLogoutClick = async () => {
    await handleLogout();
    navigate("/");
    showFlashMessage("success", "Successfully logged out! See you next time!");
  };

  const handleModalClose = (type) => {
    if (type === "login") {
      setIsLoginModalVisible(false);
      loginForm.resetFields();
    } else {
      setIsSignupModalVisible(false);
      signupForm.resetFields();
    }
  };

  const items = isLoggedIn
    ? [
        {
          key: "profile",
          label: user?.name || "Profile",
          icon: <UserOutlined />,
        },
        {
          key: "logout",
          label: "Logout",
          icon: <LogoutOutlined />,
          onClick: handleLogoutClick,
        },
      ]
    : [
        {
          key: "login",
          label: "Login",
          onClick: () => setIsLoginModalVisible(true),
        },
        {
          key: "signup",
          label: "Sign Up",
          onClick: () => setIsSignupModalVisible(true),
        },
      ];

  return (
    <Box sx={{ ml: 2 }}>
      {flashMessage.message && (
        <div
          className={`alert alert-${flashMessage.type} alert-dismissible fade show`}
          role="alert"
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            minWidth: "300px",
            textAlign: "center",
          }}
        >
          {flashMessage.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFlashMessage({ type: "", message: "" })}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          ></button>
        </div>
      )}
      <Dropdown
        menu={{
          items,
        }}
        placement="bottomRight"
        trigger={["click"]}
      >
        <Button
          type="text"
          icon={<UserOutlined style={{ fontSize: "20px" }} />}
          style={{ color: "white" }}
        />
      </Dropdown>

      {/* Newsletter Preferences Modal */}
      <Modal
        title="Newsletter Preferences"
        open={showNewsletterPreferences}
        onCancel={() => setShowNewsletterPreferences(false)}
        footer={null}
      >
        <Form
          form={newsletterForm}
          onFinish={handleNewsletterPreferences}
          layout="vertical"
        >
          <Form.Item
            name="emailFrequency"
            label="Email Frequency"
            rules={[
              { required: true, message: "Please select email frequency!" },
            ]}
          >
            <Select>
              <Select.Option value="daily">Daily</Select.Option>
              <Select.Option value="weekly">Weekly</Select.Option>
              <Select.Option value="monthly">Monthly</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="favoriteDriver"
            label="Favorite Driver"
            rules={[
              { required: true, message: "Please enter your favorite driver!" },
            ]}
          >
            <Input placeholder="e.g., Lewis Hamilton" />
          </Form.Item>

          <Form.Item
            name="favoriteConstructor"
            label="Favorite Constructor"
            rules={[
              {
                required: true,
                message: "Please enter your favorite constructor!",
              },
            ]}
          >
            <Input placeholder="e.g., Mercedes" />
          </Form.Item>

          <Form.Item
            name="eventName"
            label="Favorite Event"
            rules={[
              { required: true, message: "Please enter your favorite event!" },
            ]}
          >
            <Input placeholder="e.g., Monaco Grand Prix" />
          </Form.Item>

          <Form.Item label="Newsletter Preferences">
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
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Save Preferences
              </Button>
              <Button onClick={() => setShowNewsletterPreferences(false)}>
                Skip
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Login"
        open={isLoginModalVisible}
        onCancel={() => handleModalClose("login")}
        footer={null}
      >
        <Form form={loginForm} onFinish={handleLoginSubmit} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Sign Up"
        open={isSignupModalVisible}
        onCancel={() => handleModalClose("signup")}
        footer={null}
      >
        <Form form={signupForm} onFinish={handleSignup} layout="vertical">
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please input your name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="newsletter"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox>I want to receive F1 newsletter updates</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Sign Up
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Box>
  );
};

export default UserAuth;
