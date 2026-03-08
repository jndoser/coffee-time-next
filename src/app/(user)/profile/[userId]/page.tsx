"use client";

import React from "react";
import {
    Tag,
    Card,
    Divider,
    Spin,
    Avatar,
    Badge,
    Tooltip,
    Empty,
} from "antd";
import {
    UserOutlined,
    ClockCircleOutlined,
    HeartOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import BlockReportButtons from "@/components/BlockReportButtons/BlockReportButtons";

dayjs.extend(relativeTime);

interface Props {
    params: { userId: string };
}

const GENDER_ICON: Record<string, string> = {
    male: "👨",
    female: "👩",
    "non-binary": "🧑",
    "prefer-not-to-say": "👤",
};

const LOOKING_FOR_LABEL: Record<string, string> = {
    friends: "👥 Friends",
    "coffee-buddy": "☕ Coffee Buddy",
    dating: "💕 Dating",
    networking: "🤝 Networking",
};

const ROAST_LABEL: Record<string, string> = {
    light: "☀️ Light Roast",
    medium: "🌤️ Medium Roast",
    "medium-dark": "🌥️ Medium-Dark",
    dark: "🌑 Dark Roast",
};

const MILK_LABEL: Record<string, string> = {
    none: "⚫ Black coffee",
    "whole-milk": "🥛 Whole Milk",
    "oat-milk": "🌾 Oat Milk",
    "almond-milk": "🌰 Almond Milk",
    "soy-milk": "🫘 Soy Milk",
    "coconut-milk": "🥥 Coconut Milk",
};

const VISIT_LABEL: Record<string, string> = {
    daily: "Every day ☀️",
    "few-times-a-week": "Few times a week 📅",
    weekends: "Weekends 🎉",
    rarely: "Rarely 🦋",
};

const DRINK_EMOJI: Record<string, string> = {
    espresso: "☕",
    latte: "🥛",
    "cold-brew": "🧊",
    cappuccino: "☁️",
    americano: "🫧",
    "flat-white": "🤍",
    "pour-over": "🫗",
    matcha: "🍵",
    mocha: "🍫",
};

function calcAge(dob?: string): string {
    if (!dob) return "";
    return String(dayjs().diff(dayjs(dob), "year"));
}

export default function UserProfilePage({ params: { userId } }: Props) {
    const { data, isLoading } = useQuery({
        queryKey: ["profile", userId],
        queryFn: () => axios.get(`/api/profile/${userId}`).then((r) => r.data),
        enabled: !!userId,
    });

    if (isLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "60vh",
                }}
            >
                <Spin size="large" tip="Loading profile..." />
            </div>
        );
    }

    if (!data?.user) {
        return (
            <Empty description="User not found" style={{ marginTop: 80 }} />
        );
    }

    const { user, preference } = data;
    const age = calcAge(user.dateOfBirth);
    const displayName = `${user.firstName || ""}${user.lastName ? " " + user.lastName : ""}`.trim() || user.username || "Coffee Lover";

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "320px 1fr",
                gap: 32,
                alignItems: "start",
                padding: "8px 0",
            }}
        >
            {/* ── Left: Photo & Identity ──────────────────────────────── */}
            <div style={{ position: "sticky", top: 24 }}>
                <Card
                    style={{
                        borderRadius: 20,
                        overflow: "hidden",
                        border: "1px solid #f0e6d3",
                        boxShadow: "0 4px 20px rgba(139,95,71,0.10)",
                    }}
                    styles={{ body: { padding: 0 } }}
                >
                    {/* Hero photo */}
                    <div
                        style={{
                            height: 300,
                            background: user.profilePhotos?.[0]?.url
                                ? `url(${user.profilePhotos[0].url}) center/cover`
                                : "linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #FF8C00 100%)",
                            display: "flex",
                            alignItems: "flex-end",
                            padding: 20,
                            position: "relative",
                        }}
                    >
                        {/* Fallback avatar */}
                        {!user.profilePhotos?.[0]?.url && (
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Avatar
                                    src={user.photo}
                                    icon={<UserOutlined />}
                                    size={100}
                                    style={{ border: "4px solid rgba(255,255,255,0.8)" }}
                                />
                            </div>
                        )}

                        {/* Name overlay */}
                        <div style={{ position: "relative", zIndex: 1, color: "white" }}>
                            <div style={{ fontSize: 26, fontWeight: 800, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                                {GENDER_ICON[user.gender] || "👤"} {displayName}{age ? `, ${age}` : ""}
                            </div>
                            {user.isOpenToMeet && (
                                <Badge
                                    status="success"
                                    text={
                                        <span style={{ color: "white", fontSize: 13 }}>Open to meet now</span>
                                    }
                                />
                            )}
                        </div>
                    </div>

                    {/* Secondary photos strip */}
                    {user.profilePhotos?.length > 1 && (
                        <div
                            style={{
                                display: "flex",
                                gap: 4,
                                padding: "8px 12px",
                                overflowX: "auto",
                                backgroundColor: "#fdf7f0",
                            }}
                        >
                            {user.profilePhotos.slice(1).map((p: any, i: number) => (
                                <img
                                    key={i}
                                    src={p.url}
                                    alt={`photo-${i}`}
                                    style={{
                                        width: 60,
                                        height: 60,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                        flexShrink: 0,
                                        cursor: "pointer",
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    <div style={{ padding: "16px 20px 20px" }}>
                        {/* Looking for chip */}
                        {user.lookingFor && (
                            <Tag
                                style={{
                                    backgroundColor: "#FFF3E0",
                                    borderColor: "#FF8C00",
                                    color: "#8B4513",
                                    borderRadius: 20,
                                    padding: "4px 14px",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    marginBottom: 12,
                                }}
                            >
                                {LOOKING_FOR_LABEL[user.lookingFor] || user.lookingFor}
                            </Tag>
                        )}

                        {/* Last active */}
                        {user.lastActiveAt && (
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "#bfbfbf",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    marginBottom: 12,
                                }}
                            >
                                <ClockCircleOutlined />
                                Active {dayjs(user.lastActiveAt).fromNow()}
                            </div>
                        )}

                        {/* Block / Report buttons */}
                        <BlockReportButtons
                            targetUserId={userId}
                            targetName={`${user.firstName || ""}${user.lastName ? " " + user.lastName : ""}`.trim() || "this user"}
                        />
                    </div>
                </Card>
            </div>

            {/* ── Right: Details ──────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Bio */}
                {user.bio && (
                    <Card
                        style={{ borderRadius: 16, border: "1px solid #f0e6d3", boxShadow: "0 2px 10px rgba(139,95,71,0.06)" }}
                        styles={{ body: { padding: "20px 24px" } }}
                    >
                        <div style={{ marginBottom: 8, fontWeight: 700, fontSize: 15, color: "#3d2b1f" }}>
                            About
                        </div>
                        <p style={{ margin: 0, color: "#5a3e2b", lineHeight: 1.7 }}>{user.bio}</p>
                        {user.favoriteQuote && (
                            <div
                                style={{
                                    marginTop: 16,
                                    borderLeft: "3px solid #FF8C00",
                                    paddingLeft: 12,
                                    color: "#8B6F47",
                                    fontStyle: "italic",
                                }}
                            >
                                "{user.favoriteQuote}"
                            </div>
                        )}
                    </Card>
                )}

                {/* Coffee Taste */}
                {preference && (
                    <Card
                        style={{ borderRadius: 16, border: "1px solid #f0e6d3", boxShadow: "0 2px 10px rgba(139,95,71,0.06)" }}
                        styles={{ body: { padding: "20px 24px" } }}
                    >
                        <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 15, color: "#3d2b1f" }}>
                            ☕ Coffee Taste
                        </div>

                        {preference.favoriteDrinks?.length > 0 && (
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ fontSize: 12, color: "#8B6F47", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                    Favorite Drinks
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {preference.favoriteDrinks.map((d: string) => (
                                        <Tag
                                            key={d}
                                            style={{
                                                backgroundColor: "#FFF3E0",
                                                borderColor: "#FF8C00",
                                                color: "#8B4513",
                                                borderRadius: 20,
                                                padding: "3px 12px",
                                            }}
                                        >
                                            {DRINK_EMOJI[d] || "☕"} {d.charAt(0).toUpperCase() + d.slice(1).replace(/-/g, " ")}
                                        </Tag>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                            {preference.roastLevel && (
                                <div>
                                    <div style={{ fontSize: 12, color: "#8B6F47", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Roast</div>
                                    <Tag style={{ borderRadius: 12, borderColor: "#8B4513", color: "#8B4513" }}>
                                        {ROAST_LABEL[preference.roastLevel]}
                                    </Tag>
                                </div>
                            )}
                            {preference.milkPreference && (
                                <div>
                                    <div style={{ fontSize: 12, color: "#8B6F47", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Milk</div>
                                    <Tag style={{ borderRadius: 12 }}>
                                        {MILK_LABEL[preference.milkPreference]}
                                    </Tag>
                                </div>
                            )}
                            {preference.visitFrequency && (
                                <div>
                                    <div style={{ fontSize: 12, color: "#8B6F47", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Visits</div>
                                    <Tag style={{ borderRadius: 12 }}>
                                        {VISIT_LABEL[preference.visitFrequency]}
                                    </Tag>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Hobbies */}
                {user.hobbies?.length > 0 && (
                    <Card
                        style={{ borderRadius: 16, border: "1px solid #f0e6d3", boxShadow: "0 2px 10px rgba(139,95,71,0.06)" }}
                        styles={{ body: { padding: "20px 24px" } }}
                    >
                        <div style={{ marginBottom: 12, fontWeight: 700, fontSize: 15, color: "#3d2b1f" }}>
                            🎨 Hobbies & Interests
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {user.hobbies.map((h: string) => (
                                <Tag
                                    key={h}
                                    style={{
                                        backgroundColor: "#f5f5f5",
                                        border: "1px solid #e8e8e8",
                                        borderRadius: 20,
                                        padding: "4px 14px",
                                        fontSize: 13,
                                        color: "#3d2b1f",
                                    }}
                                >
                                    {h}
                                </Tag>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Empty state if profile not complete */}
                {!user.bio && !preference && !user.hobbies?.length && (
                    <Card style={{ borderRadius: 16, textAlign: "center", padding: "40px 0" }}>
                        <Empty description="This user hasn't completed their profile yet" />
                    </Card>
                )}
            </div>
        </div>
    );
}
