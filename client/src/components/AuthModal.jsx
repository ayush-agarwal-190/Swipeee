// client/src/components/AuthModal.jsx
import React, { useState } from "react";
import { Modal, Form, Input, Button, notification } from "antd";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "../firebase";

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
        notification.success({ message: "Account created" });
      }
      onClose();
    } catch (err) {
      notification.error({ message: err.message });
    }
    setLoading(false);
  };

  return (
    <Modal
      title={isLogin ? "Login" : "Register"}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form layout="vertical" onFinish={onFinish}>
        {!isLogin && (
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Your Name" />
          </Form.Item>
        )}
        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          {isLogin ? "Login" : "Register"}
        </Button>
        <Button type="link" block onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Need an account? Register" : "Already have an account? Login"}
        </Button>
      </Form>
    </Modal>
  );
}
