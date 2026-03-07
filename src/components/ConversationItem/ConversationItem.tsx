"use client";
import React from "react";
import { Avatar, Badge } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface ConversationItemProps {
    conversation: {
        _id: string;
        them: { _id: string; firstName: string; lastName?: string; photo: string; isOpenToMeet: boolean };
        lastMessage?: { content: string; sentAt: string; type: string };
        unread: number;
    };
    isActive?: boolean;
    onClick: () => void;
}

export default function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
    const { them, lastMessage, unread } = conversation;
    const name = `${them.firstName || ""}${them.lastName ? " " + them.lastName : ""}`.trim() || "Coffee Lover";
    const preview = lastMessage?.type === "coffee-invite"
        ? "☕ Sent a coffee date invite"
        : lastMessage?.content ?? "Say hello!";

    return (
        <div
            onClick={onClick}
            style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", cursor: "pointer",
                background: isActive ? "#fff8f0" : "transparent",
                borderLeft: isActive ? "3px solid #FF8C00" : "3px solid transparent",
                borderBottom: "1px solid #f5f0eb",
                transition: "all 0.15s",
            }}
        >
            <Badge count={unread} size="small" color="#FF8C00">
                <div style={{ position: "relative" }}>
                    <Avatar src={them.photo} size={46} style={{ border: "2px solid #f0e6d3" }}>
                        {them.firstName?.[0]}
                    </Avatar>
                    {them.isOpenToMeet && (
                        <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, background: "#52c41a", borderRadius: "50%", border: "2px solid white" }} />
                    )}
                </div>
            </Badge>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: unread > 0 ? 700 : 500, fontSize: 14, color: "#3d2b1f" }}>{name}</span>
                    {lastMessage?.sentAt && (
                        <span style={{ fontSize: 11, color: "#bfbfbf" }}>{dayjs(lastMessage.sentAt).fromNow()}</span>
                    )}
                </div>
                <div style={{
                    fontSize: 13, color: unread > 0 ? "#5a3e2b" : "#8B6F47",
                    fontWeight: unread > 0 ? 600 : 400,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                    {preview}
                </div>
            </div>
        </div>
    );
}
