"use client";
import { Button, Card, Flex, Modal, Switch, Typography, message } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";
import React, { useEffect, useState } from "react";
import CoffeePicturesSection, { ImageType } from "../CoffeePicturesSection/CoffeePicturesSection";
import MenuCarousel from "../MenuCarousel/MenuCarousel";
import CommentSection from "../CommentSection/CommentSection";
import CheckedInUsers from "../CheckedInUsers/CheckedInUsers";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

interface CoffeeDetailProps {
  coffeeShopId: string;
}

export interface CoffeeShopType {
  id: string;
  title: string;
  address: string;
  bio: string;
  description: string;
  images: ImageType[];
}

function CoffeeDetail({ coffeeShopId }: CoffeeDetailProps) {
  const [coffeeShopInfo, setCoffeeShopInfo] = useState<CoffeeShopType>();
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [isOpenToMeet, setIsOpenToMeet] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  useEffect(() => {
    const getCoffeeShopById = async (coffeeShopId: string) => {
      const res = await axios.get("/api/coffee-shop/" + coffeeShopId);
      const rawCoffeeShopData = res.data;
      const coffeeShopData = {
        id: rawCoffeeShopData._id,
        title: rawCoffeeShopData.title,
        address: rawCoffeeShopData.address,
        bio: rawCoffeeShopData.bio,
        description: rawCoffeeShopData.description,
        images: rawCoffeeShopData.images,
      };
      setCoffeeShopInfo(coffeeShopData);
    };
    getCoffeeShopById(coffeeShopId);

    // Check if user is already checked in here
    axios.get("/api/checkin").then((r) => {
      const checkin = r.data.checkin;
      if (checkin && checkin.coffeeShop?._id === coffeeShopId || checkin?.coffeeShop === coffeeShopId) {
        setIsCheckedIn(true);
        setIsOpenToMeet(checkin.isOpenToMeet);
      }
    }).catch(() => { });
  }, [coffeeShopId]);

  const handleCheckIn = async () => {
    setCheckinLoading(true);
    try {
      await axios.post("/api/checkin", { coffeeShopId, isOpenToMeet });
      setIsCheckedIn(true);
      setCheckinModalOpen(false);
      messageApi.success(
        isOpenToMeet ? "Checked in! Others can see you're open to meet ☕" : "Checked in!"
      );
      queryClient.invalidateQueries({ queryKey: ["checkins", coffeeShopId] });
    } catch {
      messageApi.error("Failed to check in. Please try again.");
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckinLoading(true);
    try {
      await axios.delete("/api/checkin", { data: { coffeeShopId } });
      setIsCheckedIn(false);
      setIsOpenToMeet(false);
      messageApi.info("You've checked out.");
      queryClient.invalidateQueries({ queryKey: ["checkins", coffeeShopId] });
    } catch {
      messageApi.error("Failed to check out.");
    } finally {
      setCheckinLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Flex vertical gap={4}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Title level={3} style={{ margin: 0 }}>{coffeeShopInfo?.title}</Title>
          {isCheckedIn ? (
            <Button
              danger
              size="large"
              loading={checkinLoading}
              onClick={handleCheckOut}
              style={{ borderRadius: 24, fontWeight: 600 }}
            >
              ✓ Checked In — Leave
            </Button>
          ) : (
            <Button
              type="primary"
              size="large"
              onClick={() => setCheckinModalOpen(true)}
              style={{
                backgroundColor: "#FF8C00",
                borderColor: "#FF8C00",
                borderRadius: 24,
                fontWeight: 600,
              }}
            >
              📍 I&apos;m Here!
            </Button>
          )}
        </div>

        {/* Who's here right now */}
        <CheckedInUsers coffeeShopId={coffeeShopId} />

        <CoffeePicturesSection images={coffeeShopInfo?.images ?? []} />
        <Card hoverable style={{ marginTop: "20px" }}>
          <Typography>
            <Title level={3}>{coffeeShopInfo?.title}</Title>
            <Paragraph>{coffeeShopInfo?.bio}</Paragraph>
            <Title level={3}>Description</Title>
            <Paragraph>{coffeeShopInfo?.description}</Paragraph>
          </Typography>
        </Card>
        <MenuCarousel coffeeShopId={coffeeShopId} />
        <CommentSection coffeeShopId={coffeeShopId} />
      </Flex>

      {/* Check In Modal */}
      <Modal
        open={checkinModalOpen}
        onCancel={() => setCheckinModalOpen(false)}
        footer={null}
        centered
        style={{ maxWidth: 400 }}
      >
        <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>☕</div>
          <Title level={4} style={{ color: "#3d2b1f", margin: "0 0 4px" }}>
            You&apos;re at {coffeeShopInfo?.title}!
          </Title>
          <Paragraph style={{ color: "#8B6F47", margin: "0 0 28px" }}>
            Let other coffee lovers know you&apos;re here.
          </Paragraph>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#fff8f0",
              border: "1px solid #ffe0b2",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 24,
            }}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 600, color: "#3d2b1f", fontSize: 15 }}>
                Open to meet someone? 👋
              </div>
              <div style={{ color: "#8B6F47", fontSize: 13, marginTop: 2 }}>
                Others at this café can see your profile
              </div>
            </div>
            <Switch
              checked={isOpenToMeet}
              onChange={setIsOpenToMeet}
              style={{ backgroundColor: isOpenToMeet ? "#FF8C00" : undefined }}
            />
          </div>

          <Button
            type="primary"
            size="large"
            block
            loading={checkinLoading}
            onClick={handleCheckIn}
            style={{
              backgroundColor: "#FF8C00",
              borderColor: "#FF8C00",
              borderRadius: 24,
              fontWeight: 600,
              height: 48,
            }}
          >
            {isOpenToMeet ? "Check In & Let's Meet! ☕" : "Just Check In"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default CoffeeDetail;
