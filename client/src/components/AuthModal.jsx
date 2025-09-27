// Enhanced AuthModal with Google Sign-in
import React, { useState } from "react";
import { Modal, Form, Input, Button, notification, Divider, Space } from "antd";
import { GoogleOutlined, MailOutlined } from "@ant-design/icons";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, googleProvider } from "../firebase";

export default function AuthModal({ visible, onClose }) {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        notification.success({ message: "Login successful" });
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, values.email, values.password);
        await updateProfile(userCred.user, { displayName: values.name });
        notification.success({ message: "Account created successfully" });
      }
      onClose();
    } catch (err) {
      notification.error({ message: err.message });
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      notification.success({ message: "Google sign-in successful" });
      onClose();
    } catch (err) {
      notification.error({ message: err.message });
    }
    setLoading(false);
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 'bold' }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Button
          type="default"
          size="large"
          icon={<GoogleOutlined />}
          onClick={handleGoogleSignIn}
          loading={loading}
          style={{ width: '100%', height: 48 }}
        >
          Continue with Google
        </Button>

        <Divider plain>Or continue with email</Divider>

        <Form layout="vertical" onFinish={onFinish}>
          {!isLogin && (
            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
              <Input prefix={<MailOutlined />} placeholder="Your Name" size="large" />
            </Form.Item>
          )}
          
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password placeholder="Password" size="large" />
          </Form.Item>
          
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            style={{ width: '100%', height: 48, fontSize: 16 }}
          >
            {isLogin ? "Sign In" : "Create Account"}
          </Button>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Button type="link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </div>
      </Space>
    </Modal>
  );
}