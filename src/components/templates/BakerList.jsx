import _, { isEmpty } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Form, Table } from "react-bootstrap";
import { editItemInfoApi } from "../../api/iteminfo";
import ListIcon from "../../assets/icons/list.svg";
import {
  calculatePercentage,
  getUpdatedId,
  normalizeOrderWithoutQuantity,
} from "../../global/helpers";
import useOrderOverviewModal from "../../hooks/useOrderOverviewModal";
import {
  bakersLevels,
  modifierCatData,
  orderOverViewComponentData,
  phasesId,
  staticFlavourKeys,
} from "../../utils/StaticData";
import NoData from "../common/NoData";
import OrderOverviewModal from "../modals/OrderOverviewModal";

const BakerList = (props) => {
  const {
    orders,
    ordersInfo,
    itemInfo,
    setItemInfo,
    bakerFilter,
    setBakerFilterDropDown,
    currentdropDownValueForBaker,
  } = props;
  const [bakerFilterState, setBakerFilterState] = useState(bakerFilter);
  const [
    handleOrderOverviewModal,
    orderOverviewModalShow,
    componentType,
    handleCloseModal,
    handleChangeOrderInfo,
  ] = useOrderOverviewModal(ordersInfo);

  useEffect(() => {
    setBakerFilterState(bakerFilter);
  }, [bakerFilter]);

  const { nonTiered, tiered } = bakersLevels;

  // <------------------------------------------------------UseEffect Functions ------------------------------------------------------>

  const filterItemsByOthers = (items, key, property) => {
    let filteredItems = [];

    filteredItems = items.filter((qtyItems) =>
      qtyItems.some((item) => {
        const appInfo = item?.product?.app_info;

        return appInfo[property] === key;
      })
    );
    return filteredItems;
  };

  const filterItemsByFlavor = (items, key) => {
    const filteredItems = items.filter((qtyItems) =>
      qtyItems.some((item) =>
        item?.modifieritems.some(
          (modiItem) =>
            modiItem?.modifier?.kitchen_print_name === key &&
            modifierCatData.flavor.includes(modiItem?.modifier?.modifierCat)
        )
      )
    );
    return filteredItems;
  };

  const getUpdatedOrders = (orders) => {
    return orders.map((order) => {
      const updatedItems = order.items.map((item) => {
        const tempItem = [];
        if (item?.cake_items) {
          const updatedCakeItems = item?.cake_items.map((cakeItem) => {
            const tempCakeItem = [];
            for (let i = 1; i <= +cakeItem?.quantity; i++) {
              tempCakeItem.push(cakeItem);
            }
            return tempCakeItem;
          });
          return [
            {
              ...item,
              cake_items: updatedCakeItems,
            },
          ];
        } else {
          for (let i = 1; i <= +item?.quantity; i++) {
            tempItem.push(item);
          }
          return tempItem;
        }
      });
      return {
        ...order,
        items: updatedItems,
      };
    });
  };

  const groupBy = useCallback((objectArray, property) => {
    const flavorModifier = property === "kitchen_print_name";
    const filterItems = flavorModifier
      ? filterItemsByFlavor
      : filterItemsByOthers;
    const grouped = objectArray.reduce((accumulator, currentObject) => {
      const keys = [];
      if (flavorModifier) {
        for (const qtyItems of currentObject.items) {
          for (const item of qtyItems) {
            for (const modiItem of item.modifieritems) {
              const modiId = modiItem?.modifier?.modifierCat;
              if (modifierCatData.flavor.includes(modiId)) {
                keys.push(modiItem?.modifier?.kitchen_print_name);
              }
            }
          }
        }
      } else {
        for (const qtyItems of currentObject.items) {
          for (const item of qtyItems) {
            const appInfo = item.product.app_info;
            if (appInfo.hasOwnProperty(property)) {
              keys.push(appInfo[property]);
            }
          }
        }
      }
      const uniqueKeys = [...new Set(keys)];
      for (const key of uniqueKeys) {
        if (!accumulator.hasOwnProperty(key)) {
          accumulator[key] = [];
        }
        const filteredCurrentObj = {
          ...currentObject,
          items: filterItems(currentObject.items, key, property),
        };
        accumulator[key].push(filteredCurrentObj);
      }
      return accumulator;
    }, {});
    return grouped;
  }, []);

  const nestGroupsBy = useCallback(
    (arr, properties, prevKey) => {
      properties = Array.from(properties);
      if (properties.length === 1) {
        return groupBy(arr, properties[0]);
      }
      const property = properties.shift();
      var grouped = groupBy(arr, property, prevKey);
      for (const key in grouped) {
        if (grouped.hasOwnProperty(key)) {
          grouped[key] = nestGroupsBy(grouped[key], properties);
        }
      }
      return grouped;
    },
    [groupBy]
  );

  const filtereLevels = useCallback(
    (orders, key) => {
      const filteredItemsinOrders = orders.map((order) => {
        const filteredItems = order?.items
          ? order?.items.filter((qtyItems) =>
              qtyItems.some((item) => {
                const appInfo = item?.product?.app_info;
                if (key === tiered) {
                  return appInfo.ck_tiers > 1;
                } else {
                  return appInfo.ck_tiers <= 1;
                }
              })
            )
          : [];
        return {
          ...order,
          items: filteredItems,
        };
      });
      const filteredOrders = filteredItemsinOrders.filter(
        (order) => !isEmpty(order?.items)
      );
      return filteredOrders;
    },
    [tiered]
  );

  const handleFilterForBacker = useCallback(
    (tempBakerListobj) => {
      let backerListNonTieredObj = { ...tempBakerListobj[nonTiered] };
      let nonTieredFlavours = [];
      let nonTieredSizes = [];
      if (!isEmpty(tempBakerListobj) && !isEmpty(tempBakerListobj[nonTiered])) {
        Object.keys(backerListNonTieredObj).forEach((key) => {
          nonTieredFlavours.push(key);
          Object.keys(backerListNonTieredObj[key]).forEach((sizeKey) => {
            nonTieredSizes.push(sizeKey);
          });
        });
      }

      let tieredFlavour = [];
      let tieredSizes = [];
      if (!isEmpty(tempBakerListobj) && !isEmpty(tempBakerListobj[tiered])) {
        tempBakerListobj[tiered].forEach((order) => {
          order?.items.forEach((qtyItems) => {
            qtyItems.forEach((item) => {
              if (item?.cake_items) {
                item?.cake_items?.forEach((qtyCakeItems) => {
                  qtyCakeItems.forEach((cakeItem) => {
                    tieredSizes.push(cakeItem?.product?.app_info?.ck_size);
                    cakeItem?.modifieritems.forEach((modiItem) => {
                      const modifierCategory = modiItem?.modifier?.modifierCat;
                      const flavourName =
                        modiItem?.modifier?.kitchen_print_name;
                      if (modifierCatData.flavor.includes(modifierCategory)) {
                        tieredFlavour.push(flavourName);
                      }
                    });
                  });
                });
              }
            });
          });
        });
        tieredSizes = [...new Set(tieredSizes)];
        tieredFlavour = [...new Set(tieredFlavour)];
      }
      const allSizes = [...nonTieredSizes, ...tieredSizes];
      const allFlavor = [...nonTieredFlavours, ...tieredFlavour];
      const uniqueAllFlavour = [...new Set(allFlavor)];
      const uniqueTempSizes = [...new Set(allSizes)];
      return [uniqueTempSizes, uniqueAllFlavour];
    },
    [nonTiered, tiered]
  );

  const updatedOrdersMemo = useMemo(() => getUpdatedOrders(orders), [orders]);

  const tieredOrdersMemo = useMemo(
    () => filtereLevels(updatedOrdersMemo, tiered),
    [filtereLevels, updatedOrdersMemo, tiered]
  );

  const nonTieredOrdersMemo = useMemo(
    () => filtereLevels(updatedOrdersMemo, nonTiered),
    [filtereLevels, updatedOrdersMemo, nonTiered]
  );

  const bakerListObj = useMemo(() => {
    const groups = nestGroupsBy(nonTieredOrdersMemo, [
      "kitchen_print_name",
      "ck_size",
      "ck_shape",
    ]);
    return {
      [nonTiered]: groups,
      [tiered]: tieredOrdersMemo,
    };
  }, [nestGroupsBy, nonTiered, nonTieredOrdersMemo, tiered, tieredOrdersMemo]);

  useEffect(() => {
    if (!isEmpty(bakerListObj)) {
      const [tempSizes, tempFlavours] = handleFilterForBacker(bakerListObj);

      setBakerFilterDropDown([
        {
          filter: "flavorCakes",
          filterValue: tempFlavours,
        },
        {
          filter: "sizeCakes",
          filterValue: tempSizes,
        },
        {
          filter: "shapeCakes",
          filterValue: ["rnd", "sqr", "sht"],
        },
      ]);
    }
  }, [bakerListObj, handleFilterForBacker, orders, setBakerFilterDropDown]);

  const filterCakeItems = (cakeItem, cakeItemIndex) => {
    const modifierItemsByFlavor = cakeItem?.modifieritems
      .filter((modiItem) =>
        modifierCatData.flavor.includes(modiItem?.modifier?.modifierCat)
      )
      .filter((modiItem) => {
        switch (bakerFilterState.baked) {
          case 0:
            return true;
          case 1:
            return handleBakedCheck(
              itemInfo[getUpdatedId(cakeItem.id, cakeItemIndex)],
              modiItem?.modifier?.modifierCat === modifierCatData?.flavor[0]
                ? 1
                : 2
            );
          case 2:
            return !handleBakedCheck(
              itemInfo[getUpdatedId(cakeItem.id, cakeItemIndex)],
              modiItem?.modifier?.modifierCat === modifierCatData?.flavor[0]
                ? 1
                : 2
            );
          default:
            return true;
        }
      });
    return modifierItemsByFlavor;
  };

  const isEmptyTieredOrders = (orders) =>
    orders.every((order) => {
      return order?.items.every((qtyItems) => {
        return qtyItems.every((item) => {
          return item?.cake_items.every((qtyCakeItems) => {
            return qtyCakeItems.every((cakeItem, cakeIndex) =>
              isEmpty(filterCakeItems(cakeItem, cakeIndex))
            );
          });
        });
      });
    });

  const isEmptyNonTieredOrders = (orders) =>
    Object.values(orders).every((flavors) => isEmptyFlavorOrders(flavors));

  const nextFilterName = (currFilterName) => {
    if (currFilterName === "flavor") {
      return "size";
    } else if (currFilterName === "size") {
      return "shape";
    } else {
      return "";
    }
  };

  const nextFilterKey = (currFilterName) => {
    if (currFilterName === "flavor") {
      return bakerFilter.sizeCakes;
    } else if (currFilterName === "size") {
      return bakerFilter.shapeCakes;
    } else if (currFilterName === "shape") {
      return -1;
    } else {
      return -1;
    }
  };

  const giveValue = (filterKey, currentFilter) => {
    if (filterKey === -1 || currentFilter === "") {
      return "";
    } else {
      if (filterKey && currentFilter === "flavor") {
        return currentdropDownValueForBaker?.flavorCakes;
      } else if (filterKey && currentFilter === "size") {
        return currentdropDownValueForBaker?.sizeCakes;
      } else if (filterKey && currentFilter === "shape") {
        return currentdropDownValueForBaker?.shapeCakes;
      } else {
        return "all";
      }
    }
  };

  const handleFilterNonTieredCakes = (obj, filterKey, currentFilter) => {
    let filterVal = giveValue(filterKey, currentFilter);
    let out = {};
    for (let key in obj) {
      if (typeof obj[key] === "object") {
        if (filterVal === "all" || key === filterVal) {
          if (!_.isArray(obj[key])) {
            out = {
              ...out,
              [key]: {
                ...handleFilterNonTieredCakes(
                  obj[key],
                  nextFilterKey(currentFilter),
                  nextFilterName(currentFilter)
                ),
              },
            };
          } else {
            out = { ...out, [key]: obj[key] };
          }
        } else {
          if (filterVal === "") {
            out = { ...out, [key]: obj[key] };
          }
        }
      } else {
        out = { ...out, [key]: obj[key] };
      }
    }

    return out;
  };

  const handleFlavorFilter = (key, cakeItem) => {
    switch (bakerFilter[key]) {
      case 0:
        return true;
      case 1:
        return cakeItem?.modifieritems.some((modiItem) => {
          const modifierCategory = modiItem?.modifier?.modifierCat;
          const flavourName = modiItem?.modifier?.kitchen_print_name;
          return (
            modifierCatData.flavor.includes(modifierCategory) &&
            flavourName === currentdropDownValueForBaker[key]
          );
        });
      default:
        return true;
    }
  };

  const handleSizesFilter = (key, cakeItem) => {
    switch (bakerFilter[key]) {
      case 0:
        return true;
      case 1:
        return (
          +cakeItem?.product?.app_info?.ck_size ===
          +currentdropDownValueForBaker[key]
        );

      default:
        return true;
    }
  };

  const handleShapeFilter = (key, cakeItem) => {
    switch (bakerFilter[key]) {
      case 0:
        return true;
      case 1:
        return (
          +cakeItem?.product?.app_info?.ck_shape ===
          +currentdropDownValueForBaker[key]
        );

      default:
        return true;
    }
  };

  const handleFilterOrders = (cakeItems) => {
    if (
      cakeItems.some((qtyCakeItems) =>
        qtyCakeItems.some(
          (cakeItem) =>
            handleShapeFilter(staticFlavourKeys.shapeCakes, cakeItem) &&
            handleFlavorFilter(staticFlavourKeys.flavorCakes, cakeItem) &&
            handleSizesFilter(staticFlavourKeys.sizeCakes, cakeItem)
        )
      )
    ) {
      return cakeItems;
    } else {
      return [];
    }
  };

  const handleFilterTieredCakes = (tieredCakesOrders) => {
    return tieredCakesOrders.map((order) => {
      const updatedItems = order?.items.map((qtyItems) =>
        qtyItems.map((item) => {
          const updatedCakeItems = handleFilterOrders(item?.cake_items);
          return {
            ...item,
            cake_items: updatedCakeItems,
          };
        })
      );
      return {
        ...order,
        items: updatedItems,
      };
    });
  };

  const checkBoxFilterOrders = useMemo(() => {
    if (!isEmpty(bakerListObj[nonTiered]) || !isEmpty(bakerListObj[tiered])) {
      const filteredNonTieredObject = handleFilterNonTieredCakes(
        _.cloneDeep(bakerListObj[nonTiered]),
        bakerFilter?.flavorCakes,
        "flavor"
      );
      const tempfilteredTieredArr = handleFilterTieredCakes(
        _.cloneDeep(bakerListObj[tiered])
      );

      return {
        [nonTiered]: filteredNonTieredObject,
        [tiered]: tempfilteredTieredArr,
      };
    }
    return {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bakerListObj, bakerFilter, currentdropDownValueForBaker]);

  // <------------------------------------------------------Baked checkbox Functions ------------------------------------------------------>

  const handleBakedCheck = (itemInfoData, row) => {
    let check = false;
    if (
      itemInfoData?.current_phase &&
      itemInfoData?.current_phase.hasOwnProperty(row) &&
      itemInfoData?.current_phase[row]?.phase
    ) {
      check = itemInfoData?.current_phase[row]?.phase >= phasesId?.baked;
    }
    return check;
  };

  const getotherRowData = (itemId, otherRow) => {
    const itemInfoData = itemInfo[itemId];
    if (
      itemInfoData &&
      itemInfoData.current_phase[otherRow] &&
      itemInfoData.current_phase[otherRow]?.phase >= phasesId?.baked
    ) {
      return true;
    } else {
      return false;
    }
  };

  const handleOnChangeBaked = async (itemId, row, e, rows) => {
    let otherRow;
    const updatedItemInfo = {
      ...itemInfo,
      [itemId]: {
        ...itemInfo[itemId],
        current_phase: {
          ...itemInfo[itemId]?.current_phase,
          [row]: { phase: e.target.checked ? phasesId.baked : null },
        },
      },
    };
    setItemInfo(updatedItemInfo);
    if (rows.length > 1) {
      otherRow = row === 1 ? 2 : 1;
    }

    const payload = {
      completed_phases: {
        [row]: {
          [phasesId.baked]: e.target.checked,
        },
        ...(rows.length > 1 && {
          [otherRow]: {
            [phasesId.baked]: getotherRowData(itemId, otherRow),
          },
        }),
      },
    };

    const res = await editItemInfoApi(payload, itemId);

    if (res && res.success === true) {
      if (res?.data) {
        setItemInfo((prev) => {
          return {
            ...prev,
            [itemId]: res.data,
          };
        });
      }
    }
  };

  // <------------------------------------------------------Tiered Orders Functions ------------------------------------------------------>

  // <---------Batch Calculation for Tiered----------->
  const calculateBatchByName = (items) => {
    let sum = 0;
    items.forEach((qtyItems) =>
      qtyItems.forEach((item) => {
        item?.cake_items.forEach((qtyCakeItems) =>
          qtyCakeItems.forEach((cakeItem) => {
            const appInfo = cakeItem?.product?.app_info;
            sum += appInfo?.ck_batch * 2;
          })
        );
      })
    );
    return sum;
  };

  const calculateBatchForTiered = () => {
    let sum = 0;
    if (
      checkBoxFilterOrders[tiered] &&
      checkBoxFilterOrders[tiered].length > 0
    ) {
      checkBoxFilterOrders[tiered].forEach((order) => {
        if (order?.items && order?.items.length) {
          sum += calculateBatchByName(order?.items);
        }
      });
    }
    return sum;
  };

  // <-----Baked Percentage Calulation for Tiered----->
  const getDataBakedPerForTiered = (order) => {
    let totalBaked = 0;
    let totalItems = 0;
    order?.items.forEach((qtyItems) => {
      qtyItems.forEach((item) => {
        const cakeItemsByFlavor = item?.cake_items.map((qtyItems) => {
          return qtyItems.map((cakeItem) => {
            const modifierItemsByFlavor = cakeItem?.modifieritems.filter(
              (modiItem) =>
                modifierCatData.flavor.includes(modiItem?.modifier?.modifierCat)
            );
            return {
              ...cakeItem,
              modifieritems: modifierItemsByFlavor,
            };
          });
        });
        cakeItemsByFlavor.forEach((qtyCakeItems) => {
          qtyCakeItems.forEach((cakeItem) => {
            totalItems += cakeItem.modifieritems.length;
            cakeItem.modifieritems.forEach((modiItem) => {
              const isBaked = handleBakedCheck(
                itemInfo[cakeItem.id],
                modiItem?.modifier?.modifierCat === modifierCatData?.flavor[0]
                  ? 1
                  : 2
              );

              if (isBaked) {
                totalBaked += 1;
              }
            });
          });
        });
      });
    });
    return [totalBaked, totalItems];
  };

  const getDataOverAllBakedPerForTiered = (tieredOrders) => {
    let overAllBakedItems = 0;
    let overAllItems = 0;
    tieredOrders.forEach((order) => {
      const [totalBaked, totalItems] = getDataBakedPerForTiered(order);
      overAllBakedItems += totalBaked;
      overAllItems += totalItems;
    });
    return [overAllBakedItems, overAllItems];
  };

  // <------------Render Tiered Order----------------->
  const renderTieredItems = (item, order) => {
    const cakeItemsByFlavor = item?.cake_items.map((qtyCakeItems) => {
      return qtyCakeItems.map((cakeItem, cakeItemIndex) => {
        const modifierItemsByFlavor = filterCakeItems(cakeItem, cakeItemIndex);
        return {
          ...cakeItem,
          modifieritems: modifierItemsByFlavor,
        };
      });
    });
    return cakeItemsByFlavor.map((qtyCakeItems) =>
      qtyCakeItems.map((cakeItem, cakeItemIndex) =>
        cakeItem.modifieritems.map((modiItem) => (
          <tr key={`${cakeItem.id} - ${modiItem.id} - ${cakeItemIndex}`}>
            <td>
              <div className="d-flex gap-2">
                <div
                  onClick={() =>
                    handleOrderOverviewModal(
                      orderOverViewComponentData?.order,
                      normalizeOrderWithoutQuantity(order)
                    )
                  }
                  style={{ cursor: "pointer" }}
                >
                  <img src={ListIcon} alt="list" height={22} />
                </div>
                <div>
                  {order?.customer?.first_name +
                    " " +
                    order.customer?.last_name}
                </div>
              </div>
            </td>
            <td>{order?.local_id}</td>
            <td>E1</td>
            <td>{cakeItem?.product?.app_info?.ck_size}</td>
            <td>{cakeItem?.product?.app_info?.ck_shape.toUpperCase()}</td>
            <td>{modiItem?.modifier?.kitchen_print_name}</td>
            <td>{cakeItem?.product?.app_info?.ck_batch}</td>
            <td>
              <Form.Group>
                <Form.Check
                  label=""
                  onChange={(e) =>
                    handleOnChangeBaked(
                      getUpdatedId(cakeItem.id, cakeItemIndex),
                      modiItem?.modifier?.modifierCat === 8 ? 1 : 2,
                      e,
                      cakeItem?.modifieritems
                    )
                  }
                  id={`baked-${cakeItem.id}-${modiItem.id} - ${cakeItemIndex}`}
                  checked={handleBakedCheck(
                    itemInfo[getUpdatedId(cakeItem.id, cakeItemIndex)],
                    modiItem?.modifier?.modifierCat === 8 ? 1 : 2
                  )}
                  type="checkbox"
                  className="custom-input-box checkbox-24"
                  name={"baked"}
                />
              </Form.Group>
            </td>
          </tr>
        ))
      )
    );
  };

  // <------------------------------------------------------Non-Tiered Orders Functions ------------------------------------------------------>

  // <-------Order Calculation for Non-Tiered-------->

  const calculateSumOrderForFlavour = (flavorOrders) => {
    let sum = 0;
    Object.values(flavorOrders).forEach((sizeOrders) => {
      Object.values(sizeOrders).forEach((shapeOrders) => {
        sum += calculateTotalSum(shapeOrders);
      });
    });
    return sum;
  };

  const calculateTotalSum = (shapeOrders) => {
    let sum = 0;
    shapeOrders.forEach((order) => {
      order.items.forEach((qtyItems) => {
        qtyItems.forEach((item) => {
          if (item.product.app_info.ck_build === "dl") {
            sum += 2;
          } else {
            sum += 1;
          }
        });
      });
    });
    return sum;
  };

  const calculateOrderSum = () => {
    let sum = 0;

    Object.values(checkBoxFilterOrders[nonTiered]).forEach((flavorOrders) => {
      sum += calculateSumOrderForFlavour(flavorOrders);
    });

    return sum;
  };

  // <--------Batch Calculation for Non-Tiered-------->
  const calculateBatch = (arr, size, shape) => {
    const reqItem = arr.find((item) => {
      const appInfo = item?.product?.app_info;
      return appInfo?.ck_size === size && appInfo?.ck_shape === shape;
    });
    if (reqItem) {
      const appInfo = reqItem?.product?.app_info;
      let batchCount = 0;
      batchCount = appInfo?.ck_batch;
      return batchCount;
    } else {
      return 0;
    }
  };

  const calculateBatchForSummedUpValue = (items, size, shape) => {
    const reqItem = items.find((item) => {
      const appInfo = item?.product?.app_info;
      return appInfo?.ck_size === size && appInfo?.ck_shape === shape;
    });
    if (reqItem) {
      const appInfo = reqItem?.product?.app_info;
      let batchCount = 0;
      batchCount = appInfo?.ck_batch;

      if (appInfo?.ck_build === "dl" || appInfo?.ck_piece_cnt === 2) {
        batchCount *= 2;
      }
      return batchCount * reqItem?.quantity;
    } else {
      return 0;
    }
  };

  const calBatchForSummation = (items, size, shape) => {
    let sum = 0;
    items.forEach((currValue) => {
      sum += calculateBatchForSummedUpValue(currValue, size, shape);
    });
    return sum;
  };

  const calculateTotalBatchForFlavour = (flavorOrders) => {
    let sum = 0;
    Object.entries(flavorOrders).forEach(([sizeType, sizeOrders]) => {
      Object.entries(sizeOrders).forEach(([shapeType, shapeOrders]) => {
        sum += calculateTotalBatch(shapeOrders, sizeType, shapeType);
      });
    });
    return sum;
  };

  const calculateTotalBatch = (shapeOrders, size, shape) => {
    if (shapeOrders) {
      const totalBatch = shapeOrders.reduce((acc, currValue) => {
        const singleBatch = calBatchForSummation(currValue.items, size, shape);

        return acc + singleBatch;
      }, 0);
      return totalBatch;
    }
  };

  const calculateOverAllBatchSum = (checkBoxFilterOrders) => {
    let sum = 0;

    Object.entries(checkBoxFilterOrders).forEach(
      ([flavorType, flavorOrders]) => {
        sum += calculateTotalBatchForFlavour(flavorOrders);
      }
    );

    return sum;
  };

  // <---Baked Percentage Calulation for Non-Tiered--->
  const getDataBakedPerForShape = (orders) => {
    let totalBaked = 0;
    let totalItems = 0;
    orders.forEach((order) => {
      let rows = [1];
      order?.items?.forEach((qtyItems) => {
        qtyItems.forEach((item, index) => {
          if (item?.product?.app_info?.ck_build === "dl" && !rows.includes(2)) {
            rows.push(2);
          }
          totalItems += rows.length;
          rows.forEach((row) => {
            const isBaked = handleBakedCheck(
              itemInfo[getUpdatedId(item?.id, index)],
              row
            );
            if (isBaked) {
              totalBaked += 1;
            }
          });
        });
      });
    });
    return [totalBaked, totalItems];
  };

  const getDataBakedPerForFlavour = (flavorOrders) => {
    let totalBakedForFlavour = 0;
    let totalItemsForFlavour = 0;
    Object.values(flavorOrders).forEach((sizeOrders) => {
      Object.values(sizeOrders).forEach((shapeOrders) => {
        const [totalBaked, totalItems] = getDataBakedPerForShape(shapeOrders);
        totalBakedForFlavour += totalBaked;
        totalItemsForFlavour += totalItems;
      });
    });
    return [totalBakedForFlavour, totalItemsForFlavour];
  };

  const getDataOverAllBakedPerForNonTiered = (nonTieredObj) => {
    let overAllBakedItems = 0;
    let overAllItems = 0;
    Object.values(nonTieredObj).forEach((flavorOrders) => {
      const [totalBaked, totalItems] = getDataBakedPerForFlavour(flavorOrders);
      overAllBakedItems += totalBaked;
      overAllItems += totalItems;
    });
    return [overAllBakedItems, overAllItems];
  };

  const filterDlLayer = (item, rows, itemIndex) => {
    const filteredRow = rows.filter((row) => {
      switch (bakerFilterState.baked) {
        case 0:
          return true;
        case 1:
          return handleBakedCheck(
            itemInfo[getUpdatedId(item?.id, itemIndex)],
            row
          );
        case 2:
          return !handleBakedCheck(
            itemInfo[getUpdatedId(item?.id, itemIndex)],
            row
          );
        default:
          return true;
      }
    });
    return filteredRow;
  };

  // <------------Render Non-Tiered Order------------->
  const renderNonTieredOrders = (order, sizeType, shapeType, flavorType) => {
    let rows = [1];
    return order.items?.map((qtyItems, qtyIndex) =>
      qtyItems.map((item, itemIndex) => {
        if (
          (item?.product?.app_info?.ck_build === "dl" ||
            +item?.product?.app_info?.ck_piece_cnt === 2) &&
          !rows.includes(2)
        ) {
          rows.push(2);
        }

        return filterDlLayer(item, rows, itemIndex).map((row, index) => (
          <tr key={`${order.id}-${index}-${itemIndex}`}>
            <td>
              <div className="d-flex gap-2">
                <div
                  onClick={() =>
                    handleOrderOverviewModal(
                      orderOverViewComponentData?.order,
                      normalizeOrderWithoutQuantity(order)
                    )
                  }
                  style={{ cursor: "pointer" }}
                >
                  <img src={ListIcon} alt="list" height={22} />
                </div>
                <div>
                  {order?.customer?.first_name +
                    " " +
                    order?.customer?.last_name}{" "}
                </div>
              </div>
            </td>
            <td>{order?.local_id}</td>
            <td>E1</td>
            <td>{sizeType}</td>
            <td>{shapeType.toUpperCase()}</td>
            <td>{flavorType}</td>
            <td>
              {calculateBatch(order?.items[qtyIndex], sizeType, shapeType)}
            </td>
            <td>
              <Form.Group>
                <Form.Check
                  label=""
                  onChange={(e) =>
                    handleOnChangeBaked(
                      getUpdatedId(item?.id, itemIndex),
                      row,
                      e,
                      rows
                    )
                  }
                  id={`baked-${item.id}-${row}-${itemIndex}`}
                  checked={handleBakedCheck(
                    itemInfo[getUpdatedId(item?.id, itemIndex)],
                    row
                  )}
                  type="checkbox"
                  className="custom-input-box checkbox-24"
                  name={"baked"}
                />
              </Form.Group>
            </td>
          </tr>
        ));
      })
    );
  };

  const isEmptyTieredOrdersForAllCakeItem = (tieredOrder) => {
    let isEmptyCakeItems = true;
    tieredOrder.items.forEach((qtyItems) =>
      qtyItems.forEach((item) => {
        if (item?.cake_items && item?.cake_items.length > 0) {
          isEmptyCakeItems = false;
        }
      })
    );
    return isEmptyCakeItems;
  };

  const isEmptyfilteredOrders = (order) => {
    let rows = [1];
    return order.items.every((qtyItems) => {
      return qtyItems.every((item, itemIndex) => {
        if (item?.product?.app_info?.ck_build === "dl" && !rows.includes(2)) {
          rows.push(2);
        }
        return isEmpty(filterDlLayer(item, rows, itemIndex));
      });
    });
  };

  const isEmptyShapeOrders = (orders) =>
    orders.every((order) => isEmptyfilteredOrders(order));

  const isEmptyFlavorOrders = (orders) =>
    Object.values(orders).every((sizeOrders) =>
      Object.values(sizeOrders).every((shapeOrders) =>
        isEmptyShapeOrders(shapeOrders)
      )
    );

  return (
    <Table
      responsive
      className="editable-table custom-table-striped multi-level-head"
    >
      <colgroup>
        <col width={220} />
        <col width={140} />
        <col width={80} />
        <col width={80} />
        <col width={120} />
        <col width={120} />
        <col width={120} />
        <col width={140} />
      </colgroup>
      <thead className="border-0">
        <tr>
          <th>Name</th>
          <th>Orders #</th>
          <th>S#</th>
          <th>Size</th>
          <th>Shape</th>
          <th>Flavor</th>
          <th>Batch</th>
          <th>Baked</th>
        </tr>
      </thead>
      <tbody>
        <>
          <OrderOverviewModal
            show={orderOverviewModalShow}
            onHide={handleCloseModal}
            componenttype={componentType}
            handleChangeOrderInfo={handleChangeOrderInfo}
          />

          {isEmpty(checkBoxFilterOrders) ? (
            <tr className="bg-white">
              <td colSpan={8}>
                <NoData />
              </td>
            </tr>
          ) : (
            <>
              {/* None-Tiered */}

              <tr className="non-tiered">
                <th>{nonTiered}</th>
                <th>{`Sum: ${calculateOrderSum()}`}</th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th>{`Total: ${Number(
                  calculateOverAllBatchSum(checkBoxFilterOrders[nonTiered])
                ).toFixed(2)}`}</th>

                <th>{`${calculatePercentage(
                  checkBoxFilterOrders[nonTiered],
                  getDataOverAllBakedPerForNonTiered
                ).toFixed(2)}%`}</th>
              </tr>
              {!isEmpty(checkBoxFilterOrders[nonTiered]) &&
              !isEmptyNonTieredOrders(checkBoxFilterOrders[nonTiered]) ? (
                Object.entries(checkBoxFilterOrders[nonTiered]).map(
                  ([flavorType, flavorOrders]) => {
                    return (
                      !isEmptyFlavorOrders(flavorOrders) && (
                        <React.Fragment key={flavorType}>
                          <tr className="product-flavor">
                            <th>{flavorType}</th>
                            <th>{`Sum: ${calculateSumOrderForFlavour(
                              flavorOrders
                            )}`}</th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th>{`Total: ${Number(
                              calculateTotalBatchForFlavour(flavorOrders)
                            ).toFixed(2)}`}</th>
                            <th>{`${calculatePercentage(
                              flavorOrders,
                              getDataBakedPerForFlavour
                            ).toFixed(2)}%`}</th>
                          </tr>
                          {Object.entries(flavorOrders).map(
                            ([sizeType, sizeOrders]) => {
                              return (
                                <React.Fragment key={sizeType}>
                                  {Object.entries(sizeOrders).map(
                                    ([shapeType, shapeOrders]) => {
                                      return (
                                        <React.Fragment key={shapeType}>
                                          {!isEmptyShapeOrders(shapeOrders) && (
                                            <tr>
                                              <th>{`${sizeType}" ${flavorType} ${shapeType.toUpperCase()}`}</th>
                                              <th>
                                                Sum:{" "}
                                                {calculateTotalSum(shapeOrders)}
                                              </th>
                                              <th></th>
                                              <th></th>
                                              <th></th>
                                              <th></th>
                                              <th>
                                                Total:{" "}
                                                {Number(
                                                  calculateTotalBatch(
                                                    shapeOrders,
                                                    sizeType,
                                                    shapeType
                                                  )
                                                ).toFixed(2)}
                                              </th>
                                              <th>
                                                {`${calculatePercentage(
                                                  shapeOrders,
                                                  getDataBakedPerForShape
                                                ).toFixed(2)}%`}
                                              </th>
                                            </tr>
                                          )}
                                          {shapeOrders &&
                                            !isEmpty(shapeOrders) &&
                                            shapeOrders.map((order) => {
                                              return renderNonTieredOrders(
                                                order,
                                                sizeType,
                                                shapeType,
                                                flavorType
                                              );
                                            })}
                                        </React.Fragment>
                                      );
                                    }
                                  )}
                                </React.Fragment>
                              );
                            }
                          )}
                        </React.Fragment>
                      )
                    );
                  }
                )
              ) : (
                <tr>
                  <th colSpan={8} className="text-center">
                    No Non-Tiered cakes available
                  </th>
                </tr>
              )}

              {/* Tiered */}

              <tr className="tiered">
                <th>{tiered}</th>
                <th>{`Sum: ${
                  checkBoxFilterOrders[tiered]
                    ? checkBoxFilterOrders[tiered].length
                    : 0
                }`}</th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th>{`Total: ${Number(calculateBatchForTiered()).toFixed(
                  3
                )}`}</th>
                <th>{`${calculatePercentage(
                  checkBoxFilterOrders[tiered],
                  getDataOverAllBakedPerForTiered
                ).toFixed(2)}%`}</th>
              </tr>
              {!isEmpty(checkBoxFilterOrders[tiered]) &&
              !isEmptyTieredOrders(checkBoxFilterOrders[tiered]) ? (
                checkBoxFilterOrders[tiered].map((order) => (
                  <React.Fragment key={order.id}>
                    {!isEmptyfilteredOrders(order) &&
                      !isEmptyTieredOrdersForAllCakeItem(order) && (
                        <tr>
                          <th>
                            {order?.customer?.first_name +
                              " " +
                              order.customer?.last_name}
                          </th>
                          <th>{order?.local_id}</th>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th>Total: {calculateBatchByName(order?.items)}</th>
                          <th>{`${calculatePercentage(
                            order,
                            getDataBakedPerForTiered
                          ).toFixed(2)}%`}</th>
                        </tr>
                      )}
                    {order?.items.map((qtyItems) =>
                      qtyItems.map((item) => renderTieredItems(item, order))
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <th colSpan={8} className="text-center">
                    No Tiered cakes available
                  </th>
                </tr>
              )}
            </>
          )}
        </>
      </tbody>
    </Table>
  );
};

export default BakerList;
