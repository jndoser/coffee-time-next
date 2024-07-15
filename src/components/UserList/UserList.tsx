"use client";
import React, { useEffect, useState } from "react";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Avatar, List, Skeleton, Space } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import SkeletonButton from "antd/es/skeleton/Button";

const IconText = ({
  icon,
  text,
  loading,
}: {
  icon: React.FC;
  text: string;
  loading: boolean;
}) => {
  return loading ? (
    <SkeletonButton active shape="round" />
  ) : (
    <Space className="cursor-pointer">
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
  const searchKeywords = useSelector(
    (state: RootState) => state.searchKeywords.searchKeywords
  );

  const getUsers = async (page: number, searchKeywords: string) => {
    setLoading(true);
    const res = await axios.get(
      `/api/user?role=user&page=${page}&limit=5&searchKeywords=${searchKeywords}`
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
  }, [searchKeywords]);

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
          actions={[
            <IconText
              icon={CheckCircleOutlined}
              text="Approve"
              key="list-vertical-star-o"
              loading={loading}
            />,
            <IconText
              icon={CloseCircleOutlined}
              text="Reject"
              key="list-vertical-like-o"
              loading={loading}
            />,
          ]}
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
