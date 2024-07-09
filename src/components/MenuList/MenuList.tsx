"use client";
import { Col, Divider, Flex, Row } from "antd";
import Title from "antd/es/typography/Title";
import React from "react";
import MenuItem from "../MenuItem/MenuItem";
import CustomModal from "../CustomModal/CustomModal";
import { PlusOutlined } from "@ant-design/icons";
import CreateMenuForm from "../CreateMenuForm/CreateMenuForm";

interface TasksProps {
  menus: any[];
}

function MenuList({ menus }: TasksProps) {
  return (
    <>
      <Flex align="center" justify="space-between">
        <CustomModal>
          <CreateMenuForm />
        </CustomModal>
        <Title level={3} style={{ marginTop: 0 }}>
          Your Menu
        </Title>
      </Flex>
      <Divider />
      <Row gutter={[{}, { xs: 16, sm: 16 }]}>
        {menus.map((menu) => (
          <Col key="title" className="gutter-row" xs={9} sm={7}>
            <MenuItem
              title={menu.title}
              price={4}
              image="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
            />
          </Col>
        ))}
        <Col key="title" className="gutter-row" xs={9} sm={7}>
          <div className="w-[75%] h-[92%] flex items-center justify-center m-[10px] border border-[#e5e7eb] rounded-[16px] hover:shadow-lg">
            <PlusOutlined />
          </div>
        </Col>
      </Row>
    </>
  );
}

export default MenuList;
