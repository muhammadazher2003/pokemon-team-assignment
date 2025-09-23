"use client";

import { Form, Input, Button, message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("auth_token", data.token);
        router.push("/teams"); // redirect to teams page
      } else {
        message.error(data.error || "Invalid credentials");
      }
    } catch (err) {
      message.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-950 to-black text-white p-8">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-extrabold text-cyan-300 text-center mb-6 drop-shadow-lg">
          Login
        </h1>

        <Form
          layout="vertical"
          onFinish={onFinish}
          className="custom-dark-form"
        >
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

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="!bg-cyan-500 !hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg shadow-md transition duration-300"
            >
              Log In
            </Button>
          </Form.Item>
        </Form>

        <p className="text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <a href="/auth/signup" className="text-cyan-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
