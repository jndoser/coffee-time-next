"use client";

import React, { useEffect, useState } from "react";
import {
    Form,
    Input,
    Select,
    Button,
    Tabs,
    Tag,
    Slider,
    DatePicker,
    Upload,
    Progress,
    message,
    Spin,
    Card,
    Tooltip,
} from "antd";
import {
    UserOutlined,
    CoffeeOutlined,
    PlusOutlined,
    CameraOutlined,
    CheckCircleFilled,
    EyeOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/navigation";

const { TextArea } = Input;
const { Option } = Select;

// ── Data Constants ────────────────────────────────────────────────
const DRINK_OPTIONS = [
    { label: "☕ Espresso", value: "espresso" },
    { label: "🥛 Latte", value: "latte" },
    { label: "🧊 Cold Brew", value: "cold-brew" },
    { label: "☁️ Cappuccino", value: "cappuccino" },
    { label: "🫧 Americano", value: "americano" },
    { label: "🤍 Flat White", value: "flat-white" },
    { label: "🫗 Pour Over", value: "pour-over" },
    { label: "🍵 Matcha", value: "matcha" },
    { label: "🍫 Mocha", value: "mocha" },
];

const BREW_OPTIONS = [
    { label: "☕ Espresso Machine", value: "espresso-machine" },
    { label: "🫖 French Press", value: "french-press" },
    { label: "🔽 Pour Over", value: "pour-over" },
    { label: "💨 AeroPress", value: "aeropress" },
    { label: "🔥 Moka Pot", value: "moka-pot" },
    { label: "🧊 Cold Brew", value: "cold-brew" },
    { label: "💧 Drip Machine", value: "drip" },
];

const ROAST_MARKS = {
    0: "Light",
    1: "Medium",
    2: "Medium-Dark",
    3: "Dark",
};

const SUGAR_MARKS = {
    0: "None",
    1: "A little",
    2: "Some",
    3: "Sweet",
    4: "Extra Sweet",
};

// ── Profile Completion Calculator ─────────────────────────────────
function calcCompletion(profileForm: any, prefForm: any): number {
    const fields = [
        profileForm.bio,
        profileForm.gender,
        profileForm.lookingFor,
        profileForm.dateOfBirth,
        profileForm.hobbies?.length > 0,
        prefForm.favoriteDrinks?.length > 0,
        prefForm.roastLevel,
        prefForm.visitFrequency,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
}

// ── Main Component ────────────────────────────────────────────────
export default function EditProfilePage() {
    const [profileForm] = Form.useForm();
    const [prefForm] = Form.useForm();
    const [hobbyInput, setHobbyInput] = useState("");
    const [hobbies, setHobbies] = useState<string[]>([]);
    const [completion, setCompletion] = useState(0);
    const [activeTab, setActiveTab] = useState("basic");
    const [messageApi, contextHolder] = message.useMessage();

    const userInfo = useSelector((state: RootState) => state.userInfo);
    const queryClient = useQueryClient();
    const router = useRouter();

    // ── Fetch existing profile ─────────────────────────────────────
    const { data, isLoading } = useQuery({
        queryKey: ["myProfile"],
        queryFn: () => axios.get("/api/profile").then((r) => r.data),
        enabled: !!userInfo.id,
    });

    useEffect(() => {
        if (data) {
            const { user, preference } = data;
            profileForm.setFieldsValue({
                bio: user.bio,
                gender: user.gender,
                lookingFor: user.lookingFor,
                favoriteQuote: user.favoriteQuote,
                dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : undefined,
            });
            setHobbies(user.hobbies || []);

            if (preference) {
                prefForm.setFieldsValue({
                    favoriteDrinks: preference.favoriteDrinks,
                    brewMethods: preference.brewMethods,
                    roastLevel: preference.roastLevel
                        ? ["light", "medium", "medium-dark", "dark"].indexOf(preference.roastLevel)
                        : 1,
                    milkPreference: preference.milkPreference,
                    sugarLevel: preference.sugarLevel ?? 1,
                    visitFrequency: preference.visitFrequency,
                    preferredTime: preference.preferredTime,
                });
            }

            updateCompletion();
        }
    }, [data]);

    const updateCompletion = () => {
        const pVals = profileForm.getFieldsValue();
        const cVals = prefForm.getFieldsValue();
        setCompletion(calcCompletion({ ...pVals, hobbies }, cVals));
    };

    // ── Save profile mutation ──────────────────────────────────────
    const saveProfile = useMutation({
        mutationFn: async () => {
            const pVals = profileForm.getFieldsValue();
            const cVals = prefForm.getFieldsValue();

            const roastOptions = ["light", "medium", "medium-dark", "dark"];

            await axios.put("/api/profile", {
                ...pVals,
                hobbies,
                dateOfBirth: pVals.dateOfBirth ? pVals.dateOfBirth.toISOString() : undefined,
            });

            await axios.post("/api/coffee-preference", {
                ...cVals,
                roastLevel: roastOptions[cVals.roastLevel ?? 1],
            });
        },
        onSuccess: () => {
            messageApi.success("Profile saved! ☕");
            queryClient.invalidateQueries({ queryKey: ["myProfile"] });
            updateCompletion();
        },
        onError: () => {
            messageApi.error("Failed to save. Please try again.");
        },
    });

    // ── Hobby helpers ──────────────────────────────────────────────
    const addHobby = () => {
        const trimmed = hobbyInput.trim();
        if (trimmed && !hobbies.includes(trimmed) && hobbies.length < 10) {
            setHobbies([...hobbies, trimmed]);
            setHobbyInput("");
        }
    };

    const removeHobby = (h: string) => setHobbies(hobbies.filter((x) => x !== h));

    // ── Profile photo placeholder (Cloudinary upload stays the same) ─
    const uploadButton = (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#8B6F47",
            }}
        >
            <PlusOutlined style={{ fontSize: 20 }} />
            <div style={{ marginTop: 4, fontSize: 12 }}>Add Photo</div>
        </div>
    );

    const progressColor =
        completion < 40 ? "#ff4d4f" : completion < 70 ? "#faad14" : "#52c41a";

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
                <Spin size="large" tip="Loading your profile..." />
            </div>
        );
    }

    // ── Tab: Basic Info ────────────────────────────────────────────
    const BasicInfoTab = (
        <Form
            form={profileForm}
            layout="vertical"
            onValuesChange={updateCompletion}
            style={{ maxWidth: 680 }}
        >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                <Form.Item label="Date of Birth" name="dateOfBirth">
                    <DatePicker
                        style={{ width: "100%" }}
                        placeholder="Select your birth date"
                        disabledDate={(d) => d && d > dayjs().subtract(18, "year")}
                    />
                </Form.Item>

                <Form.Item label="Gender" name="gender">
                    <Select placeholder="Select gender">
                        <Option value="male">Man</Option>
                        <Option value="female">Woman</Option>
                        <Option value="non-binary">Non-binary</Option>
                        <Option value="prefer-not-to-say">Prefer not to say</Option>
                    </Select>
                </Form.Item>
            </div>

            <Form.Item label="I'm looking for..." name="lookingFor">
                <Select placeholder="What are you looking for?">
                    <Option value="friends">👥 Friends</Option>
                    <Option value="coffee-buddy">☕ Coffee Buddy</Option>
                    <Option value="dating">💕 Dating</Option>
                    <Option value="networking">🤝 Networking</Option>
                </Select>
            </Form.Item>

            <Form.Item
                label="About Me"
                name="bio"
                extra="Tell other coffee lovers a bit about yourself"
            >
                <TextArea
                    rows={4}
                    placeholder="I'm a coffee enthusiast who loves exploring new cafés..."
                    maxLength={500}
                    showCount
                />
            </Form.Item>

            <Form.Item label="Hobbies & Interests">
                <div
                    style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: 8,
                        padding: "12px 16px",
                        minHeight: 80,
                        backgroundColor: "#fafafa",
                    }}
                >
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                        {hobbies.map((h) => (
                            <Tag
                                key={h}
                                closable
                                onClose={() => removeHobby(h)}
                                style={{
                                    backgroundColor: "#FFF3E0",
                                    borderColor: "#FF8C00",
                                    color: "#8B4513",
                                    borderRadius: 20,
                                    padding: "2px 10px",
                                }}
                            >
                                {h}
                            </Tag>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <Input
                            placeholder="Add a hobby (e.g. Photography)"
                            value={hobbyInput}
                            onChange={(e) => setHobbyInput(e.target.value)}
                            onPressEnter={addHobby}
                            style={{ borderRadius: 20 }}
                            maxLength={30}
                        />
                        <Button
                            onClick={addHobby}
                            disabled={hobbies.length >= 10}
                            style={{
                                borderRadius: 20,
                                borderColor: "#FF8C00",
                                color: "#FF8C00",
                            }}
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </Form.Item>

            <Form.Item
                label="Favorite Quote"
                name="favoriteQuote"
                extra="A quote that inspires you or makes you smile"
            >
                <Input
                    prefix={<CoffeeOutlined style={{ color: "#8B6F47" }} />}
                    placeholder='"Life is too short for bad coffee"'
                    maxLength={200}
                />
            </Form.Item>
        </Form>
    );

    // ── Tab: Coffee Taste ──────────────────────────────────────────
    const CoffeeTasteTab = (
        <Form
            form={prefForm}
            layout="vertical"
            onValuesChange={updateCompletion}
            style={{ maxWidth: 680 }}
        >
            <Form.Item label="Favorite Drinks" name="favoriteDrinks" extra="Pick all you love">
                <Select
                    mode="multiple"
                    placeholder="Select your favorite drinks"
                    options={DRINK_OPTIONS}
                    style={{ width: "100%" }}
                />
            </Form.Item>

            <Form.Item label="How do you brew at home?" name="brewMethods">
                <Select
                    mode="multiple"
                    placeholder="Select brew methods"
                    options={BREW_OPTIONS}
                    style={{ width: "100%" }}
                />
            </Form.Item>

            <Form.Item label="Roast Level" name="roastLevel">
                <Slider
                    min={0}
                    max={3}
                    step={1}
                    marks={ROAST_MARKS}
                    defaultValue={1}
                    tooltip={{ formatter: (v) => ROAST_MARKS[v as keyof typeof ROAST_MARKS] }}
                    trackStyle={{ backgroundColor: "#8B4513" }}
                    handleStyle={{ borderColor: "#8B4513" }}
                />
            </Form.Item>

            <Form.Item label="Milk Preference" name="milkPreference">
                <Select placeholder="Select milk preference">
                    <Option value="none">❌ None (black coffee!)</Option>
                    <Option value="whole-milk">🥛 Whole Milk</Option>
                    <Option value="oat-milk">🌾 Oat Milk</Option>
                    <Option value="almond-milk">🌰 Almond Milk</Option>
                    <Option value="soy-milk">🫘 Soy Milk</Option>
                    <Option value="coconut-milk">🥥 Coconut Milk</Option>
                </Select>
            </Form.Item>

            <Form.Item label="Sugar Level" name="sugarLevel" extra="How sweet do you like it?">
                <Slider
                    min={0}
                    max={4}
                    step={1}
                    marks={SUGAR_MARKS}
                    defaultValue={1}
                    tooltip={{ formatter: (v) => SUGAR_MARKS[v as keyof typeof SUGAR_MARKS] }}
                    trackStyle={{ backgroundColor: "#D4A017" }}
                    handleStyle={{ borderColor: "#D4A017" }}
                />
            </Form.Item>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                <Form.Item label="How often do you visit cafés?" name="visitFrequency">
                    <Select placeholder="Visit frequency">
                        <Option value="daily">☀️ Every day</Option>
                        <Option value="few-times-a-week">📅 Few times a week</Option>
                        <Option value="weekends">🎉 Weekends only</Option>
                        <Option value="rarely">🦋 Rarely</Option>
                    </Select>
                </Form.Item>

                <Form.Item label="When do you love coffee most?" name="preferredTime">
                    <Select placeholder="Preferred time">
                        <Option value="early-morning">🌅 Early Morning</Option>
                        <Option value="mid-morning">☀️ Mid Morning</Option>
                        <Option value="afternoon">🌤️ Afternoon</Option>
                        <Option value="evening">🌆 Evening</Option>
                        <Option value="late-night">🌙 Late Night</Option>
                    </Select>
                </Form.Item>
            </div>
        </Form>
    );

    const tabs = [
        {
            key: "basic",
            label: (
                <span>
                    <UserOutlined /> Basic Info
                </span>
            ),
            children: BasicInfoTab,
        },
        {
            key: "coffee",
            label: (
                <span>
                    <CoffeeOutlined /> Coffee Taste
                </span>
            ),
            children: CoffeeTasteTab,
        },
    ];

    return (
        <>
            {contextHolder}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "280px 1fr",
                    gap: 32,
                    alignItems: "start",
                    padding: "8px 0",
                }}
            >
                {/* ── Left: Photo & Completion sidebar ─────────────────── */}
                <div style={{ position: "sticky", top: 24 }}>
                    <Card
                        style={{ borderRadius: 16, border: "1px solid #f0e6d3", boxShadow: "0 2px 12px rgba(139,95,71,0.08)" }}
                        styles={{ body: { padding: 24 } }}
                    >
                        {/* Main photo */}
                        <div style={{ textAlign: "center", marginBottom: 20 }}>
                            <div
                                style={{
                                    position: "relative",
                                    display: "inline-block",
                                }}
                            >
                                <div
                                    style={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: "50%",
                                        overflow: "hidden",
                                        border: "3px solid #FF8C00",
                                        margin: "0 auto",
                                        backgroundColor: "#f5e6d3",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {data?.user?.photo ? (
                                        <img
                                            src={data.user.photo}
                                            alt="Profile"
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <UserOutlined style={{ fontSize: 48, color: "#8B6F47" }} />
                                    )}
                                </div>
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: 0,
                                        right: 0,
                                        backgroundColor: "#FF8C00",
                                        borderRadius: "50%",
                                        width: 28,
                                        height: 28,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        border: "2px solid white",
                                    }}
                                >
                                    <CameraOutlined style={{ color: "white", fontSize: 14 }} />
                                </div>
                            </div>

                            <div style={{ marginTop: 12, fontWeight: 600, fontSize: 16, color: "#3d2b1f" }}>
                                {data?.user?.firstName} {data?.user?.lastName}
                            </div>
                            <div style={{ color: "#8B6F47", fontSize: 13 }}>@{data?.user?.username || "you"}</div>
                        </div>

                        {/* Completion */}
                        <div style={{ marginBottom: 20 }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: 6,
                                    fontSize: 13,
                                    color: "#5a3e2b",
                                }}
                            >
                                <span>Profile completion</span>
                                <span style={{ fontWeight: 700, color: progressColor }}>{completion}%</span>
                            </div>
                            <Progress
                                percent={completion}
                                showInfo={false}
                                strokeColor={progressColor}
                                trailColor="#f0e6d3"
                                strokeWidth={8}
                                style={{ borderRadius: 4 }}
                            />
                            {completion === 100 && (
                                <div
                                    style={{
                                        marginTop: 8,
                                        color: "#52c41a",
                                        fontSize: 13,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                    }}
                                >
                                    <CheckCircleFilled /> Profile complete!
                                </div>
                            )}
                        </div>

                        {/* Checklist */}
                        <div style={{ fontSize: 13, color: "#8B6F47" }}>
                            {[
                                { label: "Bio", done: !!profileForm.getFieldValue("bio") },
                                { label: "Gender", done: !!profileForm.getFieldValue("gender") },
                                { label: "Looking for", done: !!profileForm.getFieldValue("lookingFor") },
                                { label: "Hobbies", done: hobbies.length > 0 },
                                { label: "Favorite drinks", done: (prefForm.getFieldValue("favoriteDrinks") || []).length > 0 },
                                { label: "Visit frequency", done: !!prefForm.getFieldValue("visitFrequency") },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        padding: "4px 0",
                                    }}
                                >
                                    <span style={{ color: item.done ? "#52c41a" : "#d9d9d9" }}>
                                        {item.done ? "✓" : "○"}
                                    </span>
                                    <span style={{ color: item.done ? "#3d2b1f" : "#bfbfbf" }}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* ── Right: Tabbed form ───────────────────────────────── */}
                <div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 24,
                        }}
                    >
                        <div>
                            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#3d2b1f" }}>
                                Edit Your Profile
                            </h1>
                            <p style={{ margin: "4px 0 0", color: "#8B6F47" }}>
                                Help others know who they're meeting for coffee ☕
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <Button
                                size="large"
                                icon={<EyeOutlined />}
                                onClick={() => router.push(`/profile/${data?.user?._id || userInfo.id}`)}
                                style={{
                                    borderRadius: 24,
                                    fontWeight: 600,
                                    padding: "0 24px",
                                }}
                            >
                                View Profile
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                loading={saveProfile.isPending}
                                onClick={() => saveProfile.mutate()}
                                style={{
                                    backgroundColor: "#FF8C00",
                                    borderColor: "#FF8C00",
                                    borderRadius: 24,
                                    fontWeight: 600,
                                    padding: "0 32px",
                                }}
                            >
                                Save Profile
                            </Button>
                        </div>
                    </div>

                    <Card
                        style={{
                            borderRadius: 16,
                            border: "1px solid #f0e6d3",
                            boxShadow: "0 2px 12px rgba(139,95,71,0.08)",
                        }}
                        styles={{ body: { padding: "0 32px 32px" } }}
                    >
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={tabs}
                            tabBarStyle={{ borderBottom: "1px solid #f0e6d3", marginBottom: 28 }}
                        />
                    </Card>
                </div>
            </div>
        </>
    );
}
