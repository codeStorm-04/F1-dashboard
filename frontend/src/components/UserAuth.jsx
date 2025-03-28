// import React, { useState } from "react";
// import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
// import { Dropdown, Modal, Form, Input, Button, message, Checkbox } from "antd";
// import { Box } from "@mui/material";

// const UserAuth = () => {
//   const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
//   const [isSignupModalVisible, setIsSignupModalVisible] = useState(false);
//   const [form] = Form.useForm();
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   const handleLogin = (values) => {
//     // Here you would typically make an API call to authenticate
//     console.log("Login values:", values);
//     setIsLoggedIn(true);
//     setIsLoginModalVisible(false);
//     message.success("Successfully logged in!");
//   };

//   const handleSignup = (values) => {
//     // Here you would typically make an API call to register
//     console.log("Signup values:", values);
//     setIsSignupModalVisible(false);
//     message.success("Successfully registered!");
//   };

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     message.success("Successfully logged out!");
//   };

//   const items = isLoggedIn
//     ? [
//         {
//           key: "profile",
//           label: "Profile",
//           icon: <UserOutlined />,
//         },
//         {
//           key: "logout",
//           label: "Logout",
//           icon: <LogoutOutlined />,
//           onClick: handleLogout,
//         },
//       ]
//     : [
//         {
//           key: "login",
//           label: "Login",
//           onClick: () => setIsLoginModalVisible(true),
//         },
//         {
//           key: "signup",
//           label: "Sign Up",
//           onClick: () => setIsSignupModalVisible(true),
//         },
//       ];

//   return (
//     <Box sx={{ ml: 2 }}>
//       <Dropdown
//         menu={{
//           items,
//         }}
//         placement="bottomRight"
//         trigger={["click"]}
//       >
//         <Button
//           type="text"
//           icon={<UserOutlined style={{ fontSize: "20px" }} />}
//           style={{ color: "white" }}
//         />
//       </Dropdown>

//       <Modal
//         title="Login"
//         open={isLoginModalVisible}
//         onCancel={() => setIsLoginModalVisible(false)}
//         footer={null}
//       >
//         <Form form={form} onFinish={handleLogin} layout="vertical">
//           <Form.Item
//             name="email"
//             label="Email"
//             rules={[
//               { required: true, message: "Please input your email!" },
//               { type: "email", message: "Please enter a valid email!" },
//             ]}
//           >
//             <Input />
//           </Form.Item>

//           <Form.Item
//             name="password"
//             label="Password"
//             rules={[{ required: true, message: "Please input your password!" }]}
//           >
//             <Input.Password />
//           </Form.Item>

//           <Form.Item>
//             <Button type="primary" htmlType="submit" block>
//               Login
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>

//       <Modal
//         title="Sign Up"
//         open={isSignupModalVisible}
//         onCancel={() => setIsSignupModalVisible(false)}
//         footer={null}
//       >
//         <Form form={form} onFinish={handleSignup} layout="vertical">
//           <Form.Item
//             name="name"
//             label="Full Name"
//             rules={[{ required: true, message: "Please input your name!" }]}
//           >
//             <Input />
//           </Form.Item>

//           <Form.Item
//             name="email"
//             label="Email"
//             rules={[
//               { required: true, message: "Please input your email!" },
//               { type: "email", message: "Please enter a valid email!" },
//             ]}
//           >
//             <Input />
//           </Form.Item>

//           <Form.Item
//             name="password"
//             label="Password"
//             rules={[
//               { required: true, message: "Please input your password!" },
//               { min: 6, message: "Password must be at least 6 characters!" },
//             ]}
//           >
//             <Input.Password />
//           </Form.Item>

//           <Form.Item
//             name="confirmPassword"
//             label="Confirm Password"
//             dependencies={["password"]}
//             rules={[
//               { required: true, message: "Please confirm your password!" },
//               ({ getFieldValue }) => ({
//                 validator(_, value) {
//                   if (!value || getFieldValue("password") === value) {
//                     return Promise.resolve();
//                   }
//                   return Promise.reject(new Error("Passwords do not match!"));
//                 },
//               }),
//             ]}
//           >
//             <Input.Password />
//           </Form.Item>

//           <Form.Item
//             name="newsletter"
//             valuePropName="checked"
//             initialValue={false}
//           >
//             <Checkbox>I want to receive F1 newsletter updates</Checkbox>
//           </Form.Item>

//           <Form.Item>
//             <Button type="primary" htmlType="submit" block>
//               Sign Up
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </Box>
//   );
// };

// export default UserAuth;


import React, { useState, useEffect } from "react";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Dropdown, Modal, Form, Input, Button, message, Checkbox } from "antd";
import { Box } from "@mui/material";
import authService from "../services/authService";

const UserAuth = () => {
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isSignupModalVisible, setIsSignupModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (values) => {
    try {
      await authService.login(values.email, values.password);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsLoggedIn(true);
      setIsLoginModalVisible(false);
      message.success("Successfully logged in!");
    } catch (error) {
      message.error(error.message || "Login failed");
    }
  };

  const handleSignup = async (values) => {
    try {
      await authService.register(values.name, values.email, values.password);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsLoggedIn(true);
      setIsSignupModalVisible(false);
      message.success("Successfully registered!");
    } catch (error) {
      message.error(error.message || "Registration failed");
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsLoggedIn(false);
    message.success("Successfully logged out!");
  };

  const items = isLoggedIn
    ? [
        {
          key: "profile",
          label: `Profile (${user?.name})`,
          icon: <UserOutlined />,
        },
        {
          key: "logout",
          label: "Logout",
          icon: <LogoutOutlined />,
          onClick: handleLogout,
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

      <Modal
        title="Login"
        open={isLoginModalVisible}
        onCancel={() => setIsLoginModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleLogin} layout="vertical">
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
        onCancel={() => setIsSignupModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSignup} layout="vertical">
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