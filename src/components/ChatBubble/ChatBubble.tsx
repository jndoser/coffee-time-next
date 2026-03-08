"use client";
import React from "react";
import { Avatar } from "antd";
import dayjs from "dayjs";
import CoffeeInviteCard from "@/components/CoffeeInviteCard/CoffeeInviteCard";

interface ChatBubbleProps {
    message: {
        _id: string;
        content: string;
        type: string;
        sender: { _id: string; firstName: string; photo: string };
        createdAt: string;
        coffeeInvite?: {
            shopName: string;
            proposedTime: string;
            status: "pending" | "accepted" | "declined";
        };
    };
    isOwn: boolean;
    conversationId?: string;
    onInviteUpdate?: (updatedMessage: any) => void;
}

export default function ChatBubble({ message, isOwn, conversationId, onInviteUpdate }: ChatBubbleProps) {
    const isCoffeeInvite = message.type === "coffee-invite";

    return (
        <div style={{
            display: "flex",
            flexDirection: isOwn ? "row-reverse" : "row",
            alignItems: "flex-end",
            gap: 8,
            marginBottom: 10,
        }}>
            {/* Avatar — only show for received messages */}
            {!isOwn && (
                <Avatar src={message.sender?.photo} size={28} style={{ flexShrink: 0, border: "1.5px solid #f0e6d3" }}>
                    {message.sender?.firstName?.[0]}
                </Avatar>
            )}

            <div style={{
                maxWidth: isCoffeeInvite ? 300 : "65%",
                display: "flex",
                flexDirection: "column",
                alignItems: isOwn ? "flex-end" : "flex-start",
            }}>
                {isCoffeeInvite && message.coffeeInvite ? (
                    <CoffeeInviteCard
                        message={message as any}
                        conversationId={conversationId ?? ""}
                        isOwn={isOwn}
                        onUpdate={onInviteUpdate}
                    />
                ) : (
                    <div style={{
                        background: isOwn ? "linear-gradient(135deg, #FF8C00, #D2691E)" : "#f5f0eb",
                        color: isOwn ? "white" : "#3d2b1f",
                        borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        padding: "10px 14px",
                        fontSize: 14,
                        lineHeight: 1.5,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        wordBreak: "break-word",
                    }}>
                        {message.content}
                    </div>
                )}
                <span style={{ fontSize: 11, color: "#bfbfbf", marginTop: 3 }}>
                    {dayjs(message.createdAt).format("HH:mm")}
                </span>
            </div>
        </div>
    );
}
