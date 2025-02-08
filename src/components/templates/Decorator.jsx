import _, { isEmpty } from "lodash";
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
import { hexToRgbA, normalizeOrderWithoutQuantity } from "../../global/helpers";

const displayTimeFormat = "ddd MMM. D hh:mm a";
const displayHeaderDateFormat = "dddd, MMMM D";

const sortButtonsData = [
  { name: "customerName", label: "Name" },
  { name: "order_time", label: "Time" },
  { name: "orderLocalId", label: "Order #" },
];

const getUpdatedId = (itemId, qtyItemIndex) => `${itemId}.${qtyItemIndex}`;

const Decorator = ({
  ordersByDate,
  handleUpdateCategoryOrder,
  selectedPage,
  itemInfo,
  setItemInfo,
  setOrdersInfo,
  ordersInfo,
  searchParams,
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

  const checkAllFilter = (currentFilters, item, index) => {
    const itemId = getUpdatedId(item?.id, index);

    const filterKeys = Object.keys(currentFilters);
    return filterKeys.every((key) => {
      switch (currentFilters[key]) {
        case 0:
          return true;
        case 1:
          return itemInfo[itemId]?.item_phase >= phasesId[key];
        case 2:
          return !(itemInfo[itemId]?.item_phase >= phasesId[key]);
        default:
          return true;
      }
    });
  };

  const getUpdatedOrders = (orders, searchParams) => {
    const tempCurrentFilters = {
      completed: +searchParams.get("completed"),
      boxed: +searchParams.get("boxed"),
      cakeAssembled: +searchParams.get("cakeAssembled"),
    };
    return orders
      .map((order) => {
        const updatedItems = order.items.map((item) => {
          const tempItem = [];
          if (item?.cake_items) {
            const updatedCakeItems = item?.cake_items
              .map((cakeItem, index) => {
                const tempCakeItem = [];
                for (let i = 1; i <= +cakeItem?.quantity; i++) {
                  if (checkAllFilter(tempCurrentFilters, cakeItem, i)) {
                    tempCakeItem.push({ itemObj: cakeItem, index: i });
                  }
                }
                return tempCakeItem;
              })
              .filter((cakeItem) => !isEmpty(cakeItem));
            if (!isEmpty(updatedCakeItems)) {
              return [
                {
                  ...item,
                  cake_items: updatedCakeItems,
                },
              ];
            } else {
              return [];
            }
          } else {
            for (let i = 1; i <= +item?.quantity; i++) {
              if (checkAllFilter(tempCurrentFilters, item, i)) {
                tempItem.push({ itemObj: item, index: i });
              }
            }
            return tempItem;
          }
        });
        return {
          ...order,
          items: updatedItems,
        };
      })
      .filter(
        (order) => !(isEmpty(order?.items) || isEmpty(_.flatten(order?.items)))
      );
  };

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
      if (searchParams) {
        const updatedOrderAsPerQuantity = removedEmptyOrders.map(
          ([orderDate, orderData]) => [
            orderDate,
            getUpdatedOrders(orderData, searchParams),
          ]
        );

        if (updatedOrders) {
          setDisplayOrdersByDate(updatedOrderAsPerQuantity);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersByDate, searchParams]);

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
          ...prev[itemId],
          item_phase: e.target.checked ? phasesId.completed : null,
        },
      };
    });

    // API CALL
    const res = await handleCompletedAPI(e, itemId, item);
    if (res && res.success) {
      const updatedItemInfo = {
        ...itemInfo,
        [itemId]: res.data,
      };
      setItemInfo(updatedItemInfo);
      await getOrderInfoById(orderId, date);
    }
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

  const getItemsIds = (item, index) => {
    const cakeItemsIds = item?.cake_items.map((qtyCakeItems) => {
      const requiredCakeItem = qtyCakeItems.find(
        (qty_ck_item) => qty_ck_item?.index === index
      );
      return getUpdatedId(requiredCakeItem?.itemObj?.id, index);
    });
    return cakeItemsIds;
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

  const handleBoxedOnChange = async (e, orderId, pickup_time, item, index) => {
    const date = moment(pickup_time).format("YYYY-MM-DD");

    if (item?.cake_items) {
      let idsForDl = [];
      let idsForSl = [];

      item?.cake_items.forEach((qtyCakeItems) => {
        const requiredCakeItem = qtyCakeItems.find(
          (qty_ck_item) => qty_ck_item?.index === index
        );
        if (requiredCakeItem?.itemObj?.product?.app_info?.ck_build === "dl") {
          idsForDl.push(getUpdatedId(requiredCakeItem?.itemObj?.id, index));
        } else {
          idsForSl.push(getUpdatedId(requiredCakeItem?.itemObj?.id, index));
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
        if (res && res.success) {
          updateItemInfo(res, idsForSl);
        }
      }

      if (!isEmpty(idsForDl)) {
        const res = await editMulItemInfoApi(payloadForDl);
        if (res && res.success) {
          updateItemInfo(res, idsForDl);
        }
      }
    } else {
      const itemId = getUpdatedId(item?.id, index);

      const payload = {
        completed_phases: {
          [tiersData.tier_one]: {
            [phasesId.boxed]: e.target.checked,
          },
          ...(item?.product?.app_info?.ck_build === "dl" && {
            [tiersData.tier_two]: {
              [phasesId.boxed]: e.target.checked,
            },
          }),
        },
        user_id: null,
      };

      const res = await editItemInfoApi(payload, itemId);
      if (res && res.success) {
        // updateItemInfo(res, idsForSl);

        const updatedItemInfo = {
          ...itemInfo,
          [itemId]: res.data,
        };
        setItemInfo(updatedItemInfo);
      }
    }

    await getOrderInfoById(orderId, date);
  };

  const handleDisableCompleted = (item, index) => {
    if (
      itemInfo[getUpdatedId(item?.id, index)]?.item_phase >=
        selectedPage?.phase_in_id &&
      itemInfo[getUpdatedId(item?.id, index)]?.item_phase !== phasesId?.boxed
    ) {
      return false;
    }
    return true;
  };

  const handleDisableBox = (item, index) => {
    if (item?.cake_items) {
      const itemIds = getItemsIds(item, index);
      const isDisabled = itemIds.every(
        (cakeItemId) =>
          itemInfo[cakeItemId] &&
          itemInfo[cakeItemId]?.item_phase >= phasesId.completed
      );
      return isDisabled;
    } else {
      const itemId = getUpdatedId(item?.id, index);

      const isDisabled =
        itemInfo[itemId] && itemInfo[itemId]?.item_phase >= phasesId.completed;
      return isDisabled;
    }
  };

  const handleBoxedCheck = (item, index) => {
    if (item?.cake_items) {
      const boxCheck = item?.cake_items.every((qtyCakeItems) => {
        const requiredCakeItem = qtyCakeItems.find(
          (qty_ck_item) => qty_ck_item?.index === index
        );
        return (
          itemInfo[getUpdatedId(requiredCakeItem?.itemObj?.id, index)]
            ?.item_phase === phasesId.boxed
        );
      });
      return boxCheck;
    } else {
      const itemId = getUpdatedId(item?.id, index);
      const boxCheck = itemInfo[itemId]?.item_phase === phasesId.boxed;
      return boxCheck;
    }
  };

  const handleToast = (item, index) => {
    const checkDisabled = handleDisableCompleted(item, index);
    if (checkDisabled) {
      // displayErrorToast("Fill in cake Assembly first");
    }
  };

  const checkAllItemsReady = useCallback(
    (item, index) => {
      if (item?.cake_items) {
        return item?.cake_items.every((qtyCakeItems) => {
          const requiredCakeItem = qtyCakeItems.find(
            (qty_ck_item) => qty_ck_item?.index === index
          );
          if (itemInfo[getUpdatedId(requiredCakeItem?.itemObj?.id, index)]) {
            return (
              itemInfo[getUpdatedId(requiredCakeItem?.itemObj?.id, index)]
                ?.item_phase >= selectedPage?.phase_in_id
            );
          }
          return false;
        });
      } else {
        if (itemInfo[getUpdatedId(item?.id, index)]) {
          return (
            itemInfo[getUpdatedId(item?.id, index)]?.item_phase >=
            selectedPage?.phase_in_id
          );
        }
        return false;
      }
    },
    [itemInfo, selectedPage?.phase_in_id]
  );

  // const checkOrderReady = (item, index) => {
  //   return orderDetail.items.every((qtyItems) =>
  //     qtyItems.every((item, itemIndex) => checkAllItemsReady(item, itemIndex))
  //   );
  // };

  const handleCurrentUserStatus = (itemInfo, currentUserStatus) => {
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

    return currentUserStatus;
  };

  const getCurrentUserStatus = (item, index) => {
    let currentUserStatus = "default";
    let currentUserStatusArray = [];
    if (item?.cake_items) {
      item?.cake_items.forEach((cakeItems) => {
        const requiredCakeItem = cakeItems.find(
          (qty_ck_item) => qty_ck_item?.index === index
        )?.itemObj;
        const currentStatus = handleCurrentUserStatus(
          itemInfo[getUpdatedId(requiredCakeItem?.id, index)],
          currentUserStatus
        );
        currentUserStatusArray.push(currentStatus);
      });
      currentUserStatus = currentUserStatusArray.some(
        (status) => status === "in-progress"
      )
        ? "in-progress"
        : currentUserStatus;

      currentUserStatus = currentUserStatusArray.every(
        (status) => status === "completed"
      )
        ? "completed"
        : currentUserStatus;
    } else {
      const currentStatus = handleCurrentUserStatus(
        itemInfo[getUpdatedId(item.id, index)],
        currentUserStatus
      );
      // cakeItemModifiersChecks.push(isCompleted);
      currentUserStatus = currentStatus;
    }

    return currentUserStatus;
  };

  const isCurrentUser = (item, index) => {
    const requiredItem = itemInfo[getUpdatedId(item.id, index)];
    if (item?.cake_items) {
      const check = item.cake_items.some((cakeItem) => {
        const requiredCakeItem = cakeItem.find(
          (qty_ck_item) => qty_ck_item?.index === index
        );
        const requiredCakeItemInfo =
          itemInfo[getUpdatedId(requiredCakeItem?.itemObj?.id, index)];
        return (
          requiredCakeItemInfo &&
          requiredCakeItemInfo?.user &&
          requiredCakeItemInfo?.user?.id &&
          requiredCakeItemInfo?.item_phase !== phasesId.cakeAssembled
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

  const handleEditItemInfo = async (payload, item, cakeItems, index) => {
    const itemId = getUpdatedId(item?.id, index);
    let res = await editItemInfoApi(payload, itemId);
    if (cakeItems) {
      const otherItems = cakeItems.filter((qtyCakeItems) =>
        qtyCakeItems.some((cakeItem) => cakeItem?.id !== item?.id)
      );
      const isAllItemsCompleted = otherItems.every((qtyOtherItems) =>
        qtyOtherItems.every(
          (otherItem) =>
            itemInfo[otherItem?.id]?.item_phase === phasesId.cakeAssembled
        )
      );
      if (
        isAllItemsCompleted &&
        res.data.item_phase === phasesId.cakeAssembled
      ) {
        const itemIdsArray = _.flatten(
          cakeItems.map((qtyCakeItems) =>
            qtyCakeItems.map((cakeItem, cakeItemIndex) =>
              getUpdatedId(cakeItem?.id, cakeItemIndex)
            )
          )
        );
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
    }
  };

  const handleItemActive = async (item, isCompleted, index) => {
    let requiredItemInfo = itemInfo[getUpdatedId(item?.id, index)];
    if (item?.cake_items) {
      const requiredCakeItem = item?.cake_items[0].find(
        (qty_ck_item) => qty_ck_item?.index === index
      );
      requiredItemInfo =
        itemInfo[getUpdatedId(requiredCakeItem?.itemObj?.id, index)];
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
      const itemIdsArray = _.flatten(
        item.cake_items.map((qtyCakeItems) => {
          const requiredCakeItem = qtyCakeItems.find(
            (qty_ck_item) => qty_ck_item?.index === index
          );
          return getUpdatedId(requiredCakeItem?.itemObj?.id, index);
        })
      );

      updateItemInfoForIcon(null, "user", updatedUser, itemIdsArray);

      handleEditMulItemInfo(payload, itemIdsArray);
    } else {
      updateItemInfoForIcon(getUpdatedId(item?.id, index), "user", updatedUser);

      handleEditItemInfo(payload, item, item?.cake_items, index);
    }
  };

  const getRequiredItem = (item, index) => {
    if (item?.cake_items) {
      const requiredCakeItem = item?.cake_items[0].find(
        (qty_ck_item) => qty_ck_item?.index === index
      );
      return itemInfo[getUpdatedId(requiredCakeItem?.itemObj?.id, index)];
    } else return itemInfo[getUpdatedId(item.id, index)];
  };

  const getItemColor = (requiredItem) => {
    let itemColor = "#ffffff";
    if (requiredItem && requiredItem?.user && requiredItem?.user?.color) {
      itemColor = requiredItem?.user?.color;
    }
    return itemColor;
  };

  const renderIcon = (item, index) => {
    const currentUserStatus = getCurrentUserStatus(item, index);
    return (
      <Button
        className={`status-btn status-${
          isCurrentUser(item, index) ||
          getRequiredItem(item, index)?.user?.username
            ? "pink"
            : currentUserStatus
        }`}
        onClick={() =>
          handleItemActive(item, currentUserStatus === "completed", index)
        }
        disabled={currentUserStatus === "completed"}
      >
        {isCurrentUser(item, index) ||
        getRequiredItem(item, index)?.user?.username ? (
          <div className="d-flex align-items-center ">
            <div className="text-white">
              {getRequiredItem(item, index)?.user?.username}
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

  const renderItems = (item, index, orderID, pickup_time) => {
    return (
      <React.Fragment key={`items-${item.id}--${index}`}>
        <tr>
          <td></td>
          <td></td>
          <td className="ps-2">
            <div className="my-2"></div>
            <div> 1 X {item?.product?.name}</div>
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

          <td>
            <span onClick={() => handleToast(item, index)}>
              <Form.Group>
                <Form.Check
                  disabled={handleDisableCompleted(item, index)}
                  onChange={(e) =>
                    handleCompletedChange(
                      e,
                      getUpdatedId(item.id, index),
                      item,
                      orderID,
                      pickup_time
                    )
                  }
                  label=""
                  id={`complete-${item.id} -${index}`}
                  checked={
                    itemInfo[getUpdatedId(item.id, index)]?.item_phase >=
                    phasesId.completed
                  }
                  type="checkbox"
                  className={`custom-input-box checkbox-24 ${
                    handleDisableCompleted(item, index) && "cursorNotAllowed"
                  }`}
                  name={"item1"}
                />
              </Form.Group>
            </span>
          </td>
        </tr>

        <tr>
          <td></td>
          <td></td>
          <td colSpan={2}>
            <hr className="mx-0 my-2" />
          </td>
        </tr>
      </React.Fragment>
    );
  };

  const renderCompletedCheckBox = (orderDetail, item, index) => {
    return (
      <span onClick={() => handleToast(item, index)}>
        <Form.Group>
          <Form.Check
            disabled={handleDisableCompleted(item, index)}
            onChange={(e) =>
              handleCompletedChange(
                e,
                getUpdatedId(item.id, index),
                item,
                orderDetail.id,
                orderDetail?.pickup_time
              )
            }
            label=""
            id={`decorator-complete-${item.id}-${index}`}
            checked={
              itemInfo[getUpdatedId(item.id, index)]?.item_phase >=
              phasesId.completed
            }
            type="checkbox"
            className={`custom-input-box checkbox-24
                                      ${
                                        handleDisableCompleted(item, index) &&
                                        "cursorNotAllowed"
                                      }
                                      `}
            name={"item1"}
          />
        </Form.Group>
      </span>
    );
  };

  const renderBoxCheckbox = (orderDetail, item, index) => {
    return (
      <Form.Group>
        <Form.Check
          disabled={!handleDisableBox(item, index)}
          onChange={(e) =>
            handleBoxedOnChange(
              e,
              orderDetail.id,
              orderDetail?.pickup_time,
              item,
              index
            )
          }
          label=""
          id={`boxed-${getUpdatedId(item?.id, index)}`}
          type="checkbox"
          className={`custom-input-box checkbox-24 ${
            !handleDisableBox(item, index) && "cursorNotAllowed"
          }`}
          checked={handleBoxedCheck(item, index)}
          name={"order-box"}
        />
      </Form.Group>
    );
  };

  const renderOrders = (ordersArray) => {
    return ordersArray.map((orderDetail) => (
      <tr key={orderDetail.id}>
        <td>
          <div className="d-flex gap-2">
            <div
              onClick={() =>
                handleOrderOverviewModal(
                  orderOverViewComponentData?.order,
                  normalizeOrderWithoutQuantity(orderDetail)
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

        <td>
          {orderDetail?.items.map((qtyItems) => {
            return qtyItems.map((ck_item) => {
              if (ck_item?.cake_items) {
                const quantityArr = ck_item.cake_items[0]?.map(
                  (data) => data.index
                );
                return quantityArr.map((cakeItemArrayIndex) => {
                  // we did -1 for for the index mapping
                  const requiredItem =
                    itemInfo[
                      getUpdatedId(
                        ck_item.cake_items[0][cakeItemArrayIndex - 1]?.itemObj
                          ?.id,
                        cakeItemArrayIndex
                      )
                    ];
                  return (
                    <table
                      className={`w-100 mb-4 ${
                        selectedPage?.id !== pageId?.backerOrder
                          ? "table-fixed"
                          : ""
                      }`}
                      style={{
                        backgroundColor: `${hexToRgbA(
                          getItemColor(requiredItem)
                        )}`,
                      }}
                      key={`deco - ${ck_item.id} - ${cakeItemArrayIndex}`}
                    >
                      <colgroup>
                        <col width={110} />
                        <col width={110} />
                        <col width={300} />
                        <col width={100} />
                        <col width={100} />
                      </colgroup>
                      <tbody>
                        <React.Fragment
                          key={`deco - ${ck_item.id} - ${cakeItemArrayIndex} - cake_items`}
                        >
                          <tr>
                            <td className="ps-2">
                              <div
                                className={`order-status ${
                                  checkAllItemsReady(
                                    ck_item,
                                    cakeItemArrayIndex
                                  )
                                    ? "ready"
                                    : "pending"
                                }`}
                              >
                                {checkAllItemsReady(ck_item, cakeItemArrayIndex)
                                  ? "Ready"
                                  : "Pending"}
                              </div>
                            </td>
                            <td>
                              <span className="ms-3">F2</span>
                            </td>
                            <td>
                              <div>
                                <div>
                                  {ck_item?.product?.categories_text.split(
                                    "/"
                                  )[1] || ""}
                                </div>
                                <div>
                                  {ck_item?.quantity} X {ck_item?.product?.name}
                                </div>
                              </div>
                            </td>
                            <td>{renderIcon(ck_item, cakeItemArrayIndex)}</td>
                            <td className="text-center">
                              {renderBoxCheckbox(
                                orderDetail,
                                ck_item,
                                cakeItemArrayIndex
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={5} className="px-3">
                              <hr />
                            </td>
                          </tr>
                          <tr>
                            <td></td>
                            <td></td>
                            <td>
                              <div>
                                {ck_item?.modifieritems &&
                                  ck_item?.modifieritems.map((modifierItem) => (
                                    <div key={modifierItem.id}>
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
                          {ck_item?.cake_items.map((qtyCakeItems) => {
                            const requiredCakeItem = qtyCakeItems.find(
                              (qty_ck_item) =>
                                qty_ck_item?.index === cakeItemArrayIndex
                            )?.itemObj;
                            return renderItems(
                              requiredCakeItem,
                              cakeItemArrayIndex,
                              orderDetail.id,
                              orderDetail.pickup_time
                            );
                          })}
                        </React.Fragment>
                      </tbody>
                    </table>
                  );
                });
              } else {
                const { itemObj: item, index } = ck_item;
                const requiredItem = itemInfo[getUpdatedId(item.id, index)];

                return (
                  <table
                    className={`w-100 mb-4 ${
                      selectedPage?.id !== pageId?.backerOrder
                        ? "table-fixed"
                        : ""
                    } table-cat`}
                    style={{
                      backgroundColor: `${hexToRgbA(
                        getItemColor(requiredItem)
                      )}`,
                    }}
                    key={`deco - ${item.id} - ${index}`}
                  >
                    <colgroup>
                      <col width={110} />
                      <col width={110} />
                      <col width={300} />
                      <col width={100} />
                      <col width={100} />
                    </colgroup>
                    <tbody>
                      <>
                        <tr>
                          <td className="ps-2">
                            <div
                              className={`order-status ${
                                checkAllItemsReady(item, index)
                                  ? "ready"
                                  : "pending"
                              }`}
                            >
                              {checkAllItemsReady(item, index)
                                ? "Ready"
                                : "Pending"}
                            </div>
                          </td>
                          <td>
                            <span className="ms-3">F2</span>
                          </td>
                          <td>
                            <div className="pt-3">
                              <div>
                                {item?.product?.categories_text.split("/")[1] ||
                                  ""}
                              </div>
                              <div>
                                {1} X {item?.product?.name}
                              </div>
                              <div></div>
                            </div>
                          </td>
                          <td>{renderIcon(item, index)}</td>
                          <td className="text-center">
                            {renderBoxCheckbox(orderDetail, item, index)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={5} className="ps-2">
                            <hr />
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
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
                            {renderCompletedCheckBox(orderDetail, item, index)}
                          </td>
                        </tr>
                      </>
                    </tbody>
                  </table>
                );
              }
            });
          })}
        </td>
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
    <Table responsive className={`editable-table custom-table-striped`}>
      <colgroup>
        <col width={180} />
        <col width={180} />
        <col width={120} />
        <col style={{ minWidth: "470px" }} />
      </colgroup>
      <thead className="border-0 ">
        <tr>
          {sortButtonsData.map((data, index) => (
            <th key={index} className="pb-3">
              <SortButton
                activeSortingField={activeSortingField}
                btnName={data.name}
                onClickSort={handleOnClickSort}
                btnLabel={data.label}
              />
            </th>
          ))}

          <th>
            <table className="w-100 table-fixed">
              <colgroup>
                <col width={110} />
                <col width={110} />
                <col width={300} />
                <col width={100} />
                <col width={100} />
              </colgroup>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Daily #</th>
                  <th>
                    <div>Categories</div>
                    <div>Items</div>
                  </th>
                  <th>Done</th>
                  <th>Boxed</th>
                </tr>
              </thead>
            </table>
          </th>
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
                  <th colSpan={7} className="ps-4">
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
            <td colSpan={7}>
              <NoData />
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default Decorator;
