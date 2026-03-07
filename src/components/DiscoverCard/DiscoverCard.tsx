"use client";
import React, { useState } from "react";
import { Avatar, Badge, Button, Tag, Tooltip } from "antd";
import { HeartOutlined, CloseOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const DRINK_EMOJI: Record<string, string> = {
    espresso: "☕", latte: "🥛", "cold-brew": "🧊", cappuccino: "☁️",
    americano: "🫧", "flat-white": "🤍", "pour-over": "🫗", matcha: "🍵", mocha: "🍫",
};
const GENDER_ICON: Record<string, string> = {
    male: "👨", female: "👩", "non-binary": "🧑", "prefer-not-to-say": "👤",
};
const LOOKING_FOR_LABEL: Record<string, string> = {
    friends: "👥 Friends", "coffee-buddy": "☕ Coffee Buddy",
    dating: "💕 Dating", networking: "🤝 Networking",
};

interface DiscoverCardProps {
    user: any;
    preference: any;
    matchScore: number;
    commonDrinks: string[];
    onLike: () => void;
    onPass: () => void;
    loading?: boolean;
}

function calcAge(dob?: string) {
    if (!dob) return null;
    return dayjs().diff(dayjs(dob), "year");
}

export default function DiscoverCard({
    user, preference, matchScore, commonDrinks, onLike, onPass, loading,
}: DiscoverCardProps) {
    const router = useRouter();
    const [imgIdx, setImgIdx] = useState(0);
    const photos: any[] = user.profilePhotos ?? [];
    const hasPhotos = photos.length > 0;
    const age = calcAge(user.dateOfBirth);
    const displayName = `${user.firstName || ""}${user.lastName ? " " + user.lastName : ""}`.trim() || "Coffee Lover";

    // Score colour
    const scoreColor = matchScore >= 80 ? "#52c41a" : matchScore >= 40 ? "#FF8C00" : "#8B6F47";

    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: "0 8px 40px rgba(139,95,71,0.15)",
                maxWidth: 420,
                width: "100%",
                position: "relative",
            }}
        >
            {/* ── Photo panel ── */}
            <div
                style={{
                    height: 480,
                    background: hasPhotos
                        ? `url(${photos[imgIdx]?.url}) center/cover`
                        : "linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #FF8C00 100%)",
                    position: "relative",
                    cursor: hasPhotos && photos.length > 1 ? "pointer" : "default",
                }}
                onClick={() => hasPhotos && photos.length > 1 && setImgIdx((imgIdx + 1) % photos.length)}
            >
                {!hasPhotos && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Avatar src={user.photo} icon={<UserOutlined />} size={100} style={{ border: "4px solid rgba(255,255,255,0.8)" }} />
                    </div>
                )}

                {/* Photo dots */}
                {photos.length > 1 && (
                    <div style={{ position: "absolute", top: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
                        {photos.map((_: any, i: number) => (
                            <div
                                key={i}
                                style={{
                                    width: i === imgIdx ? 20 : 6, height: 6, borderRadius: 3,
                                    background: i === imgIdx ? "#FF8C00" : "rgba(255,255,255,0.6)",
                                    transition: "all 0.3s",
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Match score badge */}
                <div
                    style={{
                        position: "absolute", top: 14, right: 14,
                        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
                        color: scoreColor, borderRadius: 20, padding: "4px 12px",
                        fontWeight: 800, fontSize: 14,
                    }}
                >
                    {matchScore}% match
                </div>

                {/* Open to meet */}
                {user.isOpenToMeet && (
                    <div
                        style={{
                            position: "absolute", top: 14, left: 14,
                            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
                            color: "#52c41a", borderRadius: 20, padding: "4px 12px",
                            fontWeight: 700, fontSize: 13,
                        }}
                    >
                        ● Open to meet
                    </div>
                )}

                {/* Name overlay */}
                <div
                    style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
                        padding: "40px 20px 20px", color: "white",
                    }}
                >
                    <div style={{ fontSize: 26, fontWeight: 800, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                        {GENDER_ICON[user.gender] || "👤"} {displayName}{age ? `, ${age}` : ""}
                    </div>
                    {user.lookingFor && (
                        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                            {LOOKING_FOR_LABEL[user.lookingFor] || user.lookingFor}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Info panel ── */}
            <div style={{ padding: "16px 20px 20px" }}>
                {/* Bio */}
                {user.bio && (
                    <p style={{ margin: "0 0 12px", fontSize: 14, color: "#5a3e2b", lineHeight: 1.6 }}>
                        {user.bio.length > 110 ? user.bio.slice(0, 110) + "…" : user.bio}
                    </p>
                )}

                {/* Common drinks */}
                {commonDrinks.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: "#8B6F47", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                            You both love
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {commonDrinks.map((d) => (
                                <Tag key={d} style={{ borderRadius: 20, background: "#FFF3E0", borderColor: "#FF8C00", color: "#8B4513", padding: "2px 10px" }}>
                                    {DRINK_EMOJI[d] || "☕"} {d.replace(/-/g, " ")}
                                </Tag>
                            ))}
                        </div>
                    </div>
                )}

                {/* Hobbies */}
                {user.hobbies?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, color: "#8B6F47", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                            Interests
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {user.hobbies.slice(0, 5).map((h: string) => (
                                <Tag key={h} style={{ borderRadius: 20, fontSize: 12, padding: "2px 10px" }}>{h}</Tag>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <Tooltip title="Pass">
                        <Button
                            id="pass-btn"
                            shape="circle"
                            size="large"
                            icon={<CloseOutlined style={{ color: "#ff4d4f", fontSize: 22 }} />}
                            onClick={onPass}
                            loading={loading}
                            style={{ width: 56, height: 56, border: "2px solid #ff4d4f", boxShadow: "0 2px 8px rgba(255,77,79,0.2)" }}
                        />
                    </Tooltip>

                    <Button
                        id="view-profile-discover-btn"
                        style={{ flex: 1, borderRadius: 24, borderColor: "#d9cbbf", color: "#5a3e2b" }}
                        onClick={() => router.push(`/profile/${user._id}`)}
                    >
                        View Full Profile
                    </Button>

                    <Tooltip title="Like">
                        <Button
                            id="like-btn"
                            shape="circle"
                            size="large"
                            icon={<HeartOutlined style={{ color: "#FF8C00", fontSize: 22 }} />}
                            onClick={onLike}
                            loading={loading}
                            style={{ width: 56, height: 56, border: "2px solid #FF8C00", boxShadow: "0 2px 8px rgba(255,140,0,0.25)" }}
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}
