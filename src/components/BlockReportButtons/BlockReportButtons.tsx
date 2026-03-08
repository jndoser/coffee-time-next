"use client";
import React, { useState } from "react";
import { Button, Modal, Radio, Input, Space, Tooltip, message as antMessage } from "antd";
import { StopOutlined, FlagOutlined, CheckCircleOutlined } from "@ant-design/icons";
import axios from "axios";

const REPORT_REASONS = [
    { value: "spam", label: "🚫 Spam or bot" },
    { value: "harassment", label: "😠 Harassment or bullying" },
    { value: "fake-profile", label: "🎭 Fake or impersonation" },
    { value: "inappropriate-content", label: "⚠️ Inappropriate content" },
    { value: "other", label: "📝 Other" },
];

interface BlockReportButtonsProps {
    targetUserId: string;
    targetName: string;
}

export default function BlockReportButtons({ targetUserId, targetName }: BlockReportButtonsProps) {
    const [blocked, setBlocked] = useState(false);
    const [blockLoading, setBlockLoading] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDetails, setReportDetails] = useState("");
    const [reportLoading, setReportLoading] = useState(false);
    const [reported, setReported] = useState(false);

    const handleBlock = async () => {
        if (blocked) {
            // Unblock
            Modal.confirm({
                title: `Unblock ${targetName}?`,
                content: "They will be able to appear in Discover again.",
                okText: "Unblock",
                cancelText: "Cancel",
                onOk: async () => {
                    setBlockLoading(true);
                    try {
                        await axios.delete("/api/block", { data: { targetUserId } });
                        setBlocked(false);
                        antMessage.success(`${targetName} has been unblocked.`);
                    } finally {
                        setBlockLoading(false);
                    }
                },
            });
        } else {
            Modal.confirm({
                title: `Block ${targetName}?`,
                content: "They won't appear in your Discover feed and won't be able to message you.",
                okText: "Block",
                okButtonProps: { danger: true },
                cancelText: "Cancel",
                onOk: async () => {
                    setBlockLoading(true);
                    try {
                        await axios.post("/api/block", { targetUserId });
                        setBlocked(true);
                        antMessage.success(`${targetName} has been blocked.`);
                    } finally {
                        setBlockLoading(false);
                    }
                },
            });
        }
    };

    const handleReport = async () => {
        if (!reportReason) return;
        setReportLoading(true);
        try {
            await axios.post("/api/report", {
                targetUserId,
                reason: reportReason,
                details: reportDetails,
            });
            setReported(true);
            setReportOpen(false);
            antMessage.success("Report submitted. Our team will review it shortly.");
        } finally {
            setReportLoading(false);
        }
    };

    return (
        <>
            <Space>
                <Tooltip title={blocked ? `Unblock ${targetName}` : `Block ${targetName}`}>
                    <Button
                        id={`block-btn-${targetUserId}`}
                        icon={blocked ? <CheckCircleOutlined /> : <StopOutlined />}
                        loading={blockLoading}
                        onClick={handleBlock}
                        style={{
                            borderRadius: 20,
                            borderColor: blocked ? "#52c41a" : "#ff4d4f",
                            color: blocked ? "#52c41a" : "#ff4d4f",
                        }}
                    >
                        {blocked ? "Unblock" : "Block"}
                    </Button>
                </Tooltip>

                <Tooltip title={reported ? "Already reported" : `Report ${targetName}`}>
                    <Button
                        id={`report-btn-${targetUserId}`}
                        icon={<FlagOutlined />}
                        disabled={reported}
                        onClick={() => setReportOpen(true)}
                        style={{ borderRadius: 20, borderColor: "#faad14", color: "#faad14" }}
                    >
                        {reported ? "Reported" : "Report"}
                    </Button>
                </Tooltip>
            </Space>

            {/* Report modal */}
            <Modal
                title={<span>🚩 Report {targetName}</span>}
                open={reportOpen}
                onCancel={() => setReportOpen(false)}
                onOk={handleReport}
                okText="Submit Report"
                okButtonProps={{
                    loading: reportLoading,
                    disabled: !reportReason,
                    danger: true,
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 0" }}>
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 10, color: "#5a3e2b" }}>
                            Why are you reporting this profile?
                        </div>
                        <Radio.Group
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            style={{ display: "flex", flexDirection: "column", gap: 8 }}
                        >
                            {REPORT_REASONS.map((r) => (
                                <Radio key={r.value} value={r.value}>{r.label}</Radio>
                            ))}
                        </Radio.Group>
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 6, color: "#5a3e2b" }}>
                            Additional details (optional)
                        </div>
                        <Input.TextArea
                            placeholder="Describe the issue..."
                            value={reportDetails}
                            onChange={(e) => setReportDetails(e.target.value)}
                            maxLength={500}
                            rows={3}
                            showCount
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
}
