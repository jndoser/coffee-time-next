"use client";
import React, { useState } from "react";
import { Button, Tag } from "antd";
import { CheckOutlined, CloseOutlined, CalendarOutlined, ShopOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

interface CoffeeInviteCardProps {
    message: {
        _id: string;
        coffeeInvite: {
            shopName: string;
            proposedTime: string;
            status: "pending" | "accepted" | "declined";
        };
        sender: { _id: string; firstName: string };
    };
    conversationId: string;
    isOwn: boolean; // true if current user sent the invite
    onUpdate?: (updatedMessage: any) => void;
}

const STATUS_CONFIG = {
    pending: { color: "#FF8C00", bg: "#fff8f0", border: "#FFD08A", label: "Waiting for response" },
    accepted: { color: "#52c41a", bg: "#f6ffed", border: "#b7eb8f", label: "Accepted! ☕" },
    declined: { color: "#ff4d4f", bg: "#fff2f0", border: "#ffccc7", label: "Declined" },
};

export default function CoffeeInviteCard({
    message, conversationId, isOwn, onUpdate,
}: CoffeeInviteCardProps) {
    const [loading, setLoading] = useState<"accepted" | "declined" | null>(null);
    const invite = message.coffeeInvite;
    const config = STATUS_CONFIG[invite.status];

    const respond = async (status: "accepted" | "declined") => {
        setLoading(status);
        try {
            const res = await axios.patch(
                `/api/conversations/${conversationId}/coffee-invite`,
                { messageId: message._id, status }
            );
            onUpdate?.(res.data.message);
        } catch {
            // silently fail — socket will update anyway
        } finally {
            setLoading(null);
        }
    };

    return (
        <div style={{
            background: config.bg,
            border: `1.5px solid ${config.border}`,
            borderRadius: 16,
            padding: "14px 16px",
            maxWidth: 280,
            boxShadow: "0 2px 10px rgba(139,95,71,0.10)",
        }}>
            {/* Header */}
            <div style={{ fontSize: 13, color: "#8B6F47", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 18 }}>☕</span>
                <strong style={{ color: "#3d2b1f" }}>Coffee Date Invite</strong>
            </div>

            {/* Shop */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <ShopOutlined style={{ color: "#FF8C00" }} />
                <span style={{ fontWeight: 700, fontSize: 15, color: "#3d2b1f" }}>{invite.shopName}</span>
            </div>

            {/* Time */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <CalendarOutlined style={{ color: "#FF8C00" }} />
                <span style={{ fontSize: 14, color: "#5a3e2b" }}>
                    {dayjs(invite.proposedTime).format("ddd, MMM D · h:mm A")}
                </span>
            </div>

            {/* Status */}
            <div style={{ marginBottom: invite.status === "pending" && !isOwn ? 10 : 0 }}>
                <Tag
                    style={{
                        borderRadius: 20,
                        borderColor: config.border,
                        background: config.bg,
                        color: config.color,
                        fontWeight: 600,
                        fontSize: 12,
                    }}
                >
                    {config.label}
                </Tag>
            </div>

            {/* Accept / Decline buttons — only shown to recipient while pending */}
            {invite.status === "pending" && !isOwn && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <Button
                        id={`decline-invite-${message._id}`}
                        icon={<CloseOutlined />}
                        size="small"
                        loading={loading === "declined"}
                        onClick={() => respond("declined")}
                        style={{ flex: 1, borderRadius: 20, borderColor: "#ff4d4f", color: "#ff4d4f" }}
                    >
                        Decline
                    </Button>
                    <Button
                        id={`accept-invite-${message._id}`}
                        type="primary"
                        icon={<CheckOutlined />}
                        size="small"
                        loading={loading === "accepted"}
                        onClick={() => respond("accepted")}
                        style={{
                            flex: 1, borderRadius: 20,
                            background: "linear-gradient(135deg, #FF8C00, #D2691E)",
                            border: "none",
                        }}
                    >
                        Accept
                    </Button>
                </div>
            )}
        </div>
    );
}
