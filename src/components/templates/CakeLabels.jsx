import _, { isEmpty } from "lodash";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import {
  filterConstant,
  filterLabels,
  modifierCatData,
  printOrderSorting,
} from "../../utils/StaticData";
import { CheckedIcon, CircleClose, Printer } from "../common/icons";
import NoData from "../common/NoData";
import LabelHelper from "../../utils/LabelHelper";
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
const CakeLabels = (props) => {
  const {
    displayOrdersByDate,
    ordersInfo,
    dailyIdsOrders,
    itemInfo,
    setItemInfo,
    dailSortIds,
  } = props;

  const [filterState, setFilterState] = useState(filterLabels.order.asc);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [printOrder, setPrintOrder] = useState(
    printOrderSorting.printByFlavour
  );

  const [printedFilterState, setPrintedFilterState] = useState(
    filterLabels.printed.all
  );
  const getModifiersValue = (modifiersItems, modifierValue) => {
    const modifierObj = modifiersItems.find(
      (modiItem) => parseInt(modiItem?.modifier?.modifierCat) === modifierValue
    );
    if (!_.isEmpty(modifierObj)) {
      return modifierObj?.modifier?.kitchen_print_name;
    }
    return "No modifier";
  };

  const getCountForCakeItem = (cake_items, itemID, key) => {
    let count = 1;
    for (let i = 0; i < cake_items.length; i++) {
      if (cake_items[i]?.product?.app_info?.ck_piece_cnt) {
        let renderArray = Array.from(
          { length: cake_items[i]?.product?.app_info?.ck_piece_cnt },
          (_, i) => i + 1
        );
        let flag = true;
        for (let j = 0; j < renderArray.length; j++) {
          if (cake_items[i]?.id === itemID && renderArray[j] === key) {
            flag = false;
            break;
          }
          count += 1;
        }

        if (flag === false) {
          break;
        }
      }
    }
    return count;
  };
  const givePrintObject = (
    item,
    order,
    key,
    isCakeItem,
    cake_items,
    totalCount
  ) => {
    if (item?.product?.app_info?.ck_piece_cnt) {
      let flavour1 = getModifiersValue(
        item?.modifieritems,
        modifierCatData?.flavor[0]
      );
      let flavour2 = getModifiersValue(
        item?.modifieritems,
        modifierCatData?.flavor[1]
      );

      let flavour = flavour1 === "No modifier" ? flavour2 : flavour1;

      return {
        COUNT: isCakeItem
          ? `${getCountForCakeItem(cake_items, item?.id, key)}/${totalCount}`
          : `${key}/${item?.product?.app_info?.ck_piece_cnt}`,
        DATE: moment(order?.pickup_time).format(displayDateFormat).toString(),
        FIL: getModifiersValue(
          item?.modifieritems,
          modifierCatData["filling"]
        ).toUpperCase(),
        FLV: flavour.toUpperCase(),
        ICE: getModifiersValue(
          item?.modifieritems,
          modifierCatData["iced"]
        ).toUpperCase(),
        ICE_COLOR: getModifiersValue(
          item?.modifieritems,
          modifierCatData["iced_color"]
        ).toUpperCase(),
        ITEM_ID: item?.id,
        ID: dailyIdsOrders[order?.id],
        NAME: giveOrderDisplayName(order, ordersInfo).toUpperCase(),
        ORDER: order?.local_id,
        SIZE: `${
          item?.product?.app_info?.ck_size
        } ${item?.product?.app_info?.ck_shape.toUpperCase()}`,
      };
    }
    return {};
  };

  const handleAddPrintObject = (
    item,
    order,
    key,
    isCakeItem,
    cake_items,
    totalCount
  ) => {
    const printObj = givePrintObject(
      item,
      order,
      key,
      isCakeItem,
      cake_items,
      totalCount
    );
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

  const handleRemovePrintObject = (
    item,
    order,
    key,
    isCakeItem,
    cake_items,
    totalCount
  ) => {
    let array = [];
    if (printItems[order?.local_id]) {
      array = printItems[order?.local_id];
      let updatedArray = array.filter(
        (po) =>
          !(
            po?.ITEM_ID === item?.id &&
            po.COUNT ===
              (isCakeItem
                ? `${getCountForCakeItem(
                    cake_items,
                    item?.id,
                    key
                  )}/${totalCount}`
                : `${key}/${item?.product?.app_info?.ck_piece_cnt}`)
          )
      );
      printItems[order?.local_id] = updatedArray;
    }
  };

  const handleIsExistInPrintItems = (
    item,
    order,
    key,
    isCakeItem,
    cake_items,
    totalCount
  ) => {
    if (printItems[order?.local_id]) {
      let obj = printItems[order?.local_id].find(
        (po) =>
          po?.ITEM_ID === item?.id &&
          po.COUNT ===
            (isCakeItem
              ? `${getCountForCakeItem(
                  cake_items,
                  item?.id,
                  key
                )}/${totalCount}`
              : `${key}/${item?.product?.app_info?.ck_piece_cnt}`)
      );
      if (obj) {
        return true;
      }
      return false;
    }
    return false;
  };

  const handleAddRemovePrintObject = (
    item,
    order,
    key,
    isCakeItem,
    cake_items,
    totalCount
  ) => {
    if (
      handleIsExistInPrintItems(
        item,
        order,
        key,
        isCakeItem,
        cake_items,
        totalCount
      )
    ) {
      handleRemovePrintObject(
        item,
        order,
        key,
        isCakeItem,
        cake_items,
        totalCount
      );
    } else {
      handleAddPrintObject(
        item,
        order,
        key,
        isCakeItem,
        cake_items,
        totalCount
      );
    }
  };

  useEffect(() => {
    printItems = {};
  }, []);

  const handleSelectForLabels = (
    itemID,
    key,
    item,
    order,
    isCakeItem,
    cake_items,
    totalCount
  ) => {
    if (dailyIdsOrders[order?.id]) {
      const val = getUpdatedValue(itemID, key);
      if (isInSelectedLabels(itemID, key)) {
        setSelectedLabels([...selectedLabels.filter((l) => l !== val)]);
      } else {
        setSelectedLabels((prev) => [...prev, val]);
      }

      handleAddRemovePrintObject(
        item,
        order,
        key,
        isCakeItem,
        cake_items,
        totalCount
      );
    } else {
      displayErrorToast("Daily ID not Present for given Order");
    }
  };

  const sortHandle = (items) => {
    return [...items].sort((a, b) => {
      if (a?.SIZE === "10 RND") {
        return 1;
      } else if (b?.SIZE === "10 RND") {
        return -1;
      } else {
        return a?.SIZE.localeCompare(b?.SIZE);
      }
    });
  };

  const isInSelectedLabels = (itemID, key) => {
    const val = getUpdatedValue(itemID, key);
    const selectedCard = selectedLabels.find((l) => l === val);
    return selectedCard ? true : false;
  };

  const isPrinted = (
    isCakeItem,
    item,
    cake_items,
    totalCount,
    key,
    arrayLength
  ) => {
    if (isCakeItem) {
      let checkData = `${getCountForCakeItem(
        cake_items,
        item?.id,
        key
      )}/${totalCount}`;

      if (
        itemInfo[item?.id]?.labels &&
        Array.isArray(itemInfo[item?.id]?.labels)
      ) {
        return itemInfo[item?.id]?.labels.includes(checkData);
      }
      return false;
    } else {
      let checkData = `${key}/${arrayLength}`;
      if (
        itemInfo[item?.id]?.labels &&
        Array.isArray(itemInfo[item?.id]?.labels)
      ) {
        return itemInfo[item?.id]?.labels.includes(checkData);
      }
      return false;
    }
  };

  const displayLabels = (item, order, isCakeItem, totalCount, cake_items) => {
    if (item?.product?.app_info?.ck_piece_cnt) {
      let renderArray = Array.from(
        { length: item?.product?.app_info?.ck_piece_cnt },
        (_, i) => i + 1
      );

      let flavour1 = getModifiersValue(
        item?.modifieritems,
        modifierCatData?.flavor[0]
      );

      let flavour2 = getModifiersValue(
        item?.modifieritems,
        modifierCatData?.flavor[1]
      );

      let flavour = flavour1 === "No modifier" ? flavour2 : flavour1;

      let filling = getModifiersValue(
        item?.modifieritems,
        modifierCatData?.filling
      );

      let orderDisplayName = giveOrderDisplayName(order, ordersInfo);

      return renderArray.map((key) => {
        return (
          <div
            key={`${item.id}--${key}`}
            onClick={() =>
              handleSelectForLabels(
                item?.id,
                key,
                item,
                order,
                isCakeItem,
                cake_items,
                totalCount
              )
            }
            className="d-flex flex-column align-items-center p-4 cursorPointer"
          >
            <div
              className={`card ${
                isInSelectedLabels(item?.id, key) && "border-2 border-green"
              }`}
            >
              <div className="lables-text title">
                {item?.product?.app_info?.ck_size}{" "}
                {item?.product?.app_info?.ck_shape.toUpperCase()}
              </div>

              <div className="pb-2">
                <div className="lables-text sm">Flavor:</div>
                <div className="lables-text ">{flavour}</div>
              </div>
              <div className="pb-4">
                <div className="lables-text sm">Filling:</div>
                <div className="lables-text">{filling}</div>
              </div>
              <div className="d-flex pb-4">
                <div>
                  <div className="pb-2">
                    <div className="lables-text sm">Order:</div>
                    <div className="lables-text lg">{order?.local_id}</div>
                  </div>
                  <div className="pe-5">
                    <div className="lables-text sm">Daily ID:</div>
                    <div className="lables-text lg">
                      {dailyIdsOrders[order?.id]
                        ? dailyIdsOrders[order?.id]
                        : "-"}
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
                    {isCakeItem ? (
                      <div className="lables-text lg">
                        {getCountForCakeItem(cake_items, item?.id, key)}/
                        {totalCount}
                      </div>
                    ) : (
                      <div className="lables-text lg">
                        {key}/{renderArray.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="pb-4">
                <div className="lables-text sm">Name:</div>
                <div className="lables-text">{orderDisplayName}</div>
              </div>
            </div>
            {isPrinted(
              isCakeItem,
              item,
              cake_items,
              totalCount,
              key,
              renderArray.length
            ) ? (
              <div className="print-status printed my-3 "> Printed </div>
            ) : (
              <div className="print-status not-printed my-1">Not Printed</div>
            )}
          </div>
        );
      });
    }
  };

  const removeEmptyOrders = (displayOrdersByDate) => {
    const filteredOrder = displayOrdersByDate.filter((order) => {
      return order.items.some((item) => {
        if (item.cake_items) {
          return item.cake_items.some((cakeItem) => {
            if (cakeItem?.product?.app_info?.ck_piece_cnt) {
              return true;
            }
            return false;
          });
        } else {
          if (item?.product?.app_info?.ck_piece_cnt) {
            return true;
          }
          return false;
        }
      });
    });
    return filteredOrder;
  };

  const isAllOrderLabelSelected = (order) => {
    return order.items.every((item) => {
      if (item.cake_items) {
        return item.cake_items.every((cakeItem) => {
          if (cakeItem?.product?.app_info?.ck_piece_cnt) {
            let renderArray = Array.from(
              { length: cakeItem?.product?.app_info?.ck_piece_cnt },
              (_, i) => i + 1
            );
            return renderArray.every((key) => {
              if (
                selectedLabels.indexOf(getUpdatedValue(cakeItem?.id, key)) !==
                -1
              ) {
                return true;
              }
              return false;
            });
          }
          return true;
        });
      } else {
        if (item?.product?.app_info?.ck_piece_cnt) {
          let renderArray = Array.from(
            { length: item?.product?.app_info?.ck_piece_cnt },
            (_, i) => i + 1
          );
          return renderArray.every((key) => {
            if (selectedLabels.indexOf(getUpdatedValue(item?.id, key)) !== -1) {
              return true;
            }
            return false;
          });
        }
        return true;
      }
    });
  };

  const getLabelsForGivenOrder = (order) => {
    var selectedLabelsForGivenOrder = [];
    order.items.forEach((item) => {
      if (item.cake_items) {
        item.cake_items.forEach((cakeItem) => {
          if (cakeItem?.product?.app_info?.ck_piece_cnt) {
            let renderArray = Array.from(
              { length: cakeItem?.product?.app_info?.ck_piece_cnt },
              (_, i) => i + 1
            );
            renderArray.forEach((key) => {
              let val = getUpdatedValue(cakeItem?.id, key);
              selectedLabelsForGivenOrder.push(val);
            });
          }
        });
      } else {
        if (item?.product?.app_info?.ck_piece_cnt) {
          let renderArray = Array.from(
            { length: item?.product?.app_info?.ck_piece_cnt },
            (_, i) => i + 1
          );

          renderArray.forEach((key) => {
            let val = getUpdatedValue(item?.id, key);
            selectedLabelsForGivenOrder.push(val);
          });
        }
      }
    });

    return [...new Set(selectedLabelsForGivenOrder)];
  };

  const handleAddRemovePrintObjectForAllItem = (order, isAdd) => {
    order.items.forEach((item) => {
      if (item?.cake_items) {
        let totalCount = calculateTotalCount(item?.cake_items);
        item?.cake_items.forEach((cakeItem) => {
          if (cakeItem?.product?.app_info?.ck_piece_cnt) {
            let renderArray = Array.from(
              { length: cakeItem?.product?.app_info?.ck_piece_cnt },
              (_, i) => i + 1
            );
            renderArray.forEach((key) => {
              if (isAdd) {
                if (
                  !handleIsExistInPrintItems(
                    cakeItem,
                    order,
                    key,
                    true,
                    item?.cake_items,
                    totalCount
                  )
                ) {
                  handleAddPrintObject(
                    cakeItem,
                    order,
                    key,
                    true,
                    item?.cake_items,
                    totalCount
                  );
                }
              } else {
                if (
                  handleIsExistInPrintItems(
                    cakeItem,
                    order,
                    key,
                    true,
                    item?.cake_items,
                    totalCount
                  )
                ) {
                  handleRemovePrintObject(
                    cakeItem,
                    order,
                    key,
                    true,
                    item?.cake_items,
                    totalCount
                  );
                }
              }
            });
          }
        });
      } else {
        if (item?.product?.app_info?.ck_piece_cnt) {
          let renderArray = Array.from(
            { length: item?.product?.app_info?.ck_piece_cnt },
            (_, i) => i + 1
          );

          renderArray.forEach((key) => {
            if (isAdd) {
              if (!handleIsExistInPrintItems(item, order, key, false, [], 0)) {
                handleAddPrintObject(item, order, key, false, [], 0);
              }
            } else {
              if (handleIsExistInPrintItems(item, order, key, false, [], 0)) {
                handleRemovePrintObject(item, order, key, false, [], 0);
              }
            }
          });
        }
      }
    });
  };

  const handleSelectAllLabels = (order) => {
    if (dailyIdsOrders[order?.id]) {
      let selectedLabelsForGivenOrder = getLabelsForGivenOrder(order);

      let allValue = [...selectedLabels, ...selectedLabelsForGivenOrder];

      allValue = [...new Set(allValue)];

      setSelectedLabels(allValue);
      handleAddRemovePrintObjectForAllItem(order, true);
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

  const getDataSortedByDailyOrder = useCallback(
    (allOrders, isAsc) => {
      if (!dailSortIds.length) {
        return allOrders;
      }
      const sortedList = [...allOrders].sort((a, b) => {
        const indexA = dailSortIds.indexOf(a?.id);
        const indexB = dailSortIds.indexOf(b?.id);
        if (indexA !== -1 && indexB !== -1) {
          if (isAsc) {
            return indexA - indexB > 0 ? 1 : -1;
          } else {
            return indexB - indexA > 0 ? 1 : -1;
          }
        } else if (indexA !== -1) {
          return -1;
        } else if (indexB !== -1) {
          return 1;
        } else {
          const { pickup_time: a_orderTime } = a;
          const { pickup_time: b_orderTime } = b;
          const a_orderTimeMoment = moment(a_orderTime).valueOf();
          const b_orderTimeMoment = moment(b_orderTime).valueOf();
          if (a_orderTimeMoment !== b_orderTimeMoment) {
            return a_orderTimeMoment - b_orderTimeMoment;
          } else {
            const a_value = a.local_id.replace(/^w/, "");
            const b_value = b.local_id.replace(/^w/, "");
            return a_value - b_value;
          }
        }
      });
      return sortedList;
    },
    [dailSortIds]
  );

  const handleSortFunction = useCallback(
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
        case filterLabels.dailyOrder.asc:
          return getDataSortedByDailyOrder(ordersForGivenDate, true);
        case filterLabels.dailyOrder.desc:
          return getDataSortedByDailyOrder(ordersForGivenDate, false);

        default:
          return handleSort(ordersForGivenDate, filterConstant.local_id, true);
      }
    },
    [
      filterState,
      getDataSortedByTime,
      handleSort,
      getDataSortedByDailyID,
      getDataSortedByDailyOrder,
    ]
  );

  const isTieredCake = (itemID, orderID) => {
    const selectedOrder = displayOrdersByDate.find(
      (order) => order?.local_id === orderID
    );
    const selectedItem = selectedOrder?.items.find((item) => {
      if (item?.cake_items) {
        return item?.cake_items?.some((cakeItem) => cakeItem?.id === itemID);
      } else {
        return item?.id === itemID;
      }
    });

    return selectedItem?.product?.app_info?.ck_tiers > 1;
  };

  const handleSortForPrint = (printItems) => {
    switch (printOrder) {
      case printOrderSorting.printByFlavour:
        let updatedForTieredNonTiered = getTieredNotTieredItems(
          printItems,
          isTieredCake,
          sortHandle
        );
        const dataForFlavour = makeGroupAsPerKey(
          updatedForTieredNonTiered?.nonTiered,
          "FLV"
        );
        const dataForOrder = makeGroupAsPerKey(
          updatedForTieredNonTiered?.tiered,
          "ID"
        );
        return {
          nonTiered: {
            ...dataForFlavour,
          },
          tiered: {
            ...dataForOrder,
          },
        };
      case printOrderSorting.printByOrder:
        let updatedForTieredNonTieredForPrintByOrder = getTieredNotTieredItems(
          printItems,
          isTieredCake,
          sortHandle
        );

        const dataForNonTiered = makeGroupAsPerKey(
          updatedForTieredNonTieredForPrintByOrder?.nonTiered,
          "ITEM_ID"
        );
        const dataForTiered = makeGroupAsPerKey(
          updatedForTieredNonTieredForPrintByOrder?.tiered,
          "ITEM_ID"
        );

        return {
          nonTiered: {
            ...dataForNonTiered,
          },
          tiered: {
            ...dataForTiered,
          },
        };

      default:
        return printItems;
    }
  };

  const updatePrintLabels = async (printData) => {
    const res = await editLabelApi(printData);
    if (res && res?.success) {
      setItemInfo((prev) => {
        return {
          ...prev,
          ...res.data,
        };
      });

      setSelectedLabels([]);
      printItems = {};
    }
  };
  const handlePrintLabels = async () => {
    const updatedData = handleSortForPrint(_.cloneDeep(printItems));
    LabelHelper.printLabel(updatedData);

    await updatePrintLabels(_.cloneDeep({ labels: printItems }));
  };

  const displayFilterOrders = useMemo(
    () =>
      handleSortFunction(removeEmptyOrders(_.cloneDeep(displayOrdersByDate))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterState, handleSortFunction, displayOrdersByDate]
  );
  const isOrderPrinted = (order) => {
    return order?.items?.every((item) => {
      if (item?.cake_items) {
        let totalCount = calculateTotalCount(item?.cake_items);
        return item?.cake_items.every((cakeItem) => {
          if (cakeItem?.product?.app_info?.ck_piece_cnt) {
            let renderArray = Array.from(
              { length: cakeItem?.product?.app_info?.ck_piece_cnt },
              (_, i) => i + 1
            );
            return renderArray.every((key) =>
              isPrinted(
                true,
                cakeItem,
                item?.cake_items,
                totalCount,
                key,
                renderArray.length
              )
            );
          }
          return true;
        });
      } else {
        if (item?.product?.app_info?.ck_piece_cnt) {
          let renderArray = Array.from(
            { length: item?.product?.app_info?.ck_piece_cnt },
            (_, i) => i + 1
          );
          return renderArray.every((key) =>
            isPrinted(false, item, [], 0, key, renderArray.length)
          );
        }
        return true;
      }
    });
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
    () => handleFilterForPrinted(_.cloneDeep(displayFilterOrders)),
    [handleFilterForPrinted, displayFilterOrders]
  );

  const calculateTotalCount = (cakeItems) => {
    let total = 0;
    cakeItems.forEach((cakeItem) => {
      if (cakeItem?.product?.app_info?.ck_piece_cnt) {
        total += cakeItem?.product?.app_info?.ck_piece_cnt;
      }
    });
    return total;
  };
  const isSelectForAllExistingOrders = () => {
    return displayOrdersByDate.every((order) => {
      return isAllOrderLabelSelected(order);
    });
  };

  const handleSelectUnSelectAllOrder = () => {
    if (isSelectForAllExistingOrders()) {
      setSelectedLabels([]);
      printItems = {};
    } else {
      let tempSelectedLabels = [];
      let flag = false;
      removeEmptyOrders(_.cloneDeep(displayOrdersByDate)).forEach((order) => {
        if (dailyIdsOrders[order?.id]) {
          let selectedLabelsForGivenOrder = getLabelsForGivenOrder(order);
          let allValue = [...selectedLabels, ...selectedLabelsForGivenOrder];
          allValue = [...new Set(allValue)];
          tempSelectedLabels = [...tempSelectedLabels, ...allValue];
          handleAddRemovePrintObjectForAllItem(order, true);
        } else {
          flag = true;
        }
      });
      if (flag === true) {
        displayErrorToast("Daily ID is not present in some order");
      }
      tempSelectedLabels = [...new Set(tempSelectedLabels)];
      setSelectedLabels(tempSelectedLabels);
    }
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
                <option value={filterLabels.dailyOrder.asc}>
                  Daily Order (asc)
                </option>
                <option value={filterLabels.dailyOrder.desc}>
                  Daily Order (desc)
                </option>
              </Form.Select>
            </th>
            <td className="border-0">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex">
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
                  <Form.Select
                    style={{ width: "170px", height: "35px" }}
                    className="custom-input board-select ms-2"
                    defaultValue={printOrderSorting.printByFlavour}
                    onChange={(e) => {
                      setPrintOrder(parseInt(e.target.value));
                    }}
                  >
                    <option value={printOrderSorting.printByFlavour}>
                      Print By Flavour
                    </option>
                    <option value={printOrderSorting.printByOrder}>
                      Print By Order
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
              {isSelectForAllExistingOrders() ? (
                <Button
                  onClick={() => handleSelectUnSelectAllOrder()}
                  className="checked-status not-complete px-2"
                >
                  <CircleClose color="white" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleSelectUnSelectAllOrder()}
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
                  <td>
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
                      {isOrderPrinted(order) ? (
                        <div className="print-status printed my-3 ">
                          {" "}
                          Printed{" "}
                        </div>
                      ) : (
                        <div className="print-status not-printed my-1">
                          Not Printed
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="overflow-scroll">
                    <div className="d-flex flex-nowrap width-100">
                      {order.items.map((item) => {
                        let totalCount = 0;
                        if (item.cake_items) {
                          totalCount = calculateTotalCount(item.cake_items);
                          return item?.cake_items.map((cakeItem) => {
                            return displayLabels(
                              cakeItem,
                              order,
                              true,
                              totalCount,
                              item?.cake_items
                            );
                          });
                        } else {
                          return displayLabels(item, order, false, 0, []);
                        }
                      })}
                    </div>
                  </td>
                  {isAllOrderLabelSelected(order) ? (
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

                  {/* <td className="text-center">
                  <Button className="checked-status complete px-2 py-0">
                    <CheckedIcon color="white" />
                  </Button>
                </td> */}
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

export default CakeLabels;
