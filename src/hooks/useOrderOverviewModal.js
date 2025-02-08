import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  addSingleOrderDetail,
  addSingleOrderInfoDetail,
  removeOrderOverviewModal,
} from "../redux/actions/orderActions";
import { removeMessageHistory } from "../redux/actions/settingsAction";

const useOrderOverviewModal = (ordersInfo) => {
  const [componentType, setComponentType] = useState(null);
  const [orderOverviewModalShow, setOrderOverviewModalShow] = useState(false);
  const [allordersInfoObj, setAllordersInfoObj] = useState({});

  const dispatch = useDispatch();

  const getAllOrdersInfo = (ordersInfo) => {
    let tempAllOrderInfoObj = {};
    Object.entries(ordersInfo).forEach(([orderDate, data]) => {
      tempAllOrderInfoObj = { ...tempAllOrderInfoObj, ...data.orders };
    });
    return tempAllOrderInfoObj;
  };

  useEffect(() => {
    if (ordersInfo) {
      const tempAllOrderInfoObj = getAllOrdersInfo(ordersInfo);

      setAllordersInfoObj(tempAllOrderInfoObj);
    }
  }, [ordersInfo]);

  const handleOrderOverviewModal = (type, order) => {
    setOrderOverviewModalShow(true);
    setComponentType(type);
    const requiredOrderInfo = allordersInfoObj[order.id];
    dispatch(addSingleOrderDetail(order));
    dispatch(addSingleOrderInfoDetail({ id: order.id, ...requiredOrderInfo }));
  };

  const handleCloseModal = () => {
    setOrderOverviewModalShow(false);
    dispatch(removeOrderOverviewModal());
    dispatch(removeMessageHistory());
  };

  const handleChangeOrderInfo = (id, orderInfoData) => {
    setAllordersInfoObj((prev) => {
      return {
        ...prev,
        [id]: { ...orderInfoData },
      };
    });
  };

  return [
    handleOrderOverviewModal,
    orderOverviewModalShow,
    componentType,
    handleCloseModal,
    handleChangeOrderInfo,
    allordersInfoObj,
  ];
};

export default useOrderOverviewModal;
