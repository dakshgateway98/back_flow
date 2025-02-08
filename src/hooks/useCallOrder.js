import { isEmpty } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { setToken } from "../api";
import { getAllItemInfoByDaysApi } from "../api/iteminfo";
import { getAllOrdersByDaysApi, getOrderInfoApi } from "../api/orders";
import { updateDateTime } from "../redux/actions/userActions";
import { orderToken } from "../utils/StaticData";

const useCallOrder = (
  calenderDates,
  setLoader,
  allSubPagesConfig,
  allPages,
  allTemplates,
  allVenueRooms,
  allRooms
) => {
  const [ordersByDate, setOrdersByDate] = useState({});
  const [ordersInfo, setOrdersInfo] = useState({});
  const [itemInfo, setItemInfo] = useState({});

  const location = useLocation();
  const { pathname } = location;
  const pathArray = pathname.split("/");
  const isCategoryProducts = pathArray.includes("product");
  const isReports = pathArray.includes("reports");

  const { startDate, days } = calenderDates;
  const dispatch = useDispatch();

  const getAllOrdersByDays = async (date, days) => {
    setToken(orderToken);
    const res = await getAllOrdersByDaysApi(date, days);
    if (res && res.success === true) {
      setOrdersByDate(res.data || {});
      let dateTime =
        Object.values(res.data).length > 0
          ? Object.values(res.data)[0]?.updated
          : "";
      dispatch(updateDateTime(dateTime));
    }
  };

  const getOrderInfo = async (startDate, days) => {
    setToken(orderToken);
    const res = await getOrderInfoApi(startDate, days);
    if (res && res.success === true) {
      setOrdersInfo(res.data || {});
    }
  };

  const getAllItemInfoByDays = async (date, days) => {
    setToken(orderToken);
    const res = await getAllItemInfoByDaysApi(date, days);
    if (res && res.success === true) {
      setItemInfo(res.data || {});
    }
  };

  const callOrdersApi = useCallback(async () => {
    setLoader(true);
    if (startDate) {
      await getOrderInfo(startDate, days);
      if (isCategoryProducts || isReports) {
        await getAllItemInfoByDays(startDate, days);
      }
      await getAllOrdersByDays(startDate, days);
    }
    setLoader(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, days]);

  useEffect(() => {
    if (isCategoryProducts) {
      if (
        !isEmpty(allSubPagesConfig) &&
        !isEmpty(allTemplates) &&
        !isEmpty(allPages)
      ) {
        callOrdersApi();
      }
    } else if (isReports) {
      if (!isEmpty(allTemplates) && !isEmpty(allPages)) {
        callOrdersApi();
      }
    } else {
      callOrdersApi();
    }
  }, [
    allSubPagesConfig,
    allPages,
    callOrdersApi,
    allTemplates,
    isReports,
    isCategoryProducts,
    allVenueRooms,
    allRooms,
  ]);

  return [ordersByDate, ordersInfo, itemInfo, setItemInfo, setOrdersInfo];
};

export default useCallOrder;
