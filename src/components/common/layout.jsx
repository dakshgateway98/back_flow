import React from "react";
import Footer from "./Footer";
import Header from "./Header";
import { useLocation } from "react-router-dom";
import CakeSpinner from "./CakeSpinner";
import OrderOverviewDetailHeader from "./OrderOverviewDetailHeader";

const Layout = ({
  children,
  loader,
  itemInfo,
  checkBoxFilterOrders,
  ...rest
}) => {
  const location = useLocation();
  const { pathname } = location;
  const pathArray = pathname.split("/");
  const isOrderOverviewCategory = pathArray.includes("order-overview-category");

  const isBakerCalcTemplate = () => +rest.showSubpage?.templateId === 9;
  return (
    <>
      <Header isLoggedIn={true} {...rest} />
      {isOrderOverviewCategory && <OrderOverviewDetailHeader />}
      <main style={{ padding: `${isBakerCalcTemplate() ? "0rem" : "2rem"}` }}>
        {loader ? <CakeSpinner /> : children}
      </main>
      <Footer
        isLoggedIn={true}
        itemInfo={itemInfo}
        ordersByDate={checkBoxFilterOrders}
        selectedPageID={rest.showSubpage?.subPageId}
      />
    </>
  );
};
export default Layout;
