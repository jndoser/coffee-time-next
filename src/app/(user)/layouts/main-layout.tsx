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
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setSearchKeywords } from "@/store/slicers/searchKeywordsSlicer";
import axios from "axios";
import { setUserInfo } from "@/store/slicers/userInfoSlicer";
import Title from "antd/es/typography/Title";

const { Header, Content, Footer } = Layout;

const items = [
  {
    key: "home",
    label: <Title level={5}>Home</Title>,
  },
  {
    key: "browser",
    label: <Title level={5}>Browser</Title>,
  },
  {
    key: "about-us",
    label: <Title level={5}>About Us</Title>,
  },
  {
    key: "search-coffee-shop",
    label: <Title level={5}>Maps</Title>,
  },
];

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
  const pathname = usePathname();

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
    if (userId) {
      saveUserInfo();
    }
  }, []);

  useEffect(() => {
    const saveSearchKeywords = setTimeout(() => {
      dispatch(setSearchKeywords(keywords));
    }, 500);
    return () => clearTimeout(saveSearchKeywords);
  }, [keywords]);

  const clickMenuHandler = ({ key }: any) => {
    switch (key) {
      case "home":
        router.push("/home");
        break;
      case "browser":
        router.push("/");
        break;
      case "about-us":
        router.push("about-us");
        break;
      case "search-coffee-shop":
        router.push("/search-coffee-shop");
        break;
      default:
        router.push("/");
    }
  };

  const getSelectedKey = () => {
    switch (pathname) {
      case "/":
        return "browser";
      case "/home":
        return "home";
      case "/about-us":
        return "about-us";
      case "/search-coffee-shop":
        return "search-coffee-shop";
      default:
        return "browser";
    }
  };

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
            defaultSelectedKeys={[getSelectedKey()]}
            items={items}
            style={{ minWidth: 0, borderBottom: "none" }}
            onClick={clickMenuHandler}
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
