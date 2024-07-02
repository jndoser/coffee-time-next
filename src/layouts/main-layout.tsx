"use client";
import React, { useEffect, useState } from "react";
import { Layout, Menu, theme } from "antd";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import Search from "antd/es/input/Search";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setSearchKeywords } from "@/store/slicers/searchKeywordsSlicer";
import axios from "axios";
import { setUserInfo } from "@/store/slicers/userInfoSlicer";

const { Header, Content, Footer } = Layout;

const items = new Array(3).fill(null).map((_, index) => ({
  key: String(index + 1),
  label: `nav ${index + 1}`,
}));

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
}: MainLayoutProps) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const router = useRouter();
  const dispatch = useDispatch();
  const [keywords, setKeywords] = useState("");
  const { userId } = useAuth();

  useEffect(() => {
    const saveUserInfo = async () => {
      const rawUserInfo = await axios.get(`/api/user?clerkId=${userId}`);
      const userInfo = {
        id: rawUserInfo.data._id,
        clerkId: rawUserInfo.data.clerkId,
        email: rawUserInfo.data.email,
        username: rawUserInfo.data.username,
        photo: rawUserInfo.data.photo,
        firstName: rawUserInfo.data.firstName,
        lastName: rawUserInfo.data.lastName,
      };

      dispatch(setUserInfo(userInfo));
    };
    saveUserInfo();
  }, []);

  useEffect(() => {
    const saveSearchKeywords = setTimeout(() => {
      dispatch(setSearchKeywords(keywords));
    }, 500);
    return () => clearTimeout(saveSearchKeywords);
  }, [keywords]);

  return (
    <Layout>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "white",
          height: "125px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            className="demo-logo"
            style={{
              width: "100px",
              fontWeight: "800",
              fontSize: "16px",
              color: "brown",
              cursor: "pointer",
            }}
            onClick={() => {
              router.push("/");
            }}
          >
            Coffee Time
          </div>
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={["2"]}
            items={items}
            style={{ minWidth: 0, borderBottom: "none" }}
          />
          <div>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
        <Search
          placeholder="Input the name ..."
          style={{ width: "500px", marginTop: "10px", marginBottom: "10px" }}
          size="large"
          onChange={(e) => setKeywords(e.target.value)}
        />
      </Header>
      <Content style={{ padding: "0 48px", backgroundColor: "white" }}>
        <div
          style={{
            padding: 24,
            minHeight: 380,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        tyrell ©{new Date().getFullYear()} Made with free time.
      </Footer>
    </Layout>
  );
};

export default MainLayout;
