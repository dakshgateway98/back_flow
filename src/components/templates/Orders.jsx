import { isEmpty } from "lodash";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { setToken } from "../../api";
import { editItemInfoApi, editMulItemInfoApi } from "../../api/iteminfo";
import { getSingleOrderInfoApi } from "../../api/orders";
import ListIcon from "../../assets/icons/list.svg";
import subDirectorySVG from "../../assets/icons/sub-directory.svg";
import { displaySuccessToast } from "../../global/displayToast";
import useOrderOverviewModal from "../../hooks/useOrderOverviewModal";
import {
  orderOverViewComponentData,
  orderToken,
  pageId,
  phasesId,
  tiersData,
} from "../../utils/StaticData";
import { CheckedIcon, UserIcon } from "../common/icons";
import NoData from "../common/NoData";
import SortButton from "../common/SortButton";
import OrderOverviewModal from "../modals/OrderOverviewModal";
import { useSelector } from "react-redux";
import { hexToRgbA } from "../../global/helpers";

const displayTimeFormat = "ddd MMM. D hh:mm a";
const displayHeaderDateFormat = "dddd, MMMM D";

const sortButtonsData = [
  { name: "customerName", label: "Name" },
  { name: "order_time", label: "Time" },
  { name: "orderLocalId", label: "Order #" },
];

