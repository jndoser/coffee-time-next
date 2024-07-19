"use client";
import React, { useEffect, useState } from "react";
import { Layout, Menu, theme } from "antd";
import { SignedIn, useAuth, UserButton, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserInfo } from "@/store/slicers/userInfoSlicer";
import Search from "antd/es/input/Search";
import { setSearchKeywords } from "@/store/slicers/searchKeywordsSlicer";

const { Header, Content, Footer, Sider } = Layout;

const items = [
  {
    key: "all-coffee-shop",
    label: "All Coffee Shop",
  },
  {
    key: "coffee-detail",
    label: "Cofee Detail",
  },
  {
    key: "menu-list",
    label: "Menu List",
  },
];

interface OwnerLayoutProps {
  children: React.ReactNode;
}

const OwnerLayout: React.FC<OwnerLayoutProps> = ({ children }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { userId } = useAuth();
  const dispatch = useDispatch();
  const { user } = useUser();
  const [keywords, setKeywords] = useState("");

  useEffect(() => {
    const saveUserInfo = async () => {
      const rawUserInfo = await axios.get(`/api/user?clerkId=${userId}`);
      const userInfo = {
        id: rawUserInfo.data.users[0]._id,
        clerkId: rawUserInfo.data.users[0].clerkId,
        email: rawUserInfo.data.users[0].email,
        username: rawUserInfo.data.users[0].username,
        photo: rawUserInfo.data.users[0].photo,
        firstName: rawUserInfo.data.users[0].firstName,
        lastName: rawUserInfo.data.users[0].lastName,
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
    <Layout hasSider>
      <Sider
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="flex flex-col items-center justify-center py-6">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <div className="text-white mt-3">
            {`${user?.firstName} ${user?.lastName}`}{" "}
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["all-coffee-shop"]}
          items={items}
        />
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Header
          style={{
            position: "sticky",
            top: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            background: colorBgContainer,
            zIndex: 1,
          }}
        >
          <Search
            placeholder="Input the name ..."
            style={{ width: "500px", marginTop: "10px", marginBottom: "10px" }}
            size="large"
            onChange={(e) => setKeywords(e.target.value)}
          />
        </Header>
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <div
            style={{
              padding: 24,
              textAlign: "left",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default OwnerLayout;
