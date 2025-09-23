"use client";

import { useEffect, useState } from "react";
import { getUserFromToken } from "@/utils/getUserFromToken";
import {
  Card,
  Tabs,
  Table,
  message,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
} from "antd";
import { useRouter } from "next/navigation";

const { Option } = Select;

export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contractors, setContractors] = useState([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [activeTab, setActiveTab] = useState("1");

  const fetchContractors = async () => {
    const res = await fetch("/api/users/contractors");
    const data = await res.json();
    if (res.ok) setContractors(data.contractors);
  };

  const fetchContracts = async () => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch("/api/contracts/user", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) setContracts(data.contracts);
    setLoading(false);
  };

  const markAsCompleted = async (contractId: string) => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch("/api/contracts/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contractId }),
    });
    const data = await res.json();
    if (res.ok) {
      message.success("Marked as completed!");
      fetchContracts();
    } else {
      message.error(data.error);
    }
  };

  const handleAcceptContract = async (contractId: string) => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch("/api/contracts/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contractId }),
    });
    const data = await res.json();
    if (res.ok) {
      message.success("Contract accepted");
      fetchContracts();
    } else {
      message.error(data.error);
    }
  };

  const handleRejectContract = async (contractId: string) => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch("/api/contracts/reject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contractId }),
    });
    const data = await res.json();
    if (res.ok) {
      message.success("Contract rejected");
      fetchContracts();
    } else {
      message.error(data.error);
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchContractors();
    getUserFromToken().then((u) => setUser(u));
  }, []);

  const onFinish = async (values: any) => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch("/api/contracts/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    });

    const data = await res.json();
    if (res.ok) {
      message.success("Contract created!");
      fetchContracts();
      form.resetFields();
      setActiveTab("1");
    } else {
      message.error(data.error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token"); // clear token
    messageApi.success("Logged out successfully");
    router.push("/auth/login"); // redirect to login page (change path if different)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-cyan-300 drop-shadow-lg tracking-wide">
          Contracts Dashboard
        </h1>
        <div className="flex items-center gap-6">
          {user && (
            <p className="text-gray-300 font-medium">
              Balance:{" "}
              <span className="text-green-400 font-bold">
                ${user.profile.balance}
              </span>
            </p>
          )}
          <Button
            type="primary"
            onClick={() => router.push("/teams")}
            className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
          >
            Teams
          </Button>
          <Button
            danger
            ghost
            onClick={handleLogout}
            className="bg-gray-700 text-white hover:bg-gray-600 hover:scale-105 hover:text-red-400 transition-all duration-200"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Card with Tabs */}
      <Card className="custom-dark-card" bodyStyle={{ padding: "1.5rem" }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="custom-dark-tabs"
          items={[
            {
              label: "📂 My Contracts",
              key: "1",
              children: (
                <Table
                  rowKey="_id"
                  loading={loading}
                  dataSource={contracts}
                  pagination={false}
                  className="custom-dark-table"
                  columns={[
                    { title: "Title", dataIndex: "title" },
                    {
                      title: "Status",
                      dataIndex: "status",
                      render: (status) => (
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                            status === "active"
                              ? "bg-blue-600 text-white"
                              : status === "pending"
                              ? "bg-yellow-600 text-white"
                              : status === "completed"
                              ? "bg-green-600 text-white"
                              : "bg-gray-600 text-white"
                          }`}
                        >
                          {status}
                        </span>
                      ),
                    },
                    {
                      title: "Amount",
                      dataIndex: "amount",
                      render: (amount) => (
                        <span className="text-green-400 font-bold">
                          ${amount}
                        </span>
                      ),
                    },
                    {
                      title: "Contractor",
                      render: (_, record) => record.contractorId?.email || "-",
                    },
                    {
                      title: "Actions",
                      render: (_, record) => {
                        const isContractor =
                          user?._id === record.contractorId?._id;
                        return record.status === "active" && isContractor ? (
                          <Button
                            type="primary"
                            onClick={() => markAsCompleted(record._id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark as Completed
                          </Button>
                        ) : record.status === "pending" && isContractor ? (
                          <div className="flex gap-2">
                            <Button
                              type="primary"
                              onClick={() => handleAcceptContract(record._id)}
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              Accept
                            </Button>
                            <Button
                              danger
                              ghost
                              onClick={() => handleRejectContract(record._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : null;
                      },
                    },
                  ]}
                />
              ),
            },
            {
              label: "➕ Create Contract",
              key: "2",
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  className="custom-dark-form"
                >
                  <Form.Item
                    name="contractorId"
                    label="Select Contractor"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="Select a contractor"
                      className="custom-dark-select"
                      dropdownClassName="custom-dark-dropdown"
                    >
                      {contractors.map((c: any) => (
                        <Option key={c.id} value={c.id}>
                          {c.full_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="title"
                    label="Title"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Enter contract title" />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true }]}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Enter contract description"
                    />
                  </Form.Item>

                  <Form.Item
                    name="amount"
                    label="Amount"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      min={1}
                      className="w-full"
                      placeholder="Enter amount"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Create
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
