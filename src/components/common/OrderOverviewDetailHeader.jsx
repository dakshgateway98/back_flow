import moment from "moment";
import React from "react";
import { useSelector } from "react-redux";
import ListWhiteIcon from "../../assets/icons/list-white.svg";

const OrderOverviewDetailHeader = () => {
  const { orderDetail } = useSelector((state) => state.orders);

  return (
    <div className="bg-secondary font-weight-bold mb-3 text-white px-5 d-flex gap-3 py-1 w-100">
      <img src={ListWhiteIcon} alt="list" height={22} />
      <div>Order #: {orderDetail?.local_id}</div>
      <div>
        Name: {orderDetail?.customer?.first_name}{" "}
        {orderDetail?.customer?.last_name}
      </div>
      <div>
        Order Date: {moment(orderDetail?.pickup_time).format("ddd. MMMM DD")}
      </div>
      <div>
        Order Time: {moment(orderDetail?.pickup_time).format("hh:mm A")}
      </div>
    </div>
  );
};

export default OrderOverviewDetailHeader;
