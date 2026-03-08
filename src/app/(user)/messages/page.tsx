"use client";
import React, { useEffect, useRef, useState } from "react";
import { Avatar, Button, DatePicker, Empty, Input, Modal, Select, Spin, Tooltip } from "antd";
import { SendOutlined, CoffeeOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ChatBubble from "@/components/ChatBubble/ChatBubble";
import ConversationItem from "@/components/ConversationItem/ConversationItem";
import { getSocket } from "@/lib/socket";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

export default function MessagesPage() {
    const queryClient = useQueryClient();
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeConvoId, setActiveConvoId] = useState<string | null>(
        searchParams.get("open") ?? null
    );
    const [inputText, setInputText] = useState("");
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Coffee invite modal state
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteShop, setInviteShop] = useState<string>("");
    const [inviteTime, setInviteTime] = useState<Dayjs | null>(null);
    const [sendingInvite, setSendingInvite] = useState(false);

    // Fetch conversations list
    const { data: convoData, isLoading: convoLoading } = useQuery({
        queryKey: ["conversations"],
        queryFn: () => axios.get("/api/conversations").then((r) => r.data.conversations),
        refetchInterval: 15_000,
        refetchOnWindowFocus: true,
    });

    const conversations = convoData ?? [];
    const activeConvo = conversations.find((c: any) => c._id === activeConvoId);

    // Load messages when conversation changes
    useEffect(() => {
        if (!activeConvoId) return;
        setLoadingMessages(true);
        axios.get(`/api/conversations/${activeConvoId}/messages`).then((r) => {
            setMessages(r.data.messages);
            setLoadingMessages(false);
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        });
    }, [activeConvoId]);

    // Socket.io — join room and listen for new messages
    useEffect(() => {
        const socket = getSocket();

        if (activeConvoId) {
            socket.emit("join-conversation", activeConvoId);
        }

        socket.on("new-message", (msg: any) => {
            setMessages((prev) => {
                if (prev.find((m) => m._id === msg._id)) return prev; // dedupe
                return [...prev, msg];
            });
            // If this message is in the currently active conversation,
            // immediately mark it as read so the badge clears.
            if (msg.conversation === activeConvoId || msg.conversation?.toString() === activeConvoId) {
                axios.patch(`/api/conversations/${activeConvoId}/read`).catch(() => { });
            }
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        });

        // Real-time invite status update (accept / decline)
        socket.on("invite-updated", (updatedMsg: any) => {
            setMessages((prev) =>
                prev.map((m) => m._id === updatedMsg._id ? updatedMsg : m)
            );
        });

        socket.on("typing", ({ userId, isTyping: t }: any) => {
            if (userId !== userInfo.id) setIsTyping(t);
        });

        return () => {
            socket.off("new-message");
            socket.off("invite-updated");
            socket.off("typing");
            if (activeConvoId) socket.emit("leave-conversation", activeConvoId);
        };
    }, [activeConvoId]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!inputText.trim() || !activeConvoId || sending) return;
        const text = inputText.trim();
        setInputText("");
        setSending(true);
        try {
            // Just POST — the API emits via Socket.io to everyone in the room including us,
            // so the socket "new-message" listener handles adding it to the UI for ALL clients.
            await axios.post(`/api/conversations/${activeConvoId}/messages`, { content: text });
        } catch {
            setInputText(text); // restore on failure
        } finally {
            setSending(false);
        }
    };

    const handleTyping = (val: string) => {
        setInputText(val);
        const socket = getSocket();
        socket.emit("typing", { conversationId: activeConvoId, userId: userInfo.id, isTyping: true });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("typing", { conversationId: activeConvoId, userId: userInfo.id, isTyping: false });
        }, 1500);
    };

    // Coffee shops list for invite dropdown
    const { data: shopsData } = useQuery({
        queryKey: ["coffee-shops-list"],
        queryFn: () =>
            axios.get("/api/coffee-shop?isVerified=true&limit=100")
                .then((r) => r.data.coffeeShops ?? []),
        enabled: inviteModalOpen,
        staleTime: 60_000,
    });
    const shopOptions = (shopsData ?? []).map((s: any) => ({ value: s.title, label: s.title, id: s._id }));

    const sendInvite = async () => {
        if (!inviteShop || !inviteTime || !activeConvoId) return;
        setSendingInvite(true);
        try {
            await axios.post(`/api/conversations/${activeConvoId}/coffee-invite`, {
                shopName: inviteShop,
                proposedTime: inviteTime.toISOString(),
            });
            setInviteModalOpen(false);
            setInviteShop("");
            setInviteTime(null);
        } finally {
            setSendingInvite(false);
        }
    };

    const myId = userInfo.id as string;

    return (
        <div style={{ display: "flex", height: "calc(100vh - 120px)", background: "#fdf8f3", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(139,95,71,0.10)" }}>

            {/* ── Sidebar ── */}
            <div style={{ width: 320, borderRight: "1px solid #f0e6d3", display: "flex", flexDirection: "column", background: "white" }}>
                <div style={{ padding: "20px 16px 12px", fontWeight: 800, fontSize: 20, color: "#3d2b1f", borderBottom: "1px solid #f0e6d3" }}>
                    💬 Messages
                </div>

                {convoLoading
                    ? <Spin style={{ margin: "40px auto" }} />
                    : conversations.length === 0
                        ? <Empty description="No conversations yet" style={{ marginTop: 60 }} />
                        : conversations.map((c: any) => (
                            <ConversationItem
                                key={c._id}
                                conversation={{
                                    ...c,
                                    // Instantly clear badge for the conversation you're viewing
                                    unread: c._id === activeConvoId ? 0 : c.unread,
                                }}
                                isActive={c._id === activeConvoId}
                                onClick={() => {
                                    setActiveConvoId(c._id);
                                    // Mark as read immediately on click
                                    axios.patch(`/api/conversations/${c._id}/read`)
                                        .then(() => queryClient.invalidateQueries({ queryKey: ["conversations"] }))
                                        .catch(() => { });
                                }}
                            />
                        ))
                }
            </div>

            {/* ── Chat panel ── */}
            {!activeConvoId
                ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#8B6F47" }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>☕</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#3d2b1f" }}>Select a conversation</div>
                        <div style={{ fontSize: 14, color: "#8B6F47", marginTop: 4 }}>Choose a match to start chatting</div>
                    </div>
                )
                : (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        {/* Chat header */}
                        {activeConvo && (
                            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0e6d3", display: "flex", alignItems: "center", gap: 12, background: "white" }}>
                                <Avatar src={activeConvo.them.photo} size={40} style={{ border: "2px solid #FF8C00" }}>
                                    {activeConvo.them.firstName?.[0]}
                                </Avatar>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 15, color: "#3d2b1f" }}>
                                        {activeConvo.them.firstName} {activeConvo.them.lastName}
                                    </div>
                                    <div style={{ fontSize: 12, color: activeConvo.them.isOpenToMeet ? "#52c41a" : "#bfbfbf" }}>
                                        {activeConvo.them.isOpenToMeet ? "● Open to meet" : "● Offline"}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                            {loadingMessages
                                ? <Spin style={{ display: "block", margin: "60px auto" }} />
                                : messages.length === 0
                                    ? <div style={{ textAlign: "center", marginTop: 60, color: "#8B6F47" }}>No messages yet. Say hi! ☕</div>
                                    : messages.map((msg) => {
                                        const theirId = activeConvo?.them?._id?.toString();
                                        const senderId = msg.sender?._id?.toString() ?? msg.sender?.toString();
                                        const isOwn = theirId ? senderId !== theirId : senderId === myId;
                                        return (
                                            <ChatBubble
                                                key={msg._id}
                                                message={msg}
                                                isOwn={isOwn}
                                                conversationId={activeConvoId ?? ""}
                                                onInviteUpdate={(updated) =>
                                                    setMessages((prev) =>
                                                        prev.map((m) => m._id === updated._id ? updated : m)
                                                    )
                                                }
                                            />
                                        );
                                    })
                            }
                            {isTyping && (
                                <div style={{ fontSize: 13, color: "#8B6F47", fontStyle: "italic", marginTop: 4 }}>
                                    {activeConvo?.them.firstName} is typing…
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: "12px 16px", borderTop: "1px solid #f0e6d3", display: "flex", gap: 8, background: "white", alignItems: "center" }}>
                            <Tooltip title="Send a coffee date invite ☕">
                                <Button
                                    id="coffee-invite-btn"
                                    shape="circle"
                                    size="large"
                                    icon={<CoffeeOutlined style={{ color: "#FF8C00", fontSize: 18 }} />}
                                    onClick={() => setInviteModalOpen(true)}
                                    style={{ border: "1.5px solid #FF8C00", flexShrink: 0 }}
                                />
                            </Tooltip>
                            <Input
                                id="message-input"
                                placeholder="Type a message..."
                                value={inputText}
                                onChange={(e) => handleTyping(e.target.value)}
                                onPressEnter={sendMessage}
                                style={{ borderRadius: 24, borderColor: "#f0e6d3", flex: 1 }}
                                size="large"
                            />
                            <Button
                                id="send-message-btn"
                                type="primary"
                                shape="circle"
                                size="large"
                                icon={<SendOutlined />}
                                loading={sending}
                                onClick={sendMessage}
                                style={{ background: "linear-gradient(135deg, #FF8C00, #D2691E)", border: "none", boxShadow: "0 2px 8px rgba(255,140,0,0.3)" }}
                            />
                        </div>
                    </div>
                )
            }

            {/* ── Coffee Date Invite Modal ── */}
            <Modal
                title={<span>☕ Send a Coffee Date Invite</span>}
                open={inviteModalOpen}
                onCancel={() => { setInviteModalOpen(false); setInviteShop(""); setInviteTime(null); }}
                onOk={sendInvite}
                okText="Send Invite"
                okButtonProps={{
                    loading: sendingInvite,
                    disabled: !inviteShop || !inviteTime,
                    style: { background: "linear-gradient(135deg, #FF8C00, #D2691E)", border: "none" },
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 0" }}>
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 6, color: "#5a3e2b" }}>☕ Coffee Shop</div>
                        <Select
                            id="invite-shop-select"
                            showSearch
                            placeholder="Search or type a shop name…"
                            value={inviteShop || undefined}
                            onChange={setInviteShop}
                            options={shopOptions.length > 0 ? shopOptions : undefined}
                            style={{ width: "100%" }}
                            mode={undefined}
                            allowClear
                            filterOption={(input, opt) =>
                                (opt?.label as string ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                            notFoundContent={
                                <div style={{ padding: 8, color: "#8B6F47" }}
                                    onClick={() => { if (inviteShop) return; }}
                                >
                                    No shops found — type a name to use it
                                </div>
                            }
                            onSearch={(val) => setInviteShop(val)}
                        />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 6, color: "#5a3e2b" }}>📅 Proposed Date & Time</div>
                        <DatePicker
                            id="invite-date-picker"
                            showTime={{ format: "HH:mm" }}
                            format="ddd, MMM D · HH:mm"
                            placeholder="Pick a date and time"
                            value={inviteTime}
                            onChange={setInviteTime}
                            disabledDate={(d) => d.isBefore(dayjs().startOf("day"))}
                            style={{ width: "100%" }}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