const Orders = ({
  ordersByDate,
  handleUpdateCategoryOrder,
  selectedPage,
  itemInfo,
  setItemInfo,
  setOrdersInfo,
  ordersInfo,
}) => {
  const [displayOrdersByDate, setDisplayOrdersByDate] = useState([]);
  const [isToDisplayAllOrders, setIsToDisplayAllOrders] = useState(false);
  const [activeSortingField, setActiveSortingField] = useState("order_time");
  const [sortOrder, setSortOrder] = useState(false);
  const { data: userData } = useSelector((state) => state.user);

  const [
    handleOrderOverviewModal,
    orderOverviewModalShow,
    componentType,
    handleCloseModal,
    handleChangeOrderInfo,
  ] = useOrderOverviewModal(ordersInfo);

  useEffect(() => {
    if (ordersByDate) {
      const updatedOrders = Object.entries(ordersByDate).map(
        ([OrderDate, orderData]) => {
          const ordersArraybyData = [];
          Object.entries(orderData?.orders).forEach(
            ([orderId, orderDetails]) => {
              ordersArraybyData.push(orderDetails);
            }
          );
          return [OrderDate, ordersArraybyData];
        }
      );
      const removedEmptyOrders = updatedOrders.filter(
        ([orderDate, orderData]) => !isEmpty(orderData)
      );
      if (updatedOrders) {
        setDisplayOrdersByDate(removedEmptyOrders);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersByDate]);

  const handleSort = useCallback((allOrders, sortField, sortOrder) => {
    const sortedList = [...allOrders].sort((a, b) => {
      if (sortField === "customerName") {
        const a_fullName = a.customer.first_name + a.customer.last_name;
        const b_fullName = b.customer.first_name + b.customer.last_name;
        if (a_fullName === undefined || null) return 1;
        if (b_fullName === undefined || null) return -1;
        if (
          a_fullName === undefined ||
          (null && b_fullName === undefined) ||
          null
        )
          return 0;

        return (
          a_fullName.toString().localeCompare(b_fullName.toString(), "en", {
            numeric: true,
          }) * (sortOrder ? 1 : -1)
        );
      } else if (sortField === "orderLocalId") {
        const a_localId = parseInt(a.local_id.replace(/^w/, ""));
        const b_localId = parseInt(b.local_id.replace(/^w/, ""));
        return (a_localId - b_localId) * (sortOrder ? 1 : -1);
      }
      return 0;
    });
    return sortedList;
  }, []);

  const getDataSortedByTime = useCallback((orderData, sortTimeOrder) => {
    const timeSorted = orderData.sort((a, b) => {
      const a_orderTimeMoment = moment(a?.pickup_time).valueOf();
      const b_orderTimeMoment = moment(b?.pickup_time).valueOf();
      return (a_orderTimeMoment - b_orderTimeMoment) * (sortTimeOrder ? 1 : -1);
    });
    return timeSorted;
  }, []);

  const handleTimeSort = useCallback(
    (orderData, sortOrder) => {
      setIsToDisplayAllOrders(false);
      if (orderData) {
        const sortedOrder = orderData.map(([dateSlot, orderDataArry]) => {
          const sortedTimeData = getDataSortedByTime(orderDataArry, sortOrder);
          return [dateSlot, sortedTimeData];
        });
        return sortedOrder;
      }
    },
    [getDataSortedByTime]
  );

  const handleCompletedAPI = async (e, itemId, item) => {
    const payload = {
      completed_phases: {
        [tiersData.tier_one]: {
          [phasesId.completed]: e.target.checked,
        },
        ...(item?.product?.app_info?.ck_build === "dl" && {
          [tiersData.tier_two]: {
            [phasesId.completed]: e.target.checked,
          },
        }),
      },
    };
    setToken(orderToken);
    const res = await editItemInfoApi(payload, itemId);
    if (res && res.success === true) {
      handleUpdateCategoryOrder(res.data, itemId);
      displaySuccessToast(res.message);
      return res;
    }
  };

  const getOrderInfoById = async (orderId, date) => {
    const res = await getSingleOrderInfoApi(+orderId);

    if (res && res.success) {
      setOrdersInfo((prev) => {
        return {
          ...prev,
          [date]: {
            orders: {
              ...prev?.[date].orders,
              [orderId]: res?.data,
            },
          },
        };
      });
    }
  };

  const handleCompletedChange = async (
    e,
    itemId,
    item,
    orderId,
    pickup_time
  ) => {
    // UPDATE displayOrdersByDate state

    const date = moment(pickup_time).format("YYYY-MM-DD");
    setItemInfo((prev) => {
      return {
        ...prev,
        [itemId]: {
          item_phase: e.target.checked ? phasesId.completed : null,
        },
      };
    });

    // API CALL
    const res = await handleCompletedAPI(e, itemId, item);
    const updatedItemInfo = {
      ...itemInfo,
      [itemId]: res.data,
    };

    setItemInfo(updatedItemInfo);

    await getOrderInfoById(orderId, date);
  };

  const handleOnClickSort = (btnName) => {
    setActiveSortingField(btnName);
    setSortOrder((prev) => !prev);
    if (btnName === "order_time") {
      setIsToDisplayAllOrders(false);
    } else {
      setIsToDisplayAllOrders(true);
    }
  };

  const getAllOrders = useCallback((sortedOrders) => {
    const ordersArray = [];

    sortedOrders.forEach(([orderDate, orderData]) => {
      orderData.forEach((orderDetail) => {
        ordersArray.push(orderDetail);
      });
    });

    return ordersArray;
  }, []);

  const getItemsId = (items) => {
    let itemsId = [];
    items.forEach((item) => {
      if (item.cake_items) {
        item.cake_items.forEach((cakeItem) => {
          itemsId.push(cakeItem.id);
        });
      } else {
        itemsId.push(item.id);
      }
    });
    return itemsId;
  };

  const updateItemInfo = (res, idsArray) => {
    if (idsArray.length === 1) {
      const updatedItemInfo = {
        ...itemInfo,
        [idsArray[0]]: res.data,
      };
      setItemInfo(updatedItemInfo);
    } else {
      const updatedItemInfo = {
        ...itemInfo,
        ...res.data,
      };
      setItemInfo(updatedItemInfo);
    }
  };

  const updateItemInfoForIcon = (
    itemId,
    updateKey,
    updateData,
    itemIdsArray
  ) => {
    setItemInfo((prev) => {
      if (itemIdsArray && !itemId) {
        let updatedItemInfo = { ...prev };
        itemIdsArray.forEach((id) => {
          updatedItemInfo = {
            ...updatedItemInfo,
            [id]: {
              ...itemInfo[id],
              [updateKey]: updateData,
            },
          };
        });
        return {
          ...prev,
          ...updatedItemInfo,
        };
      } else {
        return {
          ...prev,
          [itemId]: {
            ...itemInfo[itemId],
            [updateKey]: updateData,
          },
        };
      }
    });
  };

  const handleBoxedOnChange = async (e, items, orderId, pickup_time) => {
    const date = moment(pickup_time).format("YYYY-MM-DD");

    let updatedItemInfo = { ...itemInfo };
    const itemIdsArray = getItemsId(items);

    itemIdsArray.forEach((itemId) => {
      updatedItemInfo = {
        ...itemInfo,
        [itemId]: {
          ...itemInfo[itemId],
          item_phase: e.target.checked ? phasesId.boxed : phasesId.completed,
        },
      };
    });
    setItemInfo(updatedItemInfo);

    let idsForDl = [];
    let idsForSl = [];

    items.forEach((item) => {
      if (item.cake_items) {
        item?.cake_items.forEach((cakeItem) => {
          if (cakeItem?.product?.app_info?.ck_build === "dl") {
            idsForDl.push(cakeItem?.id);
          } else {
            idsForSl.push(cakeItem?.id);
          }
        });
      } else {
        if (item?.product?.app_info?.ck_build === "dl") {
          idsForDl.push(item?.id);
        } else {
          idsForSl.push(item?.id);
        }
      }
    });

    const payloadForSl = {
      ids: idsForSl,
      completed_phases: {
        [tiersData.tier_one]: {
          [phasesId.boxed]: e.target.checked,
        },
      },
      user_id: null,
    };
    const payloadForDl = {
      ids: idsForDl,
      completed_phases: {
        [tiersData.tier_one]: {
          [phasesId.boxed]: e.target.checked,
        },
        [tiersData.tier_two]: {
          [phasesId.boxed]: e.target.checked,
        },
      },
      user_id: null,
    };

    if (!isEmpty(idsForSl)) {
      const res = await editMulItemInfoApi(payloadForSl);
      updateItemInfo(res, idsForSl);
    }

    if (!isEmpty(idsForDl)) {
      const res = await editMulItemInfoApi(payloadForDl);
      updateItemInfo(res, idsForDl);
    }

    await getOrderInfoById(orderId, date);
  };

  const handleDisableCompleted = (item) => {
    if (
      (!selectedPage?.phase_in_id || !itemInfo[item?.id]?.item_phase) &&
      selectedPage?.id !== pageId.decorator
    ) {
      return false;
    }
    if (itemInfo[item?.id]?.item_phase >= selectedPage?.phase_in_id) {
      return false;
    }
    return true;
  };

  const handleDisableBox = (items) => {
    const itemIds = getItemsId(items);
    const isDisabled = itemIds.every((itemId) => {
      const check =
        itemInfo[itemId] && itemInfo[itemId]?.item_phase >= phasesId.completed;
      return check;
    });
    return isDisabled;
  };

  const handleBoxedCheck = (items) => {
    const itemIds = getItemsId(items);
    const boxCheck = itemIds.every(
      (item) => itemInfo[item]?.item_phase === phasesId.boxed
    );
    return boxCheck;
  };

  const handleToast = (item) => {
    const checkDisabled = handleDisableCompleted(item);
    if (checkDisabled) {
      // displayErrorToast("Fill in cake Assembly first");
    }
  };

  const checkAllItemsReady = useCallback(
    (item) => {
      if (item?.cake_items) {
        return item?.cake_items.every((cakeItem) => {
          if (itemInfo[cakeItem.id]) {
            return (
              itemInfo[cakeItem.id]?.item_phase >= selectedPage?.phase_in_id
            );
          }
          return false;
        });
      } else {
        if (itemInfo[item?.id]) {
          return itemInfo[item?.id]?.item_phase >= selectedPage?.phase_in_id;
        }
        return false;
      }
    },
    [itemInfo, selectedPage?.phase_in_id]
  );

  const checkOrderReady = (orderDetail) => {
    return orderDetail.items.every((item) => checkAllItemsReady(item));
  };

  const handleCurrentUserStatus = (item, itemInfo, currentUserStatus) => {
    const phaseRequirements = itemInfo?.phase_requirements;

    if (phaseRequirements) {
      if (itemInfo && itemInfo?.item_phase < phasesId.completed) {
        currentUserStatus = "default";
      } else if (itemInfo && itemInfo?.item_phase === phasesId.boxed) {
        currentUserStatus = "completed";
      } else if (itemInfo && itemInfo?.item_phase === phasesId.completed) {
        currentUserStatus = "in-progress";
      } else {
        currentUserStatus = "default";
      }
    }
    return [currentUserStatus, false];
  };

  const getcurrentUserStatus = (item) => {
    let currentUserStatus = "default";
    let cakeItemModifiersChecks = [];
    if (item?.cake_items) {
      item?.cake_items.forEach((cakeItem) => {
        const [currentStatus, isCompleted] = handleCurrentUserStatus(
          cakeItem,
          itemInfo[cakeItem.id],
          currentUserStatus
        );
        currentUserStatus = currentStatus;
        cakeItemModifiersChecks.push(isCompleted);
      });
    } else {
      const [currentStatus, isCompleted] = handleCurrentUserStatus(
        item,
        itemInfo[item.id],
        currentUserStatus
      );
      cakeItemModifiersChecks.push(isCompleted);
      currentUserStatus = currentStatus;
    }

    if (
      !isEmpty(cakeItemModifiersChecks) &&
      cakeItemModifiersChecks.every((check) => check)
    ) {
      currentUserStatus = "completed";
    }
    return currentUserStatus;
  };

  const isCurrentUser = (item) => {
    const requiredItem = itemInfo[item.id];
    if (item?.cake_items) {
      const check = item.cake_items.some((cakeItem) => {
        const requiredCakeItem = itemInfo[cakeItem.id];
        return (
          requiredCakeItem &&
          requiredCakeItem?.user &&
          requiredCakeItem?.user?.id &&
          requiredCakeItem?.item_phase !== phasesId.cakeAssembled
        );
      });
      return check;
    } else {
      return (
        requiredItem &&
        requiredItem?.user &&
        requiredItem?.user?.id &&
        requiredItem?.item_phase !== phasesId.cakeAssembled
      );
    }
  };

  const handleEditMulItemInfo = async (payload, itemIdsArray) => {
    const mulItemPayload = {
      ids: itemIdsArray,
      ...payload,
    };
    let res = await editMulItemInfoApi(mulItemPayload);

    if (res.data.item_phase === phasesId.cakeAssembled) {
      const payload = {
        user_id: null,
      };
      res = await editMulItemInfoApi(payload, itemIdsArray);
    }

    setItemInfo((prev) => {
      return {
        ...prev,
        ...res.data,
      };
    });
  };

  const handleEditItemInfo = async (payload, item, cakeItems) => {
    const itemId = item?.id;
    let res = await editItemInfoApi(payload, itemId);
    if (cakeItems) {
      const otherItems = cakeItems.filter(
        (cakeItem) => cakeItem?.id !== item?.id
      );
      const isAllItemsCompleted = otherItems.every(
        (otherItem) =>
          itemInfo[otherItem?.id]?.item_phase === phasesId.cakeAssembled
      );
      if (
        isAllItemsCompleted &&
        res.data.item_phase === phasesId.cakeAssembled
      ) {
        const itemIdsArray = cakeItems.map((cakeItem) => cakeItem?.id);
        const payload = {
          ids: itemIdsArray,
          user_id: null,
        };
        res = await editMulItemInfoApi(payload, itemIdsArray);
        setItemInfo((prev) => {
          return {
            ...prev,
            ...res.data,
          };
        });
      } else {
        setItemInfo((prev) => {
          return {
            ...prev,
            [itemId]: res.data,
          };
        });
      }
    } else {
      if (res.data.item_phase === phasesId.cakeAssembled) {
        const payload = {
          user_id: null,
        };
        res = await editItemInfoApi(payload, itemId);
      }
      setItemInfo((prev) => {
        return {
          ...prev,
          [itemId]: res.data,
        };
      });
    }
  };

  const handleItemActive = async (item, isCompleted) => {
    let requiredItemInfo = itemInfo[item?.id];
    if (item?.cake_items) {
      requiredItemInfo = itemInfo[item.cake_items[0]?.id];
    }
    let userId = isCompleted ? null : userData?.id;
    let updatedUser = {
      color: isCompleted ? null : userData?.color,
      id: userId,
      username: isCompleted ? null : userData?.username,
    };
    if (requiredItemInfo?.user?.id === userId) {
      const user = requiredItemInfo?.user;
      if (user?.color && user.id && user.username) {
        userId = null;
        updatedUser = {
          color: null,
          id: userId,
          username: null,
        };
      }
    }

    const payload = {
      user_id: userId,
    };

    if (item?.cake_items) {
      const itemIdsArray = item.cake_items.map((cakeItem) => cakeItem?.id);

      updateItemInfoForIcon(null, "user", updatedUser, itemIdsArray);

      handleEditMulItemInfo(payload, itemIdsArray);
    } else {
      updateItemInfoForIcon(item?.id, "user", updatedUser);

      handleEditItemInfo(payload, item, item?.cake_items);
    }
  };

  const getRequiredItem = (item) => {
    if (item?.cake_items) {
      return itemInfo[item?.cake_items[0]?.id];
    } else return itemInfo[item.id];
  };

  const getItemColor = (requiredItem) => {
    let itemColor = "#ffffff";
    if (requiredItem && requiredItem?.user && requiredItem?.user?.color) {
      itemColor = requiredItem?.user?.color;
    }
    return itemColor;
  };

  const renderIcon = (item) => {
    const currentUserStatus = getcurrentUserStatus(item);
    return (
      <Button
        className={`status-btn status-${
          isCurrentUser(item) ? "pink" : currentUserStatus
        }`}
        onClick={() => handleItemActive(item)}
        disabled={currentUserStatus === "completed"}
      >
        {isCurrentUser(item) ? (
          <div className="d-flex align-items-center ">
            <div className="text-white">
              {getRequiredItem(item)?.user?.username}
            </div>
            <UserIcon color="white" />
          </div>
        ) : currentUserStatus === "completed" ? (
          <CheckedIcon color="white" />
        ) : (
          <UserIcon color="white" />
        )}
      </Button>
    );
  };

  const renderItems = (
    item,
    index,
    self,
    orderID,
    pickup_time,
    isDecorator
  ) => (
    <React.Fragment key={item.id + index}>
      <tr>
        {selectedPage?.id === pageId?.decorator ? (
          <td className="ps-2">
            <div></div>

            <div>
              {" "}
              {item?.quantity} X {item?.product?.name}
            </div>
            <div>
              {item?.modifieritems &&
                item?.modifieritems.map((modifierItem) => {
                  return [...Array(modifierItem?.qty).keys()].map((value) => (
                    <div className="ps-2">
                      <img
                        src={subDirectorySVG}
                        className="p-1"
                        height="30"
                        width="30"
                        alt=""
                      />
                      {modifierItem?.modifier?.name}
                    </div>
                  ));
                })}
            </div>
          </td>
        ) : (
          <>
            <td>{item?.product?.categories_text.split("/")[1] || ""}</td>
            <td className="ps-2">
              {item?.quantity} X {item?.product?.name}{" "}
            </td>
          </>
        )}

        {selectedPage?.id !== pageId.backerOrder && (
          <td>
            <span onClick={() => handleToast(item)}>
              <Form.Group>
                <Form.Check
                  disabled={handleDisableCompleted(item)}
                  onChange={(e) =>
                    handleCompletedChange(
                      e,
                      item.id,
                      item,
                      orderID,
                      pickup_time
                    )
                  }
                  label=""
                  id={`complete-${item.id}`}
                  checked={itemInfo[item.id]?.item_phase >= phasesId.completed}
                  type="checkbox"
                  className={`custom-input-box checkbox-24 ${
                    handleDisableCompleted(item) && "cursorNotAllowed"
                  }`}
                  name={"item1"}
                />
              </Form.Group>
            </span>
          </td>
        )}
        {selectedPage?.id === pageId.standardCakes && (
          <td className="text-center">
            <Form.Group>
              <Form.Check
                disabled={!handleDisableBox([item])}
                onChange={(e) =>
                  handleBoxedOnChange(e, [item], orderID, pickup_time)
                }
                label=""
                id={`standardCakesboxed-${item?.id}`}
                type="checkbox"
                className={`custom-input-box checkbox-24 ${
                  !handleDisableBox([item]) && "cursorNotAllowed"
                }`}
                checked={handleBoxedCheck([item])}
                name={"standardCakes-box"}
              />
            </Form.Group>
          </td>
        )}
      </tr>

      {selectedPage?.id !== pageId?.decorator &&
        item?.modifieritems &&
        item?.modifieritems.map((modifierItem) => {
          return [...Array(modifierItem?.qty).keys()].map((value) => (
            <tr key={`${modifierItem.id}-${value}`}>
              <td></td>
              <td className="ps-2">
                <img
                  src={subDirectorySVG}
                  className="p-1"
                  height="30"
                  width="30"
                  alt=""
                />
                {modifierItem?.modifier?.name}
              </td>
            </tr>
          ));
        })}

      {self.length > 1 && (
        <tr>
          <td colSpan={selectedPage?.id === pageId.decorator ? 2 : 3}>
            <hr />
          </td>
        </tr>
      )}
    </React.Fragment>
  );

  const renderOrders = (ordersArray) => {
    return ordersArray.map((orderDetail) => (
      <tr key={orderDetail.id}>
        <td>
          <div className="d-flex gap-2">
            <div
              onClick={() =>
                handleOrderOverviewModal(
                  orderOverViewComponentData?.order,
                  orderDetail
                )
              }
              style={{ cursor: "pointer" }}
            >
              <img src={ListIcon} alt="list" height={35} />
            </div>
            <div>
              {orderDetail?.customer?.first_name +
                " " +
                orderDetail?.customer?.last_name}
            </div>
          </div>
        </td>
        <td>{moment(orderDetail?.pickup_time).format(displayTimeFormat)}</td>
        <td className="ps-3">{orderDetail?.local_id}</td>
        {selectedPage?.id === pageId.decorator && (
          <>
            <td>
              <div
                className={`order-status ${
                  checkOrderReady(orderDetail) ? "ready" : "pending"
                }`}
              >
                {checkOrderReady(orderDetail) ? "Ready" : "Pending"}
              </div>
            </td>
            <td>
              <span className="ms-3">F2</span>
            </td>
          </>
        )}
        <td>
          {orderDetail?.items.map((item, index, self) => {
            let requiredItem = itemInfo[item.id];
            if (item?.cake_items) {
              requiredItem = itemInfo[item.cake_items[0]?.id];
            }
            return (
              <table
                className={`w-100 ${
                  selectedPage?.id !== pageId?.backerOrder ? "table-fixed" : ""
                }`}
                style={{
                  backgroundColor: `${hexToRgbA(getItemColor(requiredItem))}`,
                }}
                key={item.id + index}
              >
                <colgroup>
                  {selectedPage?.id === pageId.decorator ? (
                    <col width={280} />
                  ) : (
                    <>
                      <col style={{ minWidth: "150px" }} />
                      <col width={380} />
                    </>
                  )}
                  {selectedPage?.id === pageId.standardCakes ? (
                    <col width={60} />
                  ) : (
                    <>
                      {selectedPage?.id !== pageId.backerOrder && (
                        <col width={40} />
                      )}
                    </>
                  )}
                  {selectedPage?.id === pageId.standardCakes && (
                    <col width={60} />
                  )}
                </colgroup>
                <tbody>
                  {item?.cake_items ? (
                    selectedPage?.id === pageId.decorator ? (
                      <React.Fragment key={item.id + index}>
                        <tr>
                          <td>
                            <div>
                              <div>
                                {item?.product?.categories_text.split("/")[1] ||
                                  ""}
                              </div>
                              <div>
                                {item?.quantity} X {item?.product?.name}
                              </div>
                            </div>
                          </td>
                          <td>{renderIcon(item)}</td>
                        </tr>
                        <tr>
                          <td colSpan={2}>
                            <hr />
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <div>
                              {item?.modifieritems &&
                                item?.modifieritems.map((modifierItem) => (
                                  <div>
                                    <img
                                      src={subDirectorySVG}
                                      className="p-1"
                                      height="30"
                                      width="30"
                                      alt=""
                                    />
                                    {modifierItem?.modifier?.name}
                                  </div>
                                ))}
                            </div>
                          </td>
                        </tr>

                        <tr>
                          <td>&nbsp;</td>
                        </tr>
                        {item?.cake_items.map((cakeItem, cakeIndex, cakeSelf) =>
                          renderItems(
                            cakeItem,
                            cakeIndex,
                            cakeSelf,
                            orderDetail.id,
                            orderDetail.pickup_time,
                            true
                          )
                        )}
                      </React.Fragment>
                    ) : (
                      item?.cake_items.map((cakeItem, cakeIndex, cakeSelf) =>
                        renderItems(
                          cakeItem,
                          cakeIndex,
                          cakeSelf,
                          orderDetail.id,
                          orderDetail.pickup_time,
                          false
                        )
                      )
                    )
                  ) : selectedPage?.id === pageId.decorator ? (
                    <>
                      <tr>
                        <td>
                          <div className="pt-3">
                            <div>
                              {item?.product?.categories_text.split("/")[1] ||
                                ""}
                            </div>
                            <div>
                              {item?.quantity} X {item?.product?.name}
                            </div>
                          </div>
                        </td>
                        <td>{renderIcon(item)}</td>
                      </tr>
                      <tr>
                        <td colSpan={2}>
                          <hr />
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <div>
                            {item?.modifieritems &&
                              item?.modifieritems.map((modifierItem) => (
                                <div>
                                  <img
                                    src={subDirectorySVG}
                                    className="p-1"
                                    height="30"
                                    width="30"
                                    alt=""
                                  />
                                  {modifierItem?.modifier?.name}
                                </div>
                              ))}
                          </div>
                        </td>

                        <td>
                          <span onClick={() => handleToast(item)}>
                            <Form.Group>
                              <Form.Check
                                disabled={handleDisableCompleted(item)}
                                onChange={(e) =>
                                  handleCompletedChange(
                                    e,
                                    item.id,
                                    item,
                                    orderDetail.id,
                                    orderDetail?.pickup_time
                                  )
                                }
                                label=""
                                id={`complete-${item.id}`}
                                checked={
                                  itemInfo[item.id]?.item_phase >=
                                  phasesId.completed
                                }
                                type="checkbox"
                                className={`custom-input-box checkbox-24 ${
                                  handleDisableCompleted(item) &&
                                  "cursorNotAllowed"
                                }`}
                                name={"item1"}
                              />
                            </Form.Group>
                          </span>
                        </td>
                      </tr>
                    </>
                  ) : (
                    renderItems(
                      item,
                      index,
                      self,
                      orderDetail.id,
                      orderDetail?.pickup_time,
                      false
                    )
                  )}
                </tbody>
              </table>
            );
          })}
        </td>
        {selectedPage?.id !== pageId.standardCakes &&
          selectedPage?.id !== pageId.backerOrder && (
            <td className="text-center">
              <Form.Group>
                <Form.Check
                  disabled={!handleDisableBox(orderDetail?.items)}
                  onChange={(e) =>
                    handleBoxedOnChange(
                      e,
                      orderDetail?.items,
                      orderDetail.id,
                      orderDetail?.pickup_time
                    )
                  }
                  label=""
                  id={`boxed-${orderDetail.id}`}
                  type="checkbox"
                  className={`custom-input-box checkbox-24 ${
                    !handleDisableBox(orderDetail?.items) && "cursorNotAllowed"
                  }`}
                  checked={handleBoxedCheck(orderDetail?.items)}
                  name={"order-box"}
                />
              </Form.Group>
            </td>
          )}
      </tr>
    ));
  };

  const sortedAllOrders = useMemo(() => {
    const allOrders = getAllOrders(displayOrdersByDate);
    if (activeSortingField === "order_time") {
      return handleTimeSort(displayOrdersByDate, sortOrder);
    } else {
      return handleSort(allOrders, activeSortingField, sortOrder);
    }
  }, [
    activeSortingField,
    sortOrder,
    displayOrdersByDate,
    getAllOrders,
    handleTimeSort,
    handleSort,
  ]);

  const selectedOrdersView = isToDisplayAllOrders
    ? sortedAllOrders
    : displayOrdersByDate;

  return (
    <Table
      responsive
      className={`${
        selectedPage?.id !== pageId.backerOrder ? "table-layout-fixed " : ""
      }editable-table custom-table-striped`}
    >
      <colgroup>
        <col width={180} />
        <col width={180} />
        <col width={120} />
        {selectedPage?.id === pageId.decorator && (
          <>
            <col width={110} />
            <col width={110} />
          </>
        )}
        {selectedPage?.id === pageId.standardCakes ? (
          <>
            <col width={700} />
            <col width={0} />
          </>
        ) : (
          <>
            {selectedPage?.id === pageId.decorator ? (
              <col style={{ minWidth: "360px" }} />
            ) : (
              <col style={{ minWidth: "450px" }} />
            )}
          </>
        )}
        {selectedPage?.id !== pageId.standardCakes &&
          selectedPage?.id !== pageId.backerOrder && <col width={120} />}
      </colgroup>
      <thead className="border-0 ">
        <tr>
          {sortButtonsData.map((data, index) => (
            <th key={index}>
              <SortButton
                activeSortingField={activeSortingField}
                btnName={data.name}
                onClickSort={handleOnClickSort}
                btnLabel={data.label}
              />
            </th>
          ))}
          {selectedPage?.id === pageId.decorator && (
            <>
              <th>Status</th>
              <th>Daily #</th>
            </>
          )}
          <th>
            <table className="w-100 table-fixed">
              <colgroup>
                {selectedPage?.id === pageId.decorator ? (
                  <col width={280} />
                ) : (
                  <>
                    <col style={{ minWidth: "150px" }} />
                    <col width={380} />
                  </>
                )}
                {selectedPage?.id === pageId.standardCakes ? (
                  <col width={60} />
                ) : (
                  <>
                    {selectedPage?.id !== pageId.backerOrder && (
                      <col width={40} />
                    )}
                  </>
                )}
                {selectedPage?.id === pageId.standardCakes && (
                  <col width={60} />
                )}
              </colgroup>
              <thead>
                <tr>
                  {selectedPage?.id === pageId.decorator ? (
                    <th>
                      <div>Categories</div>
                      <div>Items</div>
                    </th>
                  ) : (
                    <>
                      <th>Categories</th>
                      <th>Items</th>
                    </>
                  )}
                  {selectedPage?.id !== pageId.backerOrder && <th>Done</th>}
                  {selectedPage?.id === pageId.standardCakes && <th>Boxed</th>}
                </tr>
              </thead>
            </table>
          </th>
          {selectedPage?.id !== pageId.standardCakes &&
            selectedPage?.id !== pageId.backerOrder && (
              <th className="text-center">Boxed</th>
            )}
        </tr>
      </thead>
      <tbody>
        <OrderOverviewModal
          show={orderOverviewModalShow}
          onHide={handleCloseModal}
          componenttype={componentType}
          handleChangeOrderInfo={handleChangeOrderInfo}
        />

        {!isEmpty(selectedOrdersView) ? (
          !isToDisplayAllOrders ? (
            selectedOrdersView.map(([dateSlot, orderData]) => (
              <React.Fragment key={dateSlot}>
                <tr className="slot-header">
                  <th
                    colSpan={selectedPage?.id === pageId.decorator ? 7 : 5}
                    className="ps-4"
                  >
                    {moment(dateSlot).format(displayHeaderDateFormat)}
                  </th>
                </tr>
                {renderOrders(orderData)}
              </React.Fragment>
            ))
          ) : (
            renderOrders(selectedOrdersView)
          )
        ) : (
          <tr className="bg-white">
            <td colSpan={selectedPage?.id === pageId.decorator ? 7 : 5}>
              <NoData />
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default Orders;
