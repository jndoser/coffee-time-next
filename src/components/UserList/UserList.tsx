"use client";
import React, { useEffect, useState } from "react";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { App, Avatar, List, Skeleton, Space } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import SkeletonButton from "antd/es/skeleton/Button";

const IconText = ({
  icon,
  text,
  loading,
  onClick,
}: {
  icon: React.FC;
  text: string;
  loading: boolean;
  onClick: () => void;
}) => {
  return loading ? (
    <SkeletonButton active shape="round" />
  ) : (
    <Space className="cursor-pointer" onClick={onClick}>
      {React.createElement(icon)}
      {text}
    </Space>
  );
};

interface UserType {
  id: string;
  clerkId: string;
  email: string;
  username: string;
  photo: string;
  firstName: string;
  lastName: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const searchKeywords = useSelector(
    (state: RootState) => state.searchKeywords.searchKeywords
  );
  const isDisplayOwner = useSelector(
    (state: RootState) => state.adminState.isDisplayOwner
  );

  const getUsers = async (page: number, searchKeywords: string) => {
    setLoading(true);
    const res = await axios.get(
      `/api/user?role=${
        isDisplayOwner ? "owner" : "user"
      }&page=${page}&limit=5&searchKeywords=${searchKeywords}&isRejected=false`
    );
    const rawUsersData = res.data;
    const userListData = rawUsersData.users.map((user: any) => ({
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      username: user.username,
      photo: user.photo,
      firstName: user.firstName,
      lastName: user.lastName,
    }));
    setUsers(userListData);
    setTotalCount(rawUsersData.totalCount);
    setLoading(false);
  };

  useEffect(() => {
    getUsers(1, searchKeywords);
  }, [searchKeywords, isDisplayOwner]);

  const setOwnerRoleForUser = async (userId: string) => {
    const res = await axios.patch(`/api/user/${userId}`, {
      action: "SET_ROLE",
      role: "owner",
    });

    if (res.status === 200) {
      message.success("Approve successfully");
      getUsers(1, "");
    }
  };

  const revokeOwnerRoleForUser = async (userId: string) => {
    const res = await axios.patch(`/api/user/${userId}`, {
      action: "SET_ROLE",
      role: "user",
    });

    if (res.status === 200) {
      message.success("Revoke successfully");
      getUsers(1, "");
    }
  };

  const rejectOwnerRegistration = async (userId: string) => {
    const res = await axios.patch(`/api/user/${userId}`, {
      action: "REJECT",
    });

    if (res.status === 200) {
      message.success("Reject successfully");
      getUsers(1, "");
    }
  };

  return (
    <List
      itemLayout="horizontal"
      pagination={{
        onChange: async (page) => {
          await getUsers(page, "");
        },
        pageSize: 5,
        total: totalCount,
        style: { textAlign: "center" },
      }}
      dataSource={users}
      renderItem={(user) => (
        <List.Item
          key={user.id}
          actions={
            !isDisplayOwner
              ? [
                  <IconText
                    icon={CheckCircleOutlined}
                    text="Approve"
                    key="list-vertical-star-o"
                    loading={loading}
                    onClick={() => {
                      setOwnerRoleForUser(user.id);
                    }}
                  />,
                  <IconText
                    icon={CloseCircleOutlined}
                    text="Reject"
                    key="list-vertical-like-o"
                    loading={loading}
                    onClick={() => {
                      rejectOwnerRegistration(user.id);
                    }}
                  />,
                ]
              : [
                  <IconText
                    icon={CloseCircleOutlined}
                    text="Revoke"
                    key="list-vertical-like-o"
                    loading={loading}
                    onClick={() => {
                      revokeOwnerRoleForUser(user.id);
                    }}
                  />,
                ]
          }
        >
          <Skeleton loading={loading} avatar active>
            <List.Item.Meta
              avatar={<Avatar src={user.photo} />}
              title={
                <a>
                  {user.firstName} {user.lastName}
                </a>
              }
              description={user.email}
            />
          </Skeleton>
        </List.Item>
      )}
    />
  );
};

export default UserList;
