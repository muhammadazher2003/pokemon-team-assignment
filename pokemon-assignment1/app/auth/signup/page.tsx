"use client";

import { useState } from "react";
import { Button, Form, Input, Select, message } from "antd";
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
    const router= useRouter();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values: any) => {
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      console.log(data.token)
      localStorage.setItem("auth_token", data.token);

        // Optionally: navigate to dashboard
        router.push("/teams");
    } else {
      message.error(data.error || "Signup failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
      <Form layout="vertical" onFinish={handleFinish}>
        <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item name="profileType" label="Profile Type" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="client">Client</Select.Option>
            <Select.Option value="contractor">Contractor</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Sign Up
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
