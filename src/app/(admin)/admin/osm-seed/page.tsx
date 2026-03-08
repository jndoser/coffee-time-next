"use client";
import React, { useState } from "react";
import { Button, Card, InputNumber, Form, message, Alert, Typography } from "antd";
import { CloudDownloadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title, Paragraph, Text } = Typography;

export default function OSMSeedPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSeed = async (values: { lat: number, lng: number, radiusKm: number }) => {
        setLoading(true);
        setResult(null);
        try {
            const res = await axios.post("/api/admin/seed-osm", {
                lat: values.lat,
                lng: values.lng,
                radiusKm: values.radiusKm
            });
            message.success(res.data.message);
            setResult(res.data);
        } catch (error: any) {
            message.error("Failed to seed OSM data: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 0" }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={3}>🌍 Map Data Seeding</Title>
                <Paragraph style={{ color: "#8B6F47" }}>
                    Tired of looking at an empty map? Use this tool to automatically fetch real-world coffee shops from <b>OpenStreetMap</b> and save them into the Coffee Time database.
                </Paragraph>
            </div>

            <Card style={{ borderRadius: 16 }}>
                <Form
                    layout="vertical"
                    onFinish={handleSeed}
                    initialValues={{ lat: 10.7769, lng: 106.6953, radiusKm: 2 }} // Defaults to Ho Chi Minh City
                >
                    <div style={{ display: "flex", gap: 16 }}>
                        <Form.Item
                            name="lat"
                            label="Latitude"
                            rules={[{ required: true }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber style={{ width: "100%" }} step={0.0001} />
                        </Form.Item>
                        <Form.Item
                            name="lng"
                            label="Longitude"
                            rules={[{ required: true }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber style={{ width: "100%" }} step={0.0001} />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="radiusKm"
                        label="Radius (Kilometers)"
                        rules={[{ required: true }]}
                        help="Keeps queries focused. Max 10km recommended to avoid long load times."
                    >
                        <InputNumber min={0.5} max={10} step={0.5} style={{ width: "100%" }} />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        icon={<CloudDownloadOutlined />}
                        loading={loading}
                        style={{ background: "#FF8C00", border: "none", width: "100%", marginTop: 12, fontWeight: 700 }}
                    >
                        Seed Map Data
                    </Button>
                </Form>
            </Card>

            {result && (
                <Alert
                    message="✅ Seeding Complete"
                    description={
                        <div>
                            Found <b>{result.totalFoundInArea}</b> cafes on OpenStreetMap in this area.<br />
                            {result.message}
                            <br /><br />
                            <Text type="secondary">
                                Note: You will now see these populating the database and they will be visible in the user's Map and Discover feeds.
                            </Text>
                        </div>
                    }
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                    style={{ marginTop: 24, borderRadius: 12 }}
                />
            )}
        </div>
    );
}
