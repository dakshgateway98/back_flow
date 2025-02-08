import { isEmpty } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToken } from "../../api";
import { getAllModifierAPI } from "../../api/multiplier";
import ListIcon from "../../assets/icons/list.svg";
import {
  calculatePercentage,
  checkNoOrdersHandler,
} from "../../global/helpers";
import { updateMultiplier } from "../../redux/actions/multiplierActions";
import { setting, orderOverViewComponentData } from "../../utils/StaticData";
import useOrderOverviewModal from "../../hooks/useOrderOverviewModal";
import OrderOverviewModal from "../modals/OrderOverviewModal";
import NoData from "../common/NoData";

const stateFormat = "HH:00";
const displayFormat = "hh:mm a";

const Hourly = ({ orders, hourlySubPageConfig, ordersInfo }) => {
  const { multiplierList } = useSelector((state) => state.multiplier);
  const { token } = useSelector((state) => state.user);
  const [
    handleOrderOverviewModal,
    orderOverviewModalShow,
    componentType,
    handleCloseModal,
    handleChangeOrderInfo,
  ] = useOrderOverviewModal(ordersInfo);

  const dispatch = useDispatch();
  let checkNoOrders;
  if (orders) {
    checkNoOrders = checkNoOrdersHandler(orders);
  }
  const [hourlyState, setHourlyState] = useState({
    "09:00": {
      orderSumByTimeSlot: 0,
      productItemSum: 9,
      orderData: [],
      completedPercentage: "0%",
      boxedPercentage: "0%",
    },
    "10:00": {
      orderSumByTimeSlot: 0,
      productItemSum: 9,
      orderData: [],
      completedPercentage: "0%",
      boxedPercentage: "0%",
    },
    "11:00": {
      orderSumByTimeSlot: 2,
      productItemSum: 8,
      orderData: [],
      completedPercentage: "0%",
      boxedPercentage: "0%",
    },
    "12:00": {
      orderSumByTimeSlot: 3,
      productItemSum: 7,
      orderData: [],
      completedPercentage: "0%",
      boxedPercentage: "0%",
    },
    "13:00": {
      orderSumByTimeSlot: 4,
      productItemSum: 6,
      orderData: [],
      completedPercentage: "0%",
      boxedPercentage: "0%",
    },
    "14:00": {
      orderSumByTimeSlot: 5,
      productItemSum: 5,
      orderData: [],
      completedPercentage: "0%",
      boxedPercentage: "0%",
    },
    "15:00": {
      orderSumByTimeSlot: 6,
      productItemSum: 4,
      orderData: [],
      completedPercentage: "0%",
      boxedPercentage: "0%",
    },
    "16:00": {
      orderSumByTimeSlot: 7,
      productItemSum: 3,
      orderData: [],
      completedPercentage: "0%",
      boxedPercentage: "0%",
    },
    "17:00": {
      orderSumByTimeSlot: 7,
      productItemSum: 2,
      orderData: [],
      completedPercentage: "0%",
      boxedPercentage: "0%",
    },
    "18:00": {
      orderSumByTimeSlot: 8,
      productItemSum: 1,
      orderData: [],
      completedPercentage: "0%",
      boxedPercentage: "0%",
    },
    "19:00": {
      orderSumByTimeSlot: 8,
      productItemSum: 1,
      orderData: [],
      completedPercentage: "0%",
      boxedPercentage: "0%",
    },
    "20:00": {
      orderSumByTimeSlot: 8,
      productItemSum: 1,
      orderData: [],
      completedPercentage: "0%",
      boxedPercentage: "0%",
    },
    "21:00": {
      orderSumByTimeSlot: 8,
      productItemSum: 1,
      orderData: [],
      completedPercentage: "0%",
      boxedPercentage: "0%",
    },
    "22:00": {
      orderSumByTimeSlot: 8,
      productItemSum: 1,
      orderData: [],
      completedPercentage: "0%",
      boxedPercentage: "0%",
    },
  });

  const getModifierRecipeQuantity = (modifierItems, recipeId) => {
    if (modifierItems) {
      let sum = 0;
      modifierItems.forEach((mod) => {
        if (mod?.modifier?.recipe) {
          mod?.modifier?.recipe.forEach((rcp) => {
            if (
              rcp?.ingredient_id &&
              parseInt(rcp?.ingredient_id) === recipeId
            ) {
              sum += rcp?.qty;
            }
          });
        }
      });
      return sum;
      // return sum === 0 ? 1 : sum;
    }
    return 1;
  };

  const getMultiplierValue = (appInfo, multiplier) => {
    if (multiplier) {
      const multiplierName = multiplierList.find(
        (multiplierItem) => multiplierItem.id === +multiplier
      )?.name;
      return appInfo[multiplierName] || 1;
    }
    return 1;
  };

  const existID = (arr, ID) => {
    const selectedId = arr.filter((arrId) => parseInt(arrId) === parseInt(ID));
    if (selectedId && selectedId.length > 0) {
      return true;
    }
    return false;
  };

  const calculateProductQuantity = (itemsArray) => {
    const tempArr = hourlySubPageConfig.map((subPage) => {
      let sum = 0;
      itemsArray.forEach((item) => {
        if (item?.cake_items && !isEmpty(item?.cake_items)) {
          item?.cake_items.forEach((cake_item) => {
            if (existID(subPage?.revel_ids, cake_item?.product?.id)) {
              if (subPage?.recipe && subPage?.recipe_id.toString()) {
                sum +=
                  (cake_item?.quantity *
                    getModifierRecipeQuantity(
                      cake_item?.modifieritems,
                      subPage?.recipe_id
                    ) *
                    getMultiplierValue(
                      cake_item?.product?.app_info,
                      subPage?.multiplier
                    ) *
                    getMultiplierValue(
                      cake_item?.product?.app_info,
                      subPage?.multiplier_2
                    )) /
                  (subPage?.batch || 1);
              } else {
                sum +=
                  (cake_item?.quantity *
                    getMultiplierValue(
                      cake_item?.product?.app_info,
                      subPage?.multiplier
                    ) *
                    getMultiplierValue(
                      cake_item?.product?.app_info,
                      subPage?.multiplier_2
                    )) /
                  (subPage?.batch || 1);
              }
            }
          });
        } else {
          if (existID(subPage?.revel_ids, item?.product?.id)) {
            if (subPage?.recipe && subPage?.recipe_id.toString()) {
              sum +=
                (item?.quantity *
                  getModifierRecipeQuantity(
                    item?.modifieritems,
                    subPage?.recipe_id
                  ) *
                  getMultiplierValue(
                    item?.product?.app_info,
                    subPage?.multiplier
                  ) *
                  getMultiplierValue(
                    item?.product?.app_info,
                    subPage?.multiplier_2
                  )) /
                (subPage?.batch || 1);
            } else {
              sum +=
                (item?.expanded_quantity *
                  getMultiplierValue(
                    item?.product?.app_info,
                    subPage?.multiplier
                  ) *
                  getMultiplierValue(
                    item?.product?.app_info,
                    subPage?.multiplier_2
                  )) /
                (subPage?.batch || 1);
            }
          }
        }
      });
      return {
        id: subPage.id,
        dataShow: sum,
      };
    });
    return tempArr;
  };

  const getObj = (arr) => {
    const result = arr.map(([id, orderDetail]) => {
      return {
        id: id,
        fullName:
          orderDetail?.customer?.first_name +
          " " +
          orderDetail?.customer?.last_name,
        orderId: orderDetail?.local_id,
        orderTime: moment(orderDetail?.pickup_time).format(displayFormat),
        productQuantity: calculateProductQuantity(orderDetail?.items),
        completed: handleCompletedCheck(id),
        boxed: handleBoxCheck(id),
        orderDetail,
      };
    });
    return result;
  };

  const filterTimeSlot = (pickupTime, timeSlot) => {
    const pt = moment(pickupTime, stateFormat);
    if (timeSlot === "09:00") {
      return pt.isBefore(moment("10:00", stateFormat));
    } else if (timeSlot === "22:00") {
      return pt.isAfter(moment("21:00", stateFormat));
    } else {
      return pickupTime === timeSlot;
    }
  };

  const getTotalCompletedData = (orderData) => {
    const totalCompleted = orderData.reduce(
      (acc, item) => (acc += item?.completed ? 1 : 0),
      0
    );
    const totalItems = orderData.length;

    return [totalCompleted, totalItems];
  };
  const getTotalBoxedData = (orderData) => {
    const totalBoxed = orderData.reduce(
      (acc, item) => (acc += item?.boxed ? 1 : 0),
      0
    );
    const totalItems = orderData.length;

    return [totalBoxed, totalItems];
  };
  useEffect(() => {
    if (!isEmpty(orders)) {
      const tempHourlyState = { ...hourlyState };
      const allorders = Object.entries(orders).map(
        ([orderDate, orderData]) => orderData.orders
      );
      const updatedData = Object.entries(tempHourlyState).map(
        ([timeSlot, allData]) => {
          const data = allorders.map((order) =>
            Object.entries(order).filter(([orderId, orderDetail]) => {
              const pickupTime = moment(orderDetail?.pickup_time).format(
                "HH:00"
              );
              return filterTimeSlot(pickupTime.trim(), timeSlot.trim());
            })
          );
          return [
            timeSlot,
            {
              ...allData,
              orderSumByTimeSlot: data.flat().length,
              orderData: [...getObj(data.flat())].flat(),
              completedPercentage: calculatePercentage(
                [...getObj(data.flat())].flat(),
                getTotalCompletedData
              ),
              boxedPercentage: calculatePercentage(
                [...getObj(data.flat())].flat(),
                getTotalBoxedData
              ),
            },
          ];
        }
      );
      setHourlyState(Object.fromEntries(updatedData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, ordersInfo]);
  const getAllMultiplierData = async () => {
    setToken(token);
    const res = await getAllModifierAPI();
    if (res && res.success === true) {
      const data =
        res.data.find((val) => val?.id === setting.multiplier_ID)?.settings ||
        [];
      dispatch(updateMultiplier([...data]));
    }
  };

  useEffect(() => {
    const defaultUseEffect = async () => {
      if (!multiplierList || multiplierList.length === 0) {
        await getAllMultiplierData();
      }
    };
    defaultUseEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSort = (orderData) =>
    orderData.sort((a, b) => {
      const { orderTime: a_orderTime } = a;
      const { orderTime: b_orderTime } = b;
      const a_orderTimeMoment = moment(a_orderTime, displayFormat).valueOf();
      const b_orderTimeMoment = moment(b_orderTime, displayFormat).valueOf();
      if (a_orderTimeMoment !== b_orderTimeMoment)
        return a_orderTimeMoment - b_orderTimeMoment;
      else
        return a.fullName
          .replace(/\s/g, "")
          .localeCompare(b.fullName.replace(/\s/g, ""));
    });

  const calculateTotalOrders = () => {
    let tempSum = 0;
    Object.entries(hourlyState).forEach(([timeSlot, allData]) => {
      const { orderData } = allData;
      tempSum += orderData.length;
    });
    return tempSum;
  };

  const renderSubPageConfigTable = (returnType, displayData, isMainHead) => {
    switch (returnType) {
      case "column":
        return (
          <>
            {displayData &&
              displayData.map((data) => (
                <col key={data.id} style={{ minWidth: "120px" }} />
              ))}
          </>
        );
      case "head":
        return (
          <>
            {displayData &&
              displayData.map((data) => (
                <th key={data.id}>
                  {isMainHead
                    ? data.dataShow
                    : `Sum: ${Number(data.dataShow).toFixed(2)}`}
                </th>
              ))}
          </>
        );
      case "body":
        return (
          <>
            {displayData &&
              displayData.map((data) => (
                <td key={data.id}>{Number(data.dataShow).toFixed(2)}</td>
              ))}
          </>
        );
      default:
        return;
    }
  };

  const calculateSum = (arr) => {
    const result = hourlySubPageConfig.map((subPage) => {
      let sum = 0;
      arr.forEach((ele) =>
        ele.productQuantity.forEach((qty) => {
          if (qty.id === subPage.id) {
            sum += qty.dataShow;
          }
        })
      );
      return {
        id: subPage.id,
        dataShow: sum,
      };
    });
    return result;
  };

  const calculateTotalSum = () => {
    const result = hourlySubPageConfig.map((subPage) => {
      let totalSum = 0;
      Object.entries(hourlyState).forEach(([timeSlot, allData]) => {
        const { orderData } = allData;
        calculateSum(orderData).forEach((data) => {
          if (data.id === subPage.id) totalSum += data.dataShow;
        });
      });

      return {
        id: subPage.id,
        dataShow: totalSum,
      };
    });
    return result;
  };

  const renderSubPageConfigHeader = () => {
    const result = hourlySubPageConfig.map((subPage) => {
      return {
        id: subPage.id,
        dataShow: subPage?.name,
      };
    });
    return result;
  };

  const handleCompletedCheck = (id) => {
    let completed = false;
    Object.entries(ordersInfo).forEach(([date, ordersInfoData]) => {
      if (ordersInfoData?.orders[id])
        completed = ordersInfoData?.orders[id]?.status?.completed?.complete;
    });
    return completed;
  };

  const handleBoxCheck = (id) => {
    let boxed = false;
    Object.entries(ordersInfo).forEach(([date, ordersInfoData]) => {
      if (ordersInfoData?.orders[id])
        boxed = ordersInfoData?.orders[id]?.status?.boxed?.complete;
    });
    return boxed;
  };

  const getOverAllCompletedData = (hourlyState) => {
    let overAllCompletedItems = 0;
    let overAllItems = 0;
    Object.values(hourlyState).forEach((ele) => {
      const [totalCompleted, totalItems] = getTotalCompletedData(ele.orderData);
      overAllCompletedItems += totalCompleted;
      overAllItems += totalItems;
    });
    return [overAllCompletedItems, overAllItems];
  };
  const getOverAllBoxedData = (hourlyState) => {
    let overAllBoxItems = 0;
    let overAllItems = 0;
    Object.values(hourlyState).forEach((ele) => {
      const [totalBaked, totalItems] = getTotalBoxedData(ele.orderData);
      overAllBoxItems += totalBaked;
      overAllItems += totalItems;
    });

    return [overAllBoxItems, overAllItems];
  };

  return (
    <Table
      responsive
      className="editable-table custom-table-striped multi-level-head"
    >
      <colgroup>
        <col width={200} />
        <col width={160} />
        <col width={160} />
        {renderSubPageConfigTable("column", renderSubPageConfigHeader())}
        <col width={140} />
        <col width={140} />
      </colgroup>
      <thead className="border-0">
        <tr>
          <th>Name</th>
          <th>Time</th>
          <th>Orders #</th>
          {renderSubPageConfigTable("head", renderSubPageConfigHeader(), true)}
          <th>Completed</th>
          <th>Boxed</th>
        </tr>
      </thead>
      <tbody>
        <OrderOverviewModal
          show={orderOverviewModalShow}
          onHide={handleCloseModal}
          componenttype={componentType}
          handleChangeOrderInfo={handleChangeOrderInfo}
        />
        {!isEmpty(checkNoOrders) ? (
          <>
            <tr>
              <th>Totals</th>
              <th></th>
              <th>{`Sum: ${calculateTotalOrders()}`}</th>
              {renderSubPageConfigTable("head", calculateTotalSum())}
              <th>
                {`${calculatePercentage(
                  hourlyState,
                  getOverAllCompletedData
                ).toFixed(2)}%`}
              </th>
              <th>{`${calculatePercentage(
                hourlyState,
                getOverAllBoxedData
              ).toFixed(2)}%`}</th>
            </tr>
            {Object.entries(hourlyState).map(([timeSlot, allData]) => {
              const {
                orderSumByTimeSlot,
                completedPercentage,
                boxedPercentage,
                orderData,
              } = allData;
              return (
                <React.Fragment key={timeSlot}>
                  {!isEmpty(orderData) && (
                    <>
                      <tr className="slot-header">
                        <th></th>
                        <th>
                          {moment(timeSlot, "HH:mm").format(displayFormat)}
                        </th>
                        <th>Sum: {orderSumByTimeSlot}</th>
                        {renderSubPageConfigTable(
                          "head",
                          calculateSum(orderData)
                        )}
                        <th>{`${completedPercentage.toFixed(2)}%`}</th>
                        <th>{`${boxedPercentage.toFixed(2)}%`}</th>
                      </tr>
                      {handleSort(orderData).map((data) => (
                        <tr key={data.id}>
                          <td>
                            <div className="d-flex gap-2">
                              <div
                                onClick={() =>
                                  handleOrderOverviewModal(
                                    orderOverViewComponentData?.order,
                                    data?.orderDetail
                                  )
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <img src={ListIcon} alt="list" height={22} />
                              </div>
                              <div>{data.fullName}</div>
                            </div>
                          </td>
                          <td>{data.orderTime}</td>
                          <td>{data.orderId}</td>
                          {renderSubPageConfigTable(
                            "body",
                            data.productQuantity
                          )}
                          <td>
                            <span>{data?.completed ? "done" : "pending"}</span>
                          </td>
                          <td>
                            <span>{data?.boxed ? "done" : "pending"}</span>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </>
        ) : (
          <tr className="bg-white">
            <td colSpan={5}>
              <NoData />
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default Hourly;
