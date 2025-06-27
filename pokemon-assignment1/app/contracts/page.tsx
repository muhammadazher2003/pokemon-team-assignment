"use client"

import { useEffect, useState } from "react"
import { getUserFromToken } from "@/utils/getUserFromToken"
import { Card, Tabs, Table, message, Form, Input, InputNumber, Button, Select } from "antd"
import { useRouter } from "next/navigation"


// Then inside your accept/reject functions


const { Option } = Select

export default function ContractsPage() {
    const [contracts, setContracts] = useState([])
    const [loading, setLoading] = useState(true)
    const [contractors, setContractors] = useState([])
    const [user, setUser] = useState(null)
    const router = useRouter()
    const [form] = Form.useForm()
    const [activeTab, setActiveTab] = useState("1")



    const fetchContractors = async () => {
        const res = await fetch("/api/users/contractors")
        const data = await res.json()
        if (res.ok) {
            console.log(data)
            setContractors(data.contractors)
        }
    }

    const markAsCompleted = async (contractId: string) => {
        const token = localStorage.getItem("auth_token")
        const res = await fetch("/api/contracts/complete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ contractId }),
        })

        const data = await res.json()
        if (res.ok) {
            message.success("Marked as completed!")
            fetchContracts()
        } else {
            message.error(data.error)
        }
    }


    const fetchContracts = async () => {
        const token = localStorage.getItem("auth_token")
        const res = await fetch("/api/contracts/user", {
            headers: { Authorization: `Bearer ${token}` },
        })

        const data = await res.json()
        if (res.ok) {
            setContracts(data.contracts)
        }
        setLoading(false)
    }

    const handleAcceptContract = async (contractId: string) => {
        try {
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
                fetchContracts() // Or refetch data from server
            } else {
                message.error(data.error || "Failed to accept contract");
            }
        } catch (err) {
            console.error(err);
            message.error("Something went wrong");
        }
    };

    const handleRejectContract = async (contractId: string) => {
        try {
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
                fetchContracts() // Or refetch data from server
            } else {
                message.error(data.error || "Failed to reject contract");
            }
        } catch (err) {
            console.error(err);
            message.error("Something went wrong");
        }
    };


    useEffect(() => {
        fetchContracts()
        fetchContractors()
        getUserFromToken().then((user) => {
            console.log(user)
            setUser(user)
        });
    }, [])

    const onFinish = async (values: any) => {
        const token = localStorage.getItem("auth_token")
        const res = await fetch("/api/contracts/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(values),
        })

        const data = await res.json()
        if (res.ok) {
            message.success("Contract created!")
            fetchContracts()
            form.resetFields() // ✅ clear form
            setActiveTab("1")
        } else {
            message.error(data.error)
        }
    }

    // if (!user) return <p>Loading...</p>

    return (
        <>
            <div className="flex justify-end items-center p-4 border-b">
                {user && (
                    <p className="text-gray-700 font-medium mr-6">
                        Balance: <span className="text-green-600">${user.profile.balance}</span>
                    </p>
                )}
                <Button type="default" onClick={() => router.push("/teams")}>
                    Teams
                </Button>
            </div>
            <Card title="Contracts">
                <Tabs
                    defaultActiveKey="1"
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            label: "My Contracts",
                            key: "1",
                            children: (
                                <Table
                                    rowKey="_id"
                                    loading={loading}
                                    dataSource={contracts}
                                    columns={[
                                        { title: "Title", dataIndex: "title" },
                                        { title: "Status", dataIndex: "status" },
                                        { title: "Amount", dataIndex: "amount" },
                                        {
                                            title: "Contractor",
                                            render: (_, record) => record.contractorId?.email || "-",
                                        },
                                        {
                                            title: "Actions",
                                            render: (_, record) => {
                                                const isContractor = user?._id === record.contractorId?._id;
                                                console.log(isContractor)
                                                return record.status === "active" && isContractor ? (
                                                    <Button type="primary" onClick={() => markAsCompleted(record._id)}>
                                                        Mark as Completed
                                                    </Button>
                                                ) : record.status === "pending" && isContractor ? (
                                                    <div className="flex gap-2">
                                                        <Button type="primary" onClick={() => handleAcceptContract(record._id)}>
                                                            Accept
                                                        </Button>
                                                        <Button danger onClick={() => handleRejectContract(record._id)}>
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
                            label: "Create Contract",
                            key: "2",
                            children: (
                                <Form form={form} layout="vertical" onFinish={onFinish}>
                                    <Form.Item
                                        name="contractorId"
                                        label="Select Contractor"
                                        rules={[{ required: true }]}
                                    >
                                        <Select placeholder="Select a contractor">
                                            {contractors.map((c: any) => (
                                                <Option key={c.id} value={c.id}>
                                                    {c.full_name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                                        <Input.TextArea />
                                    </Form.Item>
                                    <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                                        <InputNumber min={1} />
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
            </Card></>
    )
}
