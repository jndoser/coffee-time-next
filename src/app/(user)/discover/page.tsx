"use client";
import React, { useState } from "react";
import { Alert, Spin, Tabs, message } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import DiscoverCard from "@/components/DiscoverCard/DiscoverCard";
import MatchList from "@/components/MatchList/MatchList";

interface Candidate {
    user: any;
    preference: any;
    matchScore: number;
    commonDrinks: string[];
}

export default function DiscoverPage() {
    const queryClient = useQueryClient();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [swiping, setSwiping] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    // Fetch candidates
    const { data: discoverData, isLoading: discoverLoading } = useQuery({
        queryKey: ["discover"],
        queryFn: () => axios.get("/api/discover").then((r) => r.data.candidates as Candidate[]),
        staleTime: 0, // always fetch fresh — scores change as users update preferences
    });

    // Fetch matches
    const { data: matchesData, isLoading: matchesLoading } = useQuery({
        queryKey: ["matches"],
        queryFn: () => axios.get("/api/matches").then((r) => r.data.matches),
        refetchOnWindowFocus: true,
    });

    const candidates = discoverData ?? [];
    const current: Candidate | undefined = candidates[currentIdx];

    const handleSwipe = async (action: "like" | "pass") => {
        if (!current || swiping) return;
        setSwiping(true);
        try {
            const res = await axios.post("/api/swipe", { toUserId: current.user._id, action });
            if (res.data.matched) {
                messageApi.success({
                    content: `🎉 It's a match with ${current.user.firstName}! You both liked each other ☕`,
                    duration: 4,
                });
                queryClient.invalidateQueries({ queryKey: ["matches"] });
            } else if (action === "like") {
                messageApi.info({ content: "💛 Liked! Waiting to see if they like you back…", duration: 2 });
            }
            setCurrentIdx((i) => i + 1);
        } catch {
            messageApi.error("Something went wrong, please try again.");
        } finally {
            setSwiping(false);
        }
    };

    const cardContent = () => {
        if (discoverLoading) {
            return (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
                    <Spin size="large" tip="Finding coffee lovers near you…" />
                </div>
            );
        }

        if (!current) {
            return (
                <div style={{ textAlign: "center", padding: "80px 20px" }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>☕</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#3d2b1f", marginBottom: 8 }}>
                        You've seen everyone!
                    </div>
                    <div style={{ color: "#8B6F47", fontSize: 15 }}>
                        Check back later — new coffee lovers join every day.
                    </div>
                </div>
            );
        }

        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                {/* Progress */}
                <div style={{ fontSize: 13, color: "#8B6F47" }}>
                    {currentIdx + 1} of {candidates.length} profiles
                </div>

                <DiscoverCard
                    user={current.user}
                    preference={current.preference}
                    matchScore={current.matchScore}
                    commonDrinks={current.commonDrinks}
                    onLike={() => handleSwipe("like")}
                    onPass={() => handleSwipe("pass")}
                    loading={swiping}
                />

                {/* Peek at next card */}
                {candidates[currentIdx + 1] && (
                    <div style={{ fontSize: 12, color: "#bfbfbf", marginTop: 4 }}>
                        Next: {candidates[currentIdx + 1].user.firstName} ({candidates[currentIdx + 1].matchScore}% match)
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px" }}>
            {contextHolder}

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: "#3d2b1f", margin: "0 0 4px" }}>
                    ☕ Discover
                </h1>
                <p style={{ color: "#8B6F47", margin: 0 }}>
                    Find coffee lovers who match your taste
                </p>
            </div>

            <Tabs
                defaultActiveKey="discover"
                size="large"
                items={[
                    {
                        key: "discover",
                        label: "Discover",
                        children: cardContent(),
                    },
                    {
                        key: "matches",
                        label: (
                            <span>
                                Matches{" "}
                                {matchesData?.length > 0 && (
                                    <span
                                        style={{
                                            background: "#FF8C00", color: "white",
                                            borderRadius: 10, padding: "1px 7px",
                                            fontSize: 11, fontWeight: 700, marginLeft: 4,
                                        }}
                                    >
                                        {matchesData.length}
                                    </span>
                                )}
                            </span>
                        ),
                        children: matchesLoading
                            ? <Spin style={{ display: "block", marginTop: 60 }} />
                            : <MatchList matches={matchesData ?? []} />,
                    },
                ]}
            />
        </div>
    );
}
