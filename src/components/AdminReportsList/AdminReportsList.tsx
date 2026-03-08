"use client";
import React, { useState } from "react";
import { Avatar, Badge, Button, Card, Select, Table, Tag, Typography } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

const REASON_LABEL: Record<string, { label: string; color: string }> = {
    spam: { label: "Spam / Bot", color: "orange" },
    harassment: { label: "Harassment", color: "red" },
    "fake-profile": { label: "Fake Profile", color: "purple" },
    "inappropriate-content": { label: "Inappropriate Content", color: "volcano" },
    other: { label: "Other", color: "default" },
};

const STATUS_COLOR: Record<string, string> = {
    pending: "orange",
    reviewed: "green",
    dismissed: "default",
};

export default function AdminReportsList() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-reports"],
        queryFn: () => axios.get("/api/admin/reports").then((r) => r.data.reports),
        refetchInterval: 30_000,
    });

    const updateMutation = useMutation({
        mutationFn: ({ reportId, status }: { reportId: string; status: string }) =>
            axios.patch("/api/admin/reports", { reportId, status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reports"] }),
    });

    const reports = data ?? [];

    const columns = [
        {
            title: "Reporter",
            dataIndex: "reporter",
            key: "reporter",
            render: (u: any) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar src={u?.photo} size={32}>{u?.firstName?.[0]}</Avatar>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{u?.firstName} {u?.lastName}</div>
                        <div style={{ fontSize: 11, color: "#8B6F47" }}>{u?.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Reported User",
            dataIndex: "reported",
            key: "reported",
            render: (u: any) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar src={u?.photo} size={32}>{u?.firstName?.[0]}</Avatar>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{u?.firstName} {u?.lastName}</div>
                        <div style={{ fontSize: 11, color: "#8B6F47" }}>{u?.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Reason",
            dataIndex: "reason",
            key: "reason",
            render: (r: string) => {
                const cfg = REASON_LABEL[r] ?? { label: r, color: "default" };
                return <Tag color={cfg.color}>{cfg.label}</Tag>;
            },
        },
        {
            title: "Details",
            dataIndex: "details",
            key: "details",
            render: (d: string) => <Text style={{ fontSize: 13 }}>{d || "—"}</Text>,
        },
        {
            title: "Submitted",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (d: string) => (
                <Text style={{ fontSize: 13, color: "#8B6F47" }}>{dayjs(d).fromNow()}</Text>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (s: string, record: any) => (
                <Select
                    id={`report-status-${record._id}`}
                    value={s}
                    onChange={(val) => updateMutation.mutate({ reportId: record._id, status: val })}
                    style={{ width: 130 }}
                    options={[
                        { value: "pending", label: <Tag color="orange">Pending</Tag> },
                        { value: "reviewed", label: <Tag color="green">Reviewed</Tag> },
                        { value: "dismissed", label: <Tag color="default">Dismissed</Tag> },
                    ]}
                />
            ),
        },
    ];

    const pending = reports.filter((r: any) => r.status === "pending").length;

    return (
        <div style={{ padding: "0 0 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#3d2b1f" }}>🚩 User Reports</span>
                {pending > 0 && (
                    <Badge count={pending} style={{ background: "#ff4d4f" }} />
                )}
            </div>

            <Card
                style={{ borderRadius: 16, border: "1px solid #f0e6d3" }}
                styles={{ body: { padding: 0 } }}
            >
                <Table
                    dataSource={reports}
                    columns={columns}
                    rowKey="_id"
                    loading={isLoading}
                    pagination={{ pageSize: 20 }}
                    style={{ borderRadius: 16, overflow: "hidden" }}
                    rowClassName={(record: any) =>
                        record.status === "pending" ? "report-row-pending" : ""
                    }
                />
            </Card>
        </div>
    );
}
