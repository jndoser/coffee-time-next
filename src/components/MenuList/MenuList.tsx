"use client";
import { Col, Divider, Flex, Row } from "antd";
import Title from "antd/es/typography/Title";
import React, { useEffect, useState } from "react";
import MenuItem from "../MenuItem/MenuItem";
import CustomModal from "../CustomModal/CustomModal";
import { PlusOutlined } from "@ant-design/icons";
import CreateMenuForm from "../CreateMenuForm/CreateMenuForm";
import axios from "axios";
import { FoodAndBeverageType } from "../MenuCarousel/MenuCarousel";

interface TasksProps {
  coffeeShopId: string;
}

function MenuList({ coffeeShopId }: TasksProps) {
  const [menus, setMenus] = useState<FoodAndBeverageType[]>([]);
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);

  const closeCreateModalHandler = () => {
    setIsOpenCreateModal(false);
  };

  const getMenus = async () => {
    const rawMenus = await axios.get(
      `/api/food-beverage?coffeeShopId=${coffeeShopId}`
    );
    const menuInfo = rawMenus.data;
    const menus = menuInfo.map((menu: any) => ({
      id: menu._id,
      title: menu.title,
      price: menu.price,
      image: menu.image,
    }));
    setMenus(menus);
  };

  useEffect(() => {
    getMenus();
  }, []);

  return (
    <>
      <Flex align="center" justify="space-between">
        <CustomModal
          isOpen={isOpenCreateModal}
          onCancel={closeCreateModalHandler}
        >
          <CreateMenuForm
            coffeeShopId={coffeeShopId}
            onClose={closeCreateModalHandler}
            onRefresh={getMenus}
          />
        </CustomModal>
        <Title level={3} style={{ marginTop: 0 }}>
          Your Menu
        </Title>
      </Flex>
      <Divider />
      <Row gutter={[{}, { xs: 16, sm: 16 }]}>
        {menus.map((menu: FoodAndBeverageType) => (
          <Col key="title" className="gutter-row" xs={9} sm={7}>
            <MenuItem
              id={menu.id}
              title={menu.title}
              price={menu.price}
              image={menu.image}
              onRefresh={getMenus}
            />
          </Col>
        ))}
        <Col key="title" className="gutter-row" xs={9} sm={7}>
          <div
            className="w-[75%] h-[92%] flex items-center justify-center m-[10px] border border-[#e5e7eb] rounded-[16px] hover:shadow-lg cursor-pointer"
            onClick={() => setIsOpenCreateModal(true)}
          >
            <PlusOutlined />
          </div>
        </Col>
      </Row>
    </>
  );
}

export default MenuList;
