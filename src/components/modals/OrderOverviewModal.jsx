import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import CloseIcon from "../../assets/icons/close_200.svg";
import OpenFullIcon from "../../assets/icons/open_full_200.svg";
import OrderOverViewCategoryLayout from "../orderOverviewCategory/OrderOverViewCategoryLayout";
import OrderOverviewDetailHeader from "../common/OrderOverviewDetailHeader";
import { orderOverViewComponentData } from "../../utils/StaticData";
import { useSelector } from "react-redux";

const OrderOverviewModal = (props) => {
  const { componenttype, ...rest } = props;
  const [renderComponentType, setRenderComponentType] = useState("");
  const {
    orderDetail: orderdetail,
    orderInfoDetail,
    orderItemsInfo,
  } = useSelector((state) => state.orders);

  const { fulFill, order, communication, details, log } =
    orderOverViewComponentData;
  const navigate = useNavigate();

  const handleOpenFullIcon = () => {
    navigate(
      `/order-overview-category/${renderComponentType}/${orderdetail.id}`
    );
    setRenderComponentType(fulFill);
  };
  const navigateOrderOverview = () => {
    navigate("/order-overview");
    setRenderComponentType(fulFill);
    rest.onHide();
  };

  useEffect(() => {
    if (componenttype) {
      setRenderComponentType(componenttype);
    }
  }, [componenttype]);

  const handleCloseModal = () => {
    setRenderComponentType(componenttype);
    rest.onHide();
  };
  return (
    <Modal
      {...rest}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      onHide={() => handleCloseModal()}
      className="modal-overview"
    >
      <Modal.Header className="d-flex flex-column p-0">
        <div className="d-flex justify-content-between align-items-center bg-primary p-2 w-100">
          <div>
            <Button
              className="py-0 px-3 secondary-btn mx-1"
              onClick={() => setRenderComponentType(fulFill)}
            >
              Fulfill
            </Button>
            <Button
              className="py-0 px-3 secondary-btn mx-1"
              onClick={() => setRenderComponentType(order)}
            >
              Order
            </Button>
            <Button
              className="py-0 px-3 secondary-btn mx-1"
              onClick={() => setRenderComponentType(communication)}
            >
              Communication
            </Button>
            <Button
              className="py-0 px-3 secondary-btn mx-1"
              onClick={() => setRenderComponentType(details)}
            >
              Details
            </Button>
            <Button
              className="py-0 px-3 secondary-btn mx-1"
              onClick={() => setRenderComponentType(log)}
            >
              Log
            </Button>
            <Button
              className="py-0 px-3 secondary-btn mx-1"
              onClick={() => navigateOrderOverview()}
            >
              Order Overview
            </Button>
          </div>

          <div className="d-flex gap-2">
            <img
              src={OpenFullIcon}
              style={{ height: "32px", width: "32px", cursor: "pointer" }}
              onClick={() => handleOpenFullIcon()}
              alt="Open Full"
            />
            <img
              src={CloseIcon}
              style={{ height: "38px", width: "38px", cursor: "pointer" }}
              onClick={() => handleCloseModal()}
              alt="close-icon"
            />
          </div>
        </div>
        <OrderOverviewDetailHeader />
      </Modal.Header>
      <Modal.Body className="d-flex flex-column">
        <OrderOverViewCategoryLayout
          type={renderComponentType}
          orderData={orderdetail}
          orderInfoDetail={orderInfoDetail}
          orderItemsInfo={orderItemsInfo}
          {...rest}
        />
      </Modal.Body>
    </Modal>
  );
};

export default OrderOverviewModal;
