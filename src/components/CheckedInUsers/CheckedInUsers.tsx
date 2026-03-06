"use client";
import React from "react";
import { Avatar, Badge, Tooltip, Typography, Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

const { Text } = Typography;

interface CheckedInUser {
    _id: string;
    checkedInAt: string;
    isOpenToMeet: boolean;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        photo: string;
        username: string;
        isOpenToMeet: boolean;
    };
}

interface CheckedInUsersProps {
    coffeeShopId: string;
}

export default function CheckedInUsers({ coffeeShopId }: CheckedInUsersProps) {
    const router = useRouter();

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["checkins", coffeeShopId],
        queryFn: () =>
            axios.get(`/api/checkin/${coffeeShopId}`).then((r) => r.data.checkins as CheckedInUser[]),
        refetchInterval: 30_000,           // re-fetch every 30 seconds
        refetchIntervalInBackground: true, // keep polling even when tab is hidden
        refetchOnWindowFocus: true,        // instantly refresh when user returns to tab
    });

    if (isLoading) return <Spin size="small" />;
    if (!data || data.length === 0) return null;

    const openToMeet = data.filter((c) => c.isOpenToMeet);
    const justHere = data.filter((c) => !c.isOpenToMeet);

    return (
        <div
            style={{
                background: "linear-gradient(135deg, #fff8f0 0%, #fff3e0 100%)",
                border: "1px solid #ffe0b2",
                borderRadius: 16,
                padding: "20px 24px",
                marginTop: 20,
            }}
        >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>📍</span>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Text strong style={{ fontSize: 16, color: "#3d2b1f" }}>
                            {data.length} {data.length === 1 ? "person" : "people"} here right now
                        </Text>
                        {/* Live pulse indicator */}
                        <span
                            title="Live updates every 10 seconds"
                            style={{
                                display: "inline-block",
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: isFetching ? "#faad14" : "#52c41a",
                                boxShadow: isFetching
                                    ? "0 0 0 3px rgba(250,173,20,0.3)"
                                    : "0 0 0 3px rgba(82,196,26,0.3)",
                                transition: "all 0.3s ease",
                                animation: "pulse 2s infinite",
                            }}
                        />
                    </div>
                    {openToMeet.length > 0 && (
                        <div style={{ fontSize: 13, color: "#FF8C00" }}>
                            {openToMeet.length} open to meet new people ☕
                        </div>
                    )}
                </div>
            </div>

            {/* Open to Meet section */}
            {openToMeet.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#FF8C00",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            display: "block",
                            marginBottom: 10,
                        }}
                    >
                        ✨ Open to Meet
                    </Text>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {openToMeet.map((c) => (
                            <Tooltip
                                key={c._id}
                                title={`${c.user.firstName} ${c.user.lastName} — click to view profile`}
                            >
                                <Badge dot color="#52c41a" offset={[-4, 4]}>
                                    <div
                                        style={{ cursor: "pointer", display: "inline-block", transition: "transform 0.2s" }}
                                        onClick={() => router.push(`/profile/${c.user._id}`)}
                                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1.1)")}
                                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
                                    >
                                        <Avatar
                                            src={c.user.photo}
                                            size={52}
                                            style={{
                                                border: "3px solid #FF8C00",
                                                boxShadow: "0 2px 8px rgba(255,140,0,0.3)",
                                            }}
                                        >
                                            {c.user.firstName?.[0]}
                                        </Avatar>
                                    </div>
                                </Badge>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            )}

            {/* Just here section */}
            {justHere.length > 0 && (
                <div>
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#8B6F47",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            display: "block",
                            marginBottom: 10,
                        }}
                    >
                        Also here
                    </Text>
                    <Avatar.Group maxCount={8}>
                        {justHere.map((c) => (
                            <Tooltip
                                key={c._id}
                                title={`${c.user.firstName} ${c.user.lastName}`}
                            >
                                <Avatar
                                    src={c.user.photo}
                                    size={40}
                                    style={{ cursor: "pointer", border: "2px solid #d9cbbf" }}
                                    onClick={() => router.push(`/profile/${c.user._id}`)}
                                >
                                    {c.user.firstName?.[0]}
                                </Avatar>
                            </Tooltip>
                        ))}
                    </Avatar.Group>
                </div>
            )}
        </div>
    );
}
