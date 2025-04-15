// src/components/LoginForm.jsx
// import React from "react";
// import { Form, Input, Button, message } from "antd";
// import { useNavigate } from "react-router-dom";
// import axiosInstance from "../utils/axiosInstance"; // ✅ import your custom instance

// const Login = () => {
//   const navigate = useNavigate();

//   const onFinish = async (values) => {
//     try {
//       // Manually send login request without token by creating a raw axios instance
//       const response = await axiosInstance.post(
//         "/auth/login", // Already prefixed with /api in axiosInstance baseURL
//         {
//           email: values.email,
//           password: values.password,
//         },
//         {
//           headers: {
//             Authorization: "", // ✅ Clear token just in case
//           },
//         }
//       );

//       const { token, user } = response.data;

//       if (token) {
//         localStorage.setItem("token", token);
//         localStorage.setItem("user", JSON.stringify(user));
//         message.success("Login successful!");
//         navigate("/");
//       } else {
//         message.error("Login failed. No token received.");
//       }
//     } catch (error) {
//       const errorMsg =
//         error.response?.data?.message ||
//         "Login failed. Check your credentials.";
//       message.error(errorMsg);
//     }
//   };
import React, { useState } from "react";
// import { UserOutlined, LogoutOutlined, MailOutlined } from "@ant-design/icons";
import { useTheme } from "@mui/material/styles";
import {
  // Dropdown,
  // Modal,
  Form,
  Input,
  Button,
  // Checkbox,
  // Space,
  // Select,
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

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });
  const { handleLogin } = useAuth();
  const [form] = Form.useForm();

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
        console.log(
          "Login successful, calling handleLogin with token and user"
        );
        handleLogin(token, user);
        navigate("/");
        form.resetFields();
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

      form.setFields([
        {
          name: "password",
          errors: ["Invalid credentials"],
        },
      ]);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}>
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
      <Form form={form} onFinish={handleLoginSubmit} layout="vertical">
        <Form.Item
          label={
            <span style={{ color: isDarkMode ? "#fff" : "#000000" }}>
              Email
            </span>
          }
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ color: isDarkMode ? "#fff" : "#000000" }}>
              Password
            </span>
          }
          name="password"
          rules={[
            { required: true, message: "Please input your password!" },
            { min: 6, message: "Password must be at least 6 characters." },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
