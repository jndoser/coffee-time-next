"use client";
import React, { useEffect, useState } from "react";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { App, Avatar, List, Skeleton, Space } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import SkeletonButton from "antd/es/skeleton/Button";
import { fetchUsers, rejectUser, updateUserRole } from "@/actions/user";

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
  const isDisplayApprovedList = useSelector(
    (state: RootState) => state.adminState.isDisplayApprovedList
  );

  const getUsers = async (page: number, searchKeywords: string) => {
    setLoading(true);
    const rawUsersData = await fetchUsers({
      role: isDisplayApprovedList ? "owner" : "user",
      page,
      limit: 5,
      searchKeywords,
      isRejected: false,
    });
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
  }, [searchKeywords, isDisplayApprovedList]);

  const setOwnerRoleForUser = async (userId: string) => {
    const res = await updateUserRole(userId, "owner");

    if (res) {
      message.success("Approve successfully");
      getUsers(1, "");
    }
  };

  const revokeOwnerRoleForUser = async (userId: string) => {
    const res = await updateUserRole(userId, "user");

    if (res) {
      message.success("Revoke successfully");
      getUsers(1, "");
    }
  };

  const rejectOwnerRegistration = async (userId: string) => {
    const res = await rejectUser(userId);

    if (res) {
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
            !isDisplayApprovedList
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
