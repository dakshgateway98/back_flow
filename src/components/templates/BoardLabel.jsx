import _, { isArray, isEmpty } from "lodash";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";

import {
  filterConstant,
  filterLabels,
  modifierCatData,
  phasesId,
  setting,
  tiersData,
} from "../../utils/StaticData";
import { CheckedIcon, CircleClose, Printer } from "../common/icons";
import NoData from "../common/NoData";
import LabelHelper from "../../utils/LabelHelper";
import { getAppSettingByIDApi } from "../../api/settings";
import { updateBoardSizes } from "../../redux/actions/settingsAction";
import { useDispatch, useSelector } from "react-redux";
import { displayErrorToast } from "../../global/displayToast";
import { editLabelApi } from "../../api/labels";
import {
  getTieredNotTieredItems,
  giveOrderDisplayName,
  makeGroupAsPerKey,
} from "../../global/helpers";

const displayDateFormat = "ddd. MMM. D";
const displayTimeFormat = "hh:mm a";
const displayDate = "ddd. MMM. DD";

const getUpdatedValue = (itemID, key) => {
  return `${itemID}.${key}`;
};
let printItems = {};
const BoardLabel = (props) => {
  const {
    displayOrdersByDate,
    ordersInfo,
    itemInfo,
    dailyIdsOrders,
    setItemInfo,
  } = props;
  const [filterState, setFilterState] = useState(filterLabels.order.asc);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [selectBoardSizes, setSelectBoardSizes] = useState([]);
  const { boardSizes } = useSelector((state) => state.settings);

  const [printedFilterState, setPrintedFilterState] = useState(
    filterLabels.printed.all
  );

  const dispatch = useDispatch();

  const givePrintObject = (labelParams) => {
    const { itemId, order, count, item } = labelParams;
    return {
      BOARD_SIZE: getBoardSizeValue(itemId),
      COUNT: count,
      DATE: moment(order?.pickup_time).format(displayDate).toString(),
      ITEM_ID: itemId,
      ID: dailyIdsOrders[order?.id],
      NAME: giveOrderDisplayName(order, ordersInfo).toUpperCase(),
      ORDER: order?.local_id,
      SIZE: `${
        item?.product?.app_info?.ck_size
      } ${item?.product?.app_info?.ck_shape.toUpperCase()}`,
    };
  };

  useEffect(() => {
    printItems = {};
  }, []);

  const handleAddPrintObject = (labelParams) => {
    const printObj = givePrintObject(labelParams);
    const { order } = labelParams;
    let update = [];
    if (printItems[order?.local_id]) {
      update = [...printItems[order?.local_id]];
    } else {
      update = [];
    }
    update.push(printObj);
    printItems = {
      ...printItems,
      [order?.local_id]: update,
    };
  };

  const handleRemovePrintObject = ({ item, itemId, order, count }) => {
    let array = [];
    if (printItems[order?.local_id]) {
      array = printItems[order?.local_id];
      let updatedArray = array.filter(
        (po) => !(po?.ID === itemId && po.COUNT === count)
      );

      printItems[order?.local_id] = updatedArray;
    }
  };

  const handleIsExistInPrintItems = ({ item, itemId, order, count }) => {
    if (printItems[order?.local_id]) {
      return printItems[order?.local_id].some(
        (po) => po?.ID === itemId && po.COUNT === count
      );
    }
    return false;
  };

  const handleAddRemovePrintObject = (labelParams) => {
    if (handleIsExistInPrintItems(labelParams)) {
      handleRemovePrintObject(labelParams);
    } else {
      handleAddPrintObject(labelParams);
    }
  };

  const getAppSettingByID = async () => {
    const res = await getAppSettingByIDApi(setting.board_sizes_ID);
    dispatch(updateBoardSizes({ ...res?.data?.settings }));
  };

  useEffect(() => {
    if (isEmpty(boardSizes)) {
      getAppSettingByID();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardSizes]);

  const getBoardSize = (item, cakeItem) => {
    const appInfo = item?.product?.app_info;
    let boardSizeValue = "";
    if (appInfo?.ck_tiers === 1 || !appInfo.ck_tiers) {
      boardSizeValue = appInfo?.ck_boardsize?.sizes
        ? Object.values(appInfo?.ck_boardsize?.sizes)[0]
        : appInfo?.ck_boardsize;
    } else {
      const requiredModifierItem = item?.modifieritems.find(
        (modiItem) => modiItem?.modifier?.modifierCat === modifierCatData.build
      );
      if (requiredModifierItem) {
        const cakeItemIndex = [...item?.cake_items]
          .sort((a, b) => {
            const a_cakeSize = a.product.app_info.ck_size;
            const b_cakeSize = b.product.app_info.ck_size;
            return +a_cakeSize > +b_cakeSize;
          })
          .findIndex((item) => item?.id === cakeItem?.id);

        const modifierId = requiredModifierItem?.modifier?.id;
        let requiredKey;
        requiredKey = Object.keys(appInfo).find(
          (key) => key === modifierId.toString()
        );
        if (!requiredKey) {
          requiredKey = Object.keys(appInfo).find((key) => {
            const keyStringArr = key.split("_");
            if (
              keyStringArr[keyStringArr.length - 1] === modifierId.toString()
            ) {
              return key;
            }
            return "";
          });
        }
        const requiredAppInfo = appInfo[requiredKey];
        if (isArray(requiredAppInfo)) {
          boardSizeValue = requiredAppInfo[cakeItemIndex];
        } else {
          const cakeSizes = Object.values(requiredAppInfo.sizes);
          boardSizeValue = cakeSizes[cakeItemIndex];
        }
      }
    }
    if (boardSizeValue) {
      const boardSizeId = Object.entries(boardSizes).find(
        ([id, value]) => value === boardSizeValue
      )[0];
      return {
        boardSizeValue,
        boardSizeId,
      };
    }
    return "";
  };

  const getUpdatedId = (itemId, qtyItemIndex) => `${itemId}.${qtyItemIndex}`;

  useEffect(() => {
    if (!isEmpty(displayOrdersByDate) && !isEmpty(boardSizes)) {
      let tempboardSizes = [];

      if (displayOrdersByDate) {
        displayOrdersByDate.forEach((orderDetail) => {
          orderDetail?.items.forEach((item) => {
            if (item?.cake_items) {
              item?.cake_items.forEach((cakeItem) => {
                for (let i = 1; i <= +cakeItem?.quantity; i++) {
                  tempboardSizes.push({
                    item_id: getUpdatedId(cakeItem.id, i),
                    board_size: getBoardSize(item, cakeItem),
                  });
                }
              });
            } else {
              for (let i = 1; i <= +item?.quantity; i++) {
                tempboardSizes.push({
                  item_id: getUpdatedId(item?.id, i),
                  board_size: getBoardSize(item),
                });
              }
            }
          });
        });
      }

      setSelectBoardSizes(tempboardSizes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayOrdersByDate, boardSizes]);

  const isInSelectedLabels = (itemId) => {
    const selectedCard = selectedLabels.find((l) => l === itemId);
    return selectedCard ? true : false;
  };

  const getBoardSizeValue = (id) => {
    const itemInfoObj = itemInfo[id];
    let boardId = false;
    if (itemInfoObj) {
      if (
        itemInfoObj?.phase_requirements?.[tiersData.tier_one]?.[
          phasesId.cakeAssembled
        ]
      ) {
        const cakeAssembledPhaseId =
          itemInfoObj?.phase_requirements[tiersData.tier_one][
            phasesId.cakeAssembled
          ];

        boardId = cakeAssembledPhaseId[modifierCatData?.board];
      }
    }
    if (boardId) {
      return boardSizes[boardId];
    } else {
      const requiredLayoutObj = selectBoardSizes.find(
        (ele) => ele.item_id === id
      );
      if (!isEmpty(requiredLayoutObj)) {
        return requiredLayoutObj.board_size?.boardSizeValue;
      } else {
        return "";
      }
    }
  };

  const handleSelectForLabels = (labelParams) => {
    const { itemId, order } = labelParams;
    if (dailyIdsOrders[order?.id]) {
      if (isInSelectedLabels(itemId)) {
        setSelectedLabels([...selectedLabels.filter((id) => id !== itemId)]);
        handleAddRemovePrintObject(labelParams);
      } else {
        if (getBoardSizeValue(itemId)) {
          setSelectedLabels((prev) => [...prev, itemId]);
          handleAddRemovePrintObject(labelParams);
        } else {
          displayErrorToast("Board is not present for given item");
        }
      }
    } else {
      displayErrorToast("Daily ID not present for given order");
    }
  };

  const isItemPrinted = (itemId, count) =>
    itemInfo[itemId]?.board_labels?.[0] ?? null === count;

  const displayLabels = (item, order, index, itemsArray, ckIndex) => {
    const count = itemsArray?.cake_items
      ? `${ckIndex}/${itemsArray?.cake_items.flat().length}`
      : `${index}/${itemsArray.length}`;

    const itemId = getUpdatedValue(item?.id, index);

    let orderDisplayName = giveOrderDisplayName(order, ordersInfo);

    return (
      <div
        key={`${item.id}--${index}`}
        onClick={() => handleSelectForLabels({ item, itemId, order, count })}
        className="d-flex flex-column align-items-center p-4 cursorPointer"
      >
        <div
          className={`card ${
            isInSelectedLabels(itemId) && "border-2 border-green"
          }`}
        >
          <div>
            <p>{`/////////////////////////////////////`}</p>
          </div>

          <div className="pb-2">
            <div className="lables-text sm">Board Size:</div>
            <div className="lables-text xlg">
              {getBoardSizeValue(itemId) || `-`}
            </div>
          </div>
          <div className="pb-2">
            <div className="lables-text sm">Cake:</div>
            <div className="lables-text xlg">
              {item?.product?.app_info?.ck_size}{" "}
              {item?.product?.app_info?.ck_shape.toUpperCase()}
            </div>
          </div>
          <div className="d-flex pb-2">
            <div>
              <div className="pb-2">
                <div className="lables-text sm">Order:</div>
                <div className="lables-text lg">{order?.local_id}</div>
              </div>
              <div className="pe-5">
                <div className="lables-text sm">Daily ID:</div>
                <div className="lables-text lg">
                  {dailyIdsOrders[order?.id] ? dailyIdsOrders[order?.id] : "-"}
                </div>
              </div>
            </div>
            <div>
              <div className="pb-2">
                <div className="lables-text sm">Date:</div>
                <div className="lables-text lg">
                  {moment(order?.pickup_time).format(displayDate)}
                </div>
              </div>
              <div>
                <div className="lables-text sm">Items:</div>
                <div className="lables-text lg">{count}</div>
              </div>
            </div>
          </div>
          <div>
            <div className="lables-text sm">Customer:</div>
            <div className="lables-text">{orderDisplayName}</div>
          </div>
          <p className="mt-5">{`/////////////////////////////////////`}</p>
        </div>

        <div
          className={`print-status my-3 ${
            isItemPrinted(itemId, count) ? "printed" : "not-printed"
          } `}
        >
          {isItemPrinted(itemId, count) ? "Printed" : "Not Printed"}{" "}
        </div>
      </div>
    );
  };

  const isAllItemLabelSelected = (order) => {
    return order.items.every((qtyItem) => {
      return qtyItem.every((ck_item) => {
        const { itemObj: item, index } = ck_item;

        if (ck_item.cake_items) {
          return ck_item.cake_items.every((ck_cake_item) =>
            ck_cake_item.every(
              ({ itemObj: cakeItem, index: cakeItemIndex }) => {
                if (
                  selectedLabels.indexOf(
                    getUpdatedValue(cakeItem?.id, cakeItemIndex)
                  ) !== -1
                ) {
                  return true;
                }
                return false;
              }
            )
          );
        } else {
          if (selectedLabels.indexOf(getUpdatedValue(item?.id, index)) !== -1) {
            return true;
          }
          return false;
        }
      });
    });
  };

  const getLabelsForGivenOrder = (order) => {
    var selectedLabelsForGivenOrder = [];
    order.items.forEach((qtyItem) => {
      qtyItem.forEach((ck_item) => {
        const { itemObj: item, index } = ck_item;
        if (ck_item.cake_items) {
          ck_item.cake_items.forEach((ck_cake_item) => {
            ck_cake_item.forEach(
              ({ itemObj: cakeItem, index: cakeItemIndex }) => {
                let val = getUpdatedValue(cakeItem?.id, cakeItemIndex);
                selectedLabelsForGivenOrder.push(val);
              }
            );
          });
        } else {
          let val = getUpdatedValue(item?.id, index);
          selectedLabelsForGivenOrder.push(val);
        }
      });
    });

    return [...new Set(selectedLabelsForGivenOrder)];
  };

  const handleAddRemovePrintObjectForAllItem = (order, isAdd) => {
    order.items.forEach((qtyItem) => {
      qtyItem.forEach((ck_item) => {
        const { itemObj: item, index } = ck_item;

        if (ck_item.cake_items) {
          ck_item.cake_items.flat().forEach((qtyCakeItem, ckIndex) => {
            const { itemObj: cakeItem, index: cakeItemIndex } = qtyCakeItem;

            const count = `${ckIndex + 1}/${ck_item?.cake_items.flat().length}`;

            const cakeItemId = getUpdatedId(cakeItem?.id, cakeItemIndex);

            const cakeLabelParams = {
              item: cakeItem,
              itemId: cakeItemId,
              order,
              count,
            };

            if (isAdd) {
              if (!handleIsExistInPrintItems(cakeLabelParams)) {
                handleAddPrintObject(cakeLabelParams);
              }
            } else {
              if (handleIsExistInPrintItems(cakeLabelParams)) {
                handleRemovePrintObject(cakeLabelParams);
              }
            }
          });
        } else {
          const count = `${index}/${qtyItem.length}`;
          const itemId = getUpdatedId(item?.id, index);

          const labelParams = { item, itemId, order, count };
          if (isAdd) {
            if (!handleIsExistInPrintItems(labelParams)) {
              handleAddPrintObject(labelParams);
            }
          } else {
            if (handleIsExistInPrintItems(labelParams)) {
              handleRemovePrintObject(labelParams);
            }
          }
        }
      });
    });
  };

  const handleSelectAllLabels = (order) => {
    if (dailyIdsOrders[order?.id]) {
      let selectedLabelsForGivenOrder = getLabelsForGivenOrder(order);

      let allValue = [...selectedLabels, ...selectedLabelsForGivenOrder];

      allValue = [...new Set(allValue)];
      if (allValue.every((value) => getBoardSizeValue(value))) {
        setSelectedLabels(allValue);
        handleAddRemovePrintObjectForAllItem(order, true);
      } else {
        displayErrorToast("Board is not present in some of the items");
      }
    } else {
      displayErrorToast("Daily ID not Present for given Order");
    }
  };

  const handleUnSelectForAllLabels = (order) => {
    let selectedLabelsForGivenOrder = getLabelsForGivenOrder(order);
    let preSelectedLabels = _.cloneDeep(selectedLabels);
    let labelsWithoutOrderLabels = preSelectedLabels.filter(
      (label) => selectedLabelsForGivenOrder.indexOf(label) === -1
    );

    labelsWithoutOrderLabels = [...new Set(labelsWithoutOrderLabels)];

    setSelectedLabels(_.cloneDeep(labelsWithoutOrderLabels));
    handleAddRemovePrintObjectForAllItem(order, false);
  };

  const getDataSortedByTime = useCallback((orderData, sortTimeOrder) => {
    const timeSorted = orderData.sort((a, b) => {
      const a_orderTimeMoment = moment(a?.pickup_time).valueOf();
      const b_orderTimeMoment = moment(b?.pickup_time).valueOf();

      if (a_orderTimeMoment !== b_orderTimeMoment) {
        return (
          (a_orderTimeMoment - b_orderTimeMoment) * (sortTimeOrder ? 1 : -1)
        );
      }
      return -1;
    });
    return timeSorted;
  }, []);

  const handleSort = useCallback((allOrders, sortField, sortOrder) => {
    if (sortField) {
      return [...allOrders].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        switch (sortField) {
          case "order_id":
            return (
              (+aValue.replace(/^w/, "") - +bValue.replace(/^w/, "")) *
              (sortOrder ? 1 : -1)
            );
          case "untill_time":
          case "bal_due":
            return (+aValue - +bValue) * (sortOrder ? 1 : -1);
          case "order_type":
            return (
              (aValue === bValue ? 0 : aValue ? -1 : 1) * (sortOrder ? 1 : -1)
            );
          default:
            return (
              aValue
                ?.toString()
                .localeCompare(bValue?.toString(), "en", { numeric: true }) *
                (sortOrder ? 1 : -1) || 0
            );
        }
      });
    } else {
      return allOrders;
    }
  }, []);

  const getDataSortedByDailyID = useCallback(
    (allOrders, isAsc) => {
      const sortedList = [...allOrders].sort((a, b) => {
        if (dailyIdsOrders[a?.id] && dailyIdsOrders[b?.id]) {
          if (
            parseInt(dailyIdsOrders[a?.id].substring(1)) <=
            parseInt(dailyIdsOrders[b?.id].substring(1))
          ) {
            return isAsc ? -1 : 1;
          } else {
            return isAsc ? 1 : -1;
          }
        } else {
          if (dailyIdsOrders[a?.id]) {
            return -1;
          } else {
            return 1;
          }
        }
      });
      return sortedList;
    },
    [dailyIdsOrders]
  );

  const handleFilterFunction = useCallback(
    (ordersForGivenDate) => {
      switch (filterState) {
        case filterLabels.order.asc:
          return handleSort(ordersForGivenDate, filterConstant.local_id, true);

        case filterLabels.order.desc:
          return handleSort(ordersForGivenDate, filterConstant.local_id, false);

        case filterLabels.time.asc:
          return getDataSortedByTime(ordersForGivenDate, true);
        case filterLabels.time.desc:
          return getDataSortedByTime(ordersForGivenDate, false);
        case filterLabels.dailyID.asc:
          return getDataSortedByDailyID(ordersForGivenDate, true);
        case filterLabels.dailyID.desc:
          return getDataSortedByDailyID(ordersForGivenDate, false);

        default:
          return handleSort(ordersForGivenDate, filterConstant.local_id, true);
      }
    },
    [filterState, getDataSortedByTime, handleSort, getDataSortedByDailyID]
  );

  const isTieredCake = (itemID, orderID) => {
    const selectedOrder = printedFilterOrder.find(
      (order) => order?.local_id === orderID
    );
    return selectedOrder?.items.some((qtyItem) =>
      qtyItem.some((ck_item) => {
        const { itemObj: item, index } = ck_item;
        if (ck_item.cake_items) {
          return ck_item.cake_items.some((ck_cake_item) =>
            ck_cake_item.some(({ itemObj: cakeItem, index: cakeItemIndex }) => {
              return (
                +getUpdatedId(cakeItem?.id, cakeItemIndex) === +itemID &&
                ck_item?.product?.app_info?.ck_tiers > 1
              );
            })
          );
        } else {
          return (
            +getUpdatedId(item?.id, index) === +itemID &&
            item?.product?.app_info?.ck_tiers > 1
          );
        }
      })
    );
  };

  const handleSortByKey = (items) => {
    return [...items].sort((a, b) => {
      const [letterA, numA] = [a?.ID[0], +a?.ID.slice(1)];
      const [letterB, numB] = [b?.ID[0], +b?.ID.slice(1)];
      return letterA.localeCompare(letterB) || numA - numB;
    });
  };

  const updatePrintLabels = async (printData) => {
    const res = await editLabelApi(printData);
    if (res && res?.success) {
      setItemInfo((prev) => {
        return { ...prev, ...res?.data };
      });
      setSelectedLabels([]);
      printItems = {};
    }
  };

  const handleSortForPrint = () => {
    function getKeyByValue(value) {
      return Object.keys(boardSizes).find((key) => boardSizes[key] === value);
    }

    const updatedForTieredNonTiered = getTieredNotTieredItems(
      printItems,
      isTieredCake,
      handleSortByKey
    );
    const groupByBoardSize = makeGroupAsPerKey(
      updatedForTieredNonTiered?.nonTiered,
      "BOARD_SIZE"
    );
    const OutputObj = {};

    const keys = Object.keys(groupByBoardSize).sort((a, b) => {
      const aBoardId = getKeyByValue(a);
      const bBoardId = getKeyByValue(b);
      return aBoardId - bBoardId;
    });

    keys.forEach((key) => (OutputObj[key] = groupByBoardSize[key]));

    const groupByDailyId = makeGroupAsPerKey(
      updatedForTieredNonTiered?.tiered,
      "ID"
    );

    return {
      nonTiered: {
        ...OutputObj,
      },
      tiered: {
        ...groupByDailyId,
      },
    };
  };

  const handlePrintLabels = async () => {
    const updatedData = handleSortForPrint(_.cloneDeep(printItems));

    LabelHelper.printLabel(updatedData, true);

    await updatePrintLabels(_.cloneDeep({ labels: printItems }));
  };

  const displayFilterOrders = useMemo(
    () => handleFilterFunction(_.cloneDeep(displayOrdersByDate)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterState, handleFilterFunction, displayOrdersByDate]
  );

  const updatedOrderAsPerQuantity = useMemo(() => {
    const updatedOrders = [];

    for (const order of displayFilterOrders) {
      const updatedItems = [];

      for (const item of order.items) {
        if (item.cake_items) {
          const updatedCakeItems = [];

          for (const cakeItem of item.cake_items) {
            for (let i = 1; i <= +cakeItem?.quantity; i++) {
              if (cakeItem?.product?.app_info?.ck_shape) {
                updatedCakeItems.push([{ itemObj: cakeItem, index: i }]);
              }
            }
          }

          if (updatedCakeItems.length > 0) {
            updatedItems.push([{ ...item, cake_items: updatedCakeItems }]);
          }
        } else {
          const updatedItem = [];

          for (let i = 1; i <= +item?.quantity; i++) {
            if (item?.product?.app_info?.ck_shape) {
              updatedItem.push({ itemObj: item, index: i });
            }
          }

          if (updatedItem.length > 0) {
            updatedItems.push(updatedItem);
          }
        }
      }

      if (updatedItems.length > 0) {
        updatedOrders.push({ ...order, items: updatedItems });
      }
    }

    return updatedOrders;
  }, [displayFilterOrders]);

  const isOrderPrinted = (order) => {
    return order?.items.every((qtyItem) =>
      qtyItem.every((ck_item) => {
        const { itemObj: item, index } = ck_item;
        if (ck_item?.cake_items) {
          return ck_item?.cake_items.flat().every((qtyCakeItem, ckIndex) => {
            const { itemObj: cakeItem, index: cakeItemIndex } = qtyCakeItem;
            const count = `${ckIndex + 1}/${ck_item?.cake_items.flat().length}`;
            const itemId = getUpdatedValue(cakeItem?.id, cakeItemIndex);
            return isItemPrinted(itemId, count);
          });
        } else {
          const count = `${index}/${qtyItem.length}`;
          const itemId = getUpdatedValue(item?.id, index);
          return isItemPrinted(itemId, count);
        }
      })
    );
  };

  const givePrintedNotPrintedOrder = (ordersForGivenDate, isPrinted) => {
    return ordersForGivenDate.filter((order) => {
      if (isPrinted) {
        return isOrderPrinted(order);
      } else {
        return !isOrderPrinted(order);
      }
    });
  };

  const handleFilterForPrinted = useCallback(
    (ordersForGivenDate) => {
      switch (parseInt(printedFilterState)) {
        case filterLabels.printed.all:
          return ordersForGivenDate;
        case filterLabels.printed.printed:
          return givePrintedNotPrintedOrder(ordersForGivenDate, true);
        case filterLabels.printed.notPrinted:
          return givePrintedNotPrintedOrder(ordersForGivenDate, false);
        default:
          return ordersForGivenDate;
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [printedFilterState]
  );

  const printedFilterOrder = useMemo(
    () => handleFilterForPrinted(_.cloneDeep(updatedOrderAsPerQuantity)),
    [handleFilterForPrinted, updatedOrderAsPerQuantity]
  );

  const handleUnSelectForAllOrdersLabels = () => {
    setSelectedLabels([]);
    printItems = {};
  };

  const handleSelectAllOrdersLabels = (orders) => {
    let allOrderItems = _.cloneDeep(selectedLabels);
    let boardFlag = true;
    let dailyFlag = true;
    for (let order of orders) {
      if (dailyIdsOrders[order.id]) {
        let selectedLabelsForGivenOrder = getLabelsForGivenOrder(order);
        let allValue = [...allOrderItems, ...selectedLabelsForGivenOrder];

        allValue = [...new Set(allValue)];
        if (allValue.every((value) => getBoardSizeValue(value))) {
          allOrderItems = [...allValue];
          handleAddRemovePrintObjectForAllItem(order, true);
        } else {
          boardFlag = false;
        }
      } else {
        dailyFlag = false;
      }
    }
    if (!boardFlag) {
      displayErrorToast("Board is not present in some of the items");
    }
    if (!dailyFlag) {
      displayErrorToast("Daily ID not Present in some Orders");
    }

    setSelectedLabels([...new Set(allOrderItems)]);
  };

  const isAllOrderLabelSelected = (orders) => {
    const check = orders.every((order) => isAllItemLabelSelected(order));
    return check;
  };

  if (!isEmpty(printedFilterOrder)) {
    return (
      <table className="table-bordered">
        <colgroup>
          <col width={180} />
          <col width={1050} />
          <col width={80} />
        </colgroup>
        <thead>
          <tr className="border-0">
            <th className="border-0">
              <Form.Select
                onChange={(e) => setFilterState(+e.target.value)}
                style={{ width: "170px", height: "35px" }}
                className="custom-input board-select"
              >
                <option value={filterLabels.order.asc}>Order (asc)</option>
                <option value={filterLabels.order.desc}>Order (desc)</option>
                <option value={filterLabels.time.asc}>Time (asc)</option>
                <option value={filterLabels.time.desc}>Time (desc)</option>
                <option value={filterLabels.dailyID.asc}>DailyID (asc)</option>
                <option value={filterLabels.dailyID.desc}>
                  DailyID (desc)
                </option>
              </Form.Select>
            </th>
            <td className="border-0">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <Form.Select
                    style={{ width: "170px", height: "35px" }}
                    className="custom-input board-select"
                    onChange={(e) => setPrintedFilterState(e.target.value)}
                  >
                    <option value={filterLabels.printed.all}>show All</option>
                    <option value={filterLabels.printed.printed}>
                      show Printed
                    </option>
                    <option value={filterLabels.printed.notPrinted}>
                      show Not Printed
                    </option>
                  </Form.Select>
                </div>
                <div className="d-flex align-items-end w-50 justify-content-between">
                  <div className="my-1">Labels</div>
                  <div className="my-1 highlight-greenText">
                    Labels Selected: {selectedLabels?.length || 0}
                  </div>
                  <div className="pe-4">
                    <Button
                      onClick={() => handlePrintLabels()}
                      className="checked-status complete my-2 py-0"
                    >
                      <Printer color="white" />
                    </Button>
                  </div>
                </div>
              </div>
            </td>
            <td className="text-center border-0">
              {isAllOrderLabelSelected(printedFilterOrder) ? (
                <Button
                  onClick={handleUnSelectForAllOrdersLabels}
                  className="checked-status not-complete px-2"
                >
                  <CircleClose color="white" />
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    handleSelectAllOrdersLabels(printedFilterOrder)
                  }
                  className="checked-status complete m-1 px-2 py-0"
                >
                  <CheckedIcon color="white" />
                </Button>
              )}
            </td>
          </tr>
        </thead>
        <tbody>
          {!_.isEmpty(printedFilterOrder) &&
            printedFilterOrder.map((order) => {
              return (
                <tr key={order?.id}>
                  <td className="bg-board-label">
                    <div className="d-flex flex-column align-items-center text-center height-500 py-4">
                      <div className="my-1">
                        {giveOrderDisplayName(order, ordersInfo)}
                      </div>
                      <div className="my-1">{order?.local_id}</div>
                      <div className="my-1">
                        {moment(order?.pickup_time).format(displayDateFormat)}
                      </div>
                      <div className="my-1">
                        {moment(order?.pickup_time).format(displayTimeFormat)}
                      </div>
                      <div style={{ fontSize: "26px" }} className="my-1">
                        {dailyIdsOrders[order?.id]
                          ? dailyIdsOrders[order?.id]
                          : "-"}
                      </div>
                      <div
                        className={`print-status ${
                          isOrderPrinted(order) ? "printed" : "not-printed"
                        } my-1`}
                      >
                        {isOrderPrinted(order) ? "Printed" : "Non Printed"}
                      </div>
                    </div>
                  </td>
                  <td className="overflow-scroll">
                    <div className="d-flex flex-nowrap width-100">
                      {order.items.map((qtyItem) => {
                        return qtyItem.map((ck_item) => {
                          const { itemObj: item, index } = ck_item;
                          if (ck_item?.cake_items) {
                            return ck_item?.cake_items
                              .flat()
                              .map((qtyCakeItem, ckIndex) => {
                                const {
                                  itemObj: cakeItem,
                                  index: cakeItemIndex,
                                } = qtyCakeItem;
                                return displayLabels(
                                  cakeItem,
                                  order,
                                  cakeItemIndex,
                                  ck_item,
                                  ckIndex + 1
                                );
                              });
                          } else {
                            return displayLabels(item, order, index, qtyItem);
                          }
                        });
                      })}
                    </div>
                  </td>
                  {isAllItemLabelSelected(order) ? (
                    <td className="text-center">
                      <Button
                        onClick={() => handleUnSelectForAllLabels(order)}
                        className="checked-status not-complete px-2"
                      >
                        <CircleClose color="white" />
                      </Button>
                    </td>
                  ) : (
                    <td className="text-center">
                      <Button
                        onClick={() => handleSelectAllLabels(order)}
                        className="checked-status complete px-2 py-0"
                      >
                        <CheckedIcon color="white" />
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
    );
  } else {
    return (
      <table className="table-bordered">
        <tbody>
          <colgroup>
            <col width={180} />
            <col width={1050} />
            <col width={80} />
          </colgroup>
          <tr>
            <td colSpan={3}>
              <NoData />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
};

export default BoardLabel;
