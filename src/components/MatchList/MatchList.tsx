"use client";
import React from "react";
import { Avatar, Badge, Card, Empty, Tag, Typography } from "antd";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

interface Match {
    _id: string;
    them: {
        _id: string;
        firstName: string;
        lastName: string;
        photo: string;
        bio?: string;
        isOpenToMeet: boolean;
        lastActiveAt?: string;
    };
    matchScore: number;
    commonDrinks: string[];
    matchedAt: string;
}

interface MatchListProps {
    matches: Match[];
}

export default function MatchList({ matches }: MatchListProps) {
    const router = useRouter();

    if (!matches.length) {
        return (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>☕</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#3d2b1f", marginBottom: 8 }}>
                    No matches yet
                </div>
                <div style={{ color: "#8B6F47", fontSize: 14 }}>
                    Keep swiping to find your coffee soulmate!
                </div>
            </div>
        );
    }

    const scoreColor = (s: number) => s >= 80 ? "#52c41a" : s >= 40 ? "#FF8C00" : "#8B6F47";

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 16,
            }}
        >
            {matches.map((m) => {
                const name = `${m.them.firstName || ""}${m.them.lastName ? " " + m.them.lastName : ""}`.trim() || "Coffee Lover";
                return (
                    <Card
                        key={m._id}
                        hoverable
                        id={`match-card-${m._id}`}
                        style={{ borderRadius: 20, border: "1px solid #f0e6d3", overflow: "hidden", cursor: "pointer" }}
                        styles={{ body: { padding: "16px" } }}
                        onClick={() => router.push(`/profile/${m.them._id}`)}
                    >
                        {/* Avatar + online badge */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                            <Badge dot color={m.them.isOpenToMeet ? "#52c41a" : "#d9d9d9"} offset={[-4, 4]}>
                                <Avatar src={m.them.photo} size={56} style={{ border: "2px solid #FF8C00" }}>
                                    {m.them.firstName?.[0]}
                                </Avatar>
                            </Badge>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: "#3d2b1f" }}>{name}</div>
                                <div style={{ fontSize: 12, color: "#8B6F47" }}>
                                    Matched {dayjs(m.matchedAt).fromNow()}
                                </div>
                            </div>
                        </div>

                        {/* Match score */}
                        <div
                            style={{
                                background: "#fff8f0",
                                borderRadius: 12,
                                padding: "8px 12px",
                                marginBottom: 10,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text style={{ fontSize: 13, color: "#8B6F47" }}>Match score</Text>
                            <Text strong style={{ color: scoreColor(m.matchScore), fontSize: 15 }}>
                                {m.matchScore}%
                            </Text>
                        </div>

                        {/* Common drinks */}
                        {m.commonDrinks.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {m.commonDrinks.slice(0, 3).map((d) => (
                                    <Tag
                                        key={d}
                                        style={{ borderRadius: 20, fontSize: 11, padding: "1px 8px", background: "#FFF3E0", borderColor: "#FF8C00", color: "#8B4513" }}
                                    >
                                        ☕ {d.replace(/-/g, " ")}
                                    </Tag>
                                ))}
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
}
