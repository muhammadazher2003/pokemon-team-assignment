"use client";

import { useState } from "react";
import { Button, Form, Input, Select, message } from "antd";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
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
      localStorage.setItem("auth_token", data.token);
      router.push("/teams");
    } else {
      message.error(data.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-950 to-black text-white p-8">
      <div className="w-full max-w-md !bg-gray-800 p-8 !rounded-2xl !shadow-2xl !border !border-gray-700">
        <h2 className="text-3xl font-extrabold !text-cyan-300 text-center mb-6 drop-shadow-lg">
          Sign Up
        </h2>

        <Form layout="vertical" onFinish={handleFinish} className="custom-dark-form">
          <Form.Item
            name="fullName"
            label={<span className="text-gray-300">Full Name</span>}
            rules={[{ required: true }]}
          >
            <Input placeholder="Full Name" />
          </Form.Item>
          

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true }]}
          >
            <Input placeholder="Password" type="password" />
          </Form.Item>
          <Form.Item
            name="profileType"
            label={<span className="!text-gray-300">Profile Type</span>}
            rules={[{ required: true }]}
          >
            <Select className="custom-dark-select" dropdownClassName="custom-dark-dropdown">
              <Select.Option value="client" className="!bg-gray-700 !text-white">
                Client
              </Select.Option>
              <Select.Option value="contractor" className="!bg-gray-700 !text-white">
                Contractor
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="!bg-cyan-500 !hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg shadow-md transition duration-300"
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <p className="text-center text-sm !text-gray-400">
          Already have an account?{" "}
          <a href="/auth/login" className="!text-cyan-400 hover:!underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
