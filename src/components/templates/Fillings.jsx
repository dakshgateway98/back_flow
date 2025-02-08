import _, { isEmpty } from "lodash";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setToken } from "../../api";
import { addBakerCalcApi, getAllBakerCalcByDateApi } from "../../api/bakerCalc";
import { getCalcSettingsApi } from "../../api/calcSettings";
import { getAppSettingByIDApi } from "../../api/settings";
import { displayErrorToast } from "../../global/displayToast";
import { getDiffOfDate, roundOf } from "../../global/helpers";
import { getBakerCalcSelection } from "../../redux/actions/bakerCalcSelectionActions";
import { getUpdatedCalcSetting } from "../../redux/actions/calcSettingsActions";
import { bakersCalcIds, orderToken, setting } from "../../utils/StaticData";
import CakeSpinner from "../common/CakeSpinner";
import Calculator from "../common/Calculator";

const Fillings = (props) => {
  const { orders, calenderDates, selectedPageID, currentTemplateId, onSave } =
    props;

  const { startDate, days, endDate } = calenderDates;
  const [selectFlavour, setSelectFlavour] = useState({});

  const { calcSettingsList } = useSelector((state) => state.calcSettings);
  const { bakerCalcSelectionList } = useSelector(
    (state) => state.bakerCalcSelection
  );
  const [doneData, setDoneData] = useState(null);
  const [allFlavour, setAllFlavour] = useState([]);
  const [fillingLoader, setFillingLoader] = useState(false);

  const dispatch = useDispatch();

  const getEndDate = useCallback(
    (date) => moment(date).subtract(1, "days").format("YYYY-MM-DD"),
    []
  );

  const checkWeekend = useCallback(
    (date1, date2) => {
      if (moment(date1).day() === 6 && moment(getEndDate(date2)).day() === 0) {
        return true;
      }
      return false;
    },
    [getEndDate]
  );

  const isWeekend = useMemo(
    () => checkWeekend(calenderDates.startDate, calenderDates.endDate),
    [calenderDates, checkWeekend]
  );
  const selectedPage = useMemo(() => {
    if (!isEmpty(bakerCalcSelectionList)) {
      const tempBakerCalcPage = bakerCalcSelectionList.find(
        (bakerCalcData) => bakerCalcData.id === selectedPageID
      );
      return tempBakerCalcPage;
    } else {
      return {};
    }
  }, [selectedPageID, bakerCalcSelectionList]);

  useEffect(() => {
    const getCategoryID = async () => {
      setFillingLoader(true);
      const res = await getAppSettingByIDApi(setting.bakers_calculator);
      if (res && res.success) {
        dispatch(getBakerCalcSelection(res?.data?.settings));
      }
    };
    if (isEmpty(bakerCalcSelectionList)) {
      getCategoryID();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPageID, bakerCalcSelectionList]);

  const getCalcSettings = async () => {
    setToken(orderToken);
    setFillingLoader(true);
    const res = await getCalcSettingsApi();
    if (res && res.success) {
      dispatch(getUpdatedCalcSetting(res?.data));
    }
  };

  //view baker_calc API
  useEffect(() => {
    const getBakerCalcData = async () => {
      setFillingLoader(true);
      if (+days === 1 || isWeekend) {
        const res = await getAllBakerCalcByDateApi(startDate, days);
        if (res && res.success) {
          setDoneData(res.data);
        }
      }
    };
    getBakerCalcData();
  }, [startDate, days, isWeekend]);

  useEffect(() => {
    if (currentTemplateId) {
      const diff = getDiffOfDate(
        moment(startDate).format("YYYY-MM-DD"),
        moment(endDate).format("YYYY-MM-DD")
      );

      if (diff > 2 && !isWeekend) {
        let date = moment(startDate);
        const updatedEndDate = date.clone().add(1, "days").format("YYYY-MM-DD");
        onSave(startDate, updatedEndDate);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTemplateId, startDate, endDate]);

  useEffect(() => {
    if (isEmpty(calcSettingsList)) {
      getCalcSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calcSettingsList]);

  const calculateDataFromReceipe = (recipe, recipeId) => {
    let sum = 0;
    recipe.forEach((rec) => {
      if (rec?.id === recipeId) {
        sum += rec.quantity;
      }
    });
    return sum;
  };

  const calculateDataFromModifiers = (item, recipeId) => {
    let sum = 0;
    if (item?.modifieritems) {
      item?.modifieritems.forEach((modifieritem) => {
        if (modifieritem.modifier?.recipe) {
          modifieritem.modifier?.recipe.forEach((rec) => {
            if (parseInt(rec?.ingredient_id) === recipeId) {
              sum += rec?.qty;
            }
          });
        }
      });
    }
    return sum;
  };

  const isSunday = useCallback(
    (orderDate) => {
      if (moment(orderDate).day() === 0 && +days === 2) {
        return true;
      }
      return false;
    },
    [days]
  );

  const addTimeWiseOrder = useCallback(
    (pickupTime, timeWiseOrder, orderDate, subPageId) => {
      let slotsData = {
        [`slot_12pm_${subPageId}`]: 0,
        [`slot_2pm_${subPageId}`]: 0,
        [`slot_9am_${subPageId}`]: 0,
        [`slot_sunday_${subPageId}`]: 0,
      };
      if (isSunday(orderDate)) {
        slotsData = {
          ...slotsData,
          [`slot_sunday_${subPageId}`]: timeWiseOrder,
        };
        return slotsData;
      } else {
        if (pickupTime > 0 && pickupTime < 12) {
          slotsData = {
            ...slotsData,
            [`slot_9am_${subPageId}`]: timeWiseOrder,
          };
        } else if (pickupTime >= 12 && pickupTime < 14) {
          slotsData = {
            ...slotsData,
            [`slot_12pm_${subPageId}`]: timeWiseOrder,
          };
        } else {
          slotsData = {
            ...slotsData,
            [`slot_2pm_${subPageId}`]: timeWiseOrder,
          };
        }
        return slotsData;
      }
    },

    [isSunday]
  );

  const getSimplifiedOrders = useCallback((ordersByObj) => {
    const result = Object.entries(ordersByObj).map(([orderDate, orderData]) => [
      orderDate,
      _.values(orderData.orders),
    ]);
    return result;
  }, []);

  const getupdatedItem = useCallback((orderDetail, categoriesId) => {
    const updatedItem = orderDetail?.items
      ? orderDetail?.items.filter((item) => {
          if (item?.cake_items) {
            let cakeItems = item?.cake_items.filter((cake_item) => {
              const check =
                categoriesId.includes(
                  (cake_item?.product?.category).toString()
                ) ||
                categoriesId.includes((item?.product?.category).toString());

              return check;
            });
            if (isEmpty(cakeItems)) {
              return false;
            } else {
              return true;
            }
          } else {
            const check = categoriesId.includes(
              (item?.product?.category).toString()
            );

            return check;
          }
        })
      : [];
    return updatedItem;
  }, []);

  const FilterDataForCupcakes = useCallback(
    (simplifiedOrders) => {
      const filtersOrderByCategory = simplifiedOrders.map(([date, orders]) => {
        const filteredOrders = orders.map((order) => {
          return {
            ...order,
            items: getupdatedItem(order, selectedPage?.content),
          };
        });
        const removedEmptyItemOrderfilteredOrders = filteredOrders.filter(
          (orderDetail) => !isEmpty(orderDetail?.items)
        );

        return [date, removedEmptyItemOrderfilteredOrders];
      });

      return filtersOrderByCategory;
    },
    [selectedPage, getupdatedItem]
  );

  const getFlavourCount = useCallback((item, flavorRecipeId) => {
    let flavourCount = 0;
    if (item?.product?.recipe && !isEmpty(item?.product?.recipe)) {
      flavourCount =
        item?.quantity *
        calculateDataFromReceipe(item?.product?.recipe, flavorRecipeId);
    } else {
      flavourCount =
        item?.quantity * calculateDataFromModifiers(item, flavorRecipeId);
    }
    return flavourCount;
  }, []);

  const handleFilteredOrders = useCallback(
    (orders, pageContent) => {
      const filteredOrders = orders.map((order) => {
        return {
          ...order,
          items: getupdatedItem(order, pageContent),
        };
      });
      return filteredOrders.filter(
        (orderDetail) => !isEmpty(orderDetail?.items)
      );
    },
    [getupdatedItem]
  );

  const handleFilterLargeAndMiniOrders = useCallback(
    (filteredCategoryOrder) => {
      const largeMiniSelectionList = bakerCalcSelectionList.filter(
        (bakerCalc) => bakerCalc.id !== bakersCalcIds.mixes
      );
      return largeMiniSelectionList.map((subPage) => {
        const page_ck_orders = filteredCategoryOrder.map(
          ([orderDate, orders]) => {
            const filteredOrders = handleFilteredOrders(
              orders,
              subPage?.content
            );
            return [orderDate, filteredOrders];
          }
        );
        return {
          subPageId: subPage.id,
          page_ck_orders,
        };
      });
    },
    [bakerCalcSelectionList, handleFilteredOrders]
  );

  const calculateOrder = useCallback(
    (filteredCategoryOrder, tempAllFlavour) => {
      let ck_pageOrderData = [
        {
          subPageId: selectedPage?.id,
          page_ck_orders: filteredCategoryOrder,
        },
      ];
      if (selectedPage?.id === bakersCalcIds.mixes) {
        ck_pageOrderData = handleFilterLargeAndMiniOrders(
          filteredCategoryOrder
        );
      }
      return tempAllFlavour.map((flavour) => {
        const ck_flavourQuantity = ck_pageOrderData.reduce(
          (pageAcc, pageData) => {
            const { subPageId } = pageData;
            const ck_pageQuantity = pageData?.page_ck_orders.reduce(
              (acc, [orderDate, orders]) => {
                return orders.reduce(
                  (orderAcc, order) => {
                    const pickupTime = moment(order?.pickup_time).format("HH");

                    return order?.items.reduce(
                      (itemAcc, item) => {
                        const flavourCount = getFlavourCount(
                          item,
                          flavour.recipe_id
                        );
                        const hours = addTimeWiseOrder(
                          parseInt(pickupTime),
                          flavourCount,
                          moment(orderDate).format("YYYY-M-DD"),
                          subPageId
                        );
                        return {
                          ...itemAcc,
                          ...(isWeekend && {
                            [`slot_sunday_${subPageId}`]:
                              (itemAcc[`slot_sunday_${subPageId}`] || 0) +
                              (hours[`slot_sunday_${subPageId}`] || 0),
                          }),
                          [`slot_12pm_${subPageId}`]:
                            (itemAcc[`slot_12pm_${subPageId}`] || 0) +
                            (hours[`slot_12pm_${subPageId}`] || 0),
                          [`slot_2pm_${subPageId}`]:
                            (itemAcc[`slot_2pm_${subPageId}`] || 0) +
                            (hours[`slot_2pm_${subPageId}`] || 0),
                          [`slot_9am_${subPageId}`]:
                            (itemAcc[`slot_9am_${subPageId}`] || 0) +
                            (hours[`slot_9am_${subPageId}`] || 0),
                        };
                      },
                      {
                        ...(orderAcc || {}),
                      }
                    );
                  },
                  {
                    ...(acc || {}),
                  }
                );
              },

              {
                ...(!isEmpty(pageAcc)
                  ? pageAcc
                  : {
                      [`slot_sunday_${bakersCalcIds.large}`]: 0,
                      [`slot_total_${bakersCalcIds.large}`]: 0,
                      [`slot_12pm_${bakersCalcIds.large}`]: 0,
                      [`slot_2pm_${bakersCalcIds.large}`]: 0,
                      [`slot_9am_${bakersCalcIds.large}`]: 0,
                      [`slot_sunday_${bakersCalcIds.mini}`]: 0,
                      [`slot_total_${bakersCalcIds.mini}`]: 0,
                      [`slot_12pm_${bakersCalcIds.mini}`]: 0,
                      [`slot_2pm_${bakersCalcIds.mini}`]: 0,
                      [`slot_9am_${bakersCalcIds.mini}`]: 0,
                    }),
              }
            );
            return { ...pageAcc, ...ck_pageQuantity };
          },
          {}
        );

        return {
          ...flavour,
          ...ck_flavourQuantity,
        };
      });
    },
    [
      addTimeWiseOrder,
      getFlavourCount,
      handleFilterLargeAndMiniOrders,
      isWeekend,
      selectedPage,
    ]
  );

  const handleWalkinAmount = useCallback(
    (flavours) => {
      const large_id = bakersCalcIds.large;
      const mini_id = bakersCalcIds.mini;

      const ck_category = selectedPage.title.split(" ")[0].toLowerCase();
      let walkinKey = "";
      if (moment(startDate).day() === 6 || moment(startDate).day() === 0) {
        walkinKey = `${ck_category}_cc_weekend_walkin`;
      } else {
        walkinKey = `${ck_category}_cc_weekday_walkin`;
      }
      const updatedFlavours = flavours.map((flavour) => {
        let slotWiseWalkingAmt = flavour[walkinKey] / 3;
        let temp_slot_2pm = flavour[`slot_2pm_${selectedPage?.id}`];
        let temp_slot_12pm = flavour[`slot_12pm_${selectedPage?.id}`];
        let temp_slot_9am = flavour[`slot_9am_${selectedPage?.id}`];
        let temp_slot_sunday = flavour[`slot_sunday_${selectedPage?.id}`];
        if (selectedPage.id === bakersCalcIds.mixes) {
          if (moment(startDate).day() === 6 || moment(startDate).day() === 0) {
            slotWiseWalkingAmt =
              flavour?.large_cc_weekend_walkin / 3 / flavour?.large_cc_batch +
              flavour?.mini_cc_weekend_walkin / 3 / flavour?.mini_cc_batch;
          } else {
            slotWiseWalkingAmt =
              flavour?.large_cc_weekday_walkin / 3 / flavour?.large_cc_batch +
              flavour?.mini_cc_weekday_walkin / 3 / flavour?.mini_cc_batch;
          }

          temp_slot_2pm =
            flavour[`slot_2pm_${large_id}`] / flavour?.large_cc_batch +
            flavour[`slot_2pm_${mini_id}`] / flavour?.mini_cc_batch;

          temp_slot_12pm =
            flavour[`slot_12pm_${large_id}`] / flavour?.large_cc_batch +
            flavour[`slot_12pm_${mini_id}`] / flavour?.mini_cc_batch;

          temp_slot_9am =
            flavour[`slot_9am_${large_id}`] / flavour?.large_cc_batch +
            flavour[`slot_9am_${mini_id}`] / flavour?.mini_cc_batch;
          temp_slot_sunday =
            flavour[`slot_sunday_${large_id}`] / flavour?.large_cc_batch +
            flavour[`slot_sunday_${mini_id}`] / flavour?.mini_cc_batch;
        }

        const updatedFlavourData = {
          slot_2pm: roundOf(temp_slot_2pm + slotWiseWalkingAmt),
          slot_9am: roundOf(temp_slot_9am + slotWiseWalkingAmt),
          slot_12pm: roundOf(temp_slot_12pm + slotWiseWalkingAmt),
          ...(isWeekend && {
            sunday: parseInt(days) === 2 ? roundOf(temp_slot_sunday) : 0,
          }),
        };
        const FlavourDataWithTotal = {
          ...updatedFlavourData,
          total: roundOf(
            updatedFlavourData.slot_12pm +
              updatedFlavourData.slot_2pm +
              updatedFlavourData.slot_9am +
              (isWeekend ? updatedFlavourData.sunday : 0)
          ),
        };

        return {
          ...flavour,
          ...FlavourDataWithTotal,
        };
      });

      return updatedFlavours;
    },
    [selectedPage, days, startDate, isWeekend]
  );
  const calulatedDoneSlots = (totalDone, max_slot) => {
    let done = totalDone;
    let done_slot = 0;
    if (done >= max_slot) {
      done_slot = max_slot;
      done -= max_slot;
    } else {
      done_slot = done;
      done = 0;
    }
    return [done_slot, done];
  };
  const handleDoneDataQauntity = useCallback(
    (falvours, updatedDoneData) => {
      const requiredDoneData = updatedDoneData || doneData;
      const updatedFlavours = falvours.map((flavour) => {
        if (
          !isEmpty(requiredDoneData) &&
          requiredDoneData[startDate] &&
          requiredDoneData[startDate][selectedPage?.id] &&
          requiredDoneData[startDate][selectedPage?.id][flavour.id]
        ) {
          let total_done =
            requiredDoneData[startDate][selectedPage?.id][flavour.id];

          if (total_done < 0) {
            total_done = 0;
          }

          if (flavour.id === selectFlavour.id) {
            setSelectFlavour((previous) => {
              return {
                ...previous,
                total_done: total_done,
              };
            });
          }
          const [done_9am, done_after_9am] = calulatedDoneSlots(
            total_done,
            flavour?.slot_9am
          );
          const [done_12pm, done_after_12pm] = calulatedDoneSlots(
            done_after_9am,
            flavour?.slot_12pm
          );
          const [done_2pm, done_after_2pm] = calulatedDoneSlots(
            done_after_12pm,
            flavour?.slot_2pm
          );

          let sunday_done = 0;
          if (isWeekend) {
            // eslint-disable-next-line no-unused-vars
            const [temp_done_sunday, done_after_sunday] = calulatedDoneSlots(
              done_after_2pm,
              flavour?.sunday
            );

            sunday_done = temp_done_sunday;
          }
          return {
            ...flavour,
            slot_9am_done: roundOf(done_9am),
            slot_12pm_done: roundOf(done_12pm),
            slot_2pm_done: roundOf(done_2pm),
            ...(isWeekend && { sunday_done: roundOf(sunday_done) }),
            count: roundOf(flavour.total - total_done),
            total_done: roundOf(total_done),
          };
        }

        return {
          ...flavour,
          slot_9am_done: flavour?.slot_9am_done || 0,
          slot_12pm_done: flavour?.slot_12pm_done || 0,
          slot_2pm_done: flavour?.slot_2pm_done || 0,
          ...(isWeekend && { sunday_done: flavour?.sunday_done || 0 }),
          count: flavour?.count || flavour.total,
          total_done: flavour?.total_done || 0,
        };
      });

      return updatedFlavours;
    },
    [selectedPage, doneData, selectFlavour.id, isWeekend, startDate]
  );

  useEffect(() => {
    if (
      !isEmpty(calcSettingsList) &&
      !isEmpty(orders) &&
      !isEmpty(selectedPage) &&
      doneData !== null
    ) {
      const SimplifiedOrder = getSimplifiedOrders(orders);
      const filteredCategoryOrder = FilterDataForCupcakes(SimplifiedOrder);
      const calculatedFlavourCount = calculateOrder(
        filteredCategoryOrder,
        calcSettingsList
      );
      const calulatedWalkinAmount = handleWalkinAmount(calculatedFlavourCount);
      const flavourWithDoneData = handleDoneDataQauntity(calulatedWalkinAmount);
      setFillingLoader(false);

      setAllFlavour([...flavourWithDoneData]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, calcSettingsList, selectedPage, doneData]);

  const handleAddCalcResult = async (calcResult) => {
    const totalQuantity = selectFlavour?.total_done + calcResult;
    if (selectFlavour?.id) {
      if (totalQuantity >= 0) {
        const postData = {
          date: startDate,
          cat_id: selectedPage?.id,
          flavor: selectFlavour?.id,
          quantity: totalQuantity,
        };

        const res = await addBakerCalcApi(postData);
        if (res && res.success) {
          setDoneData((previous) => {
            if (previous[startDate]) {
              return {
                ...previous,
                [startDate]: {
                  ...previous[startDate],
                  [selectedPage?.id]: {
                    ...previous[startDate][selectedPage?.id],
                    ...res?.data[startDate][selectedPage?.id],
                  },
                },
              };
            } else {
              return {
                ...previous,
                ...res.data,
              };
            }
          });
          setSelectFlavour({});
        }
      } else {
        displayErrorToast(
          "Please subtract number less or equal to current quantity",
          3000
        );
      }
    } else {
      displayErrorToast(
        "Please select flavor before adding or subtracting",
        3000
      );
    }
  };

  const handleSelectedFlavour = (flavour) => {
    setSelectFlavour((prev) => {
      if (prev.id === flavour.id) {
        return {};
      }
      return flavour;
    });
  };

  const isEverySlotsDone = (flavour) =>
    flavour?.slot_2pm === flavour?.slot_2pm_done &&
    flavour?.slot_12pm === flavour?.slot_12pm_done &&
    flavour?.slot_9am === flavour?.slot_9am_done &&
    (isWeekend ? flavour?.sunday === flavour?.sunday_done : true);

  const handleSort = (flavoursData) => {
    flavoursData.sort((a, b) => {
      if (a.sort !== b.sort) return a.sort - b.sort;
      else
        return a.flavor
          .replace(/\s/g, "")
          .localeCompare(b.flavor.replace(/\s/g, ""));
    });
    return flavoursData;
  };

  const returnTitle = () => {
    if (selectedPageID === bakersCalcIds.large) {
      return "Large Cupcakes";
    } else if (selectedPageID === bakersCalcIds.mini) {
      return "Mini Cupcakes";
    } else {
      return "Mixes";
    }
  };

  const handleToGiveBackGroundColor = () => {
    if (selectedPageID === bakersCalcIds.large) {
      return "bg-large";
    } else if (selectedPageID === bakersCalcIds.mini) {
      return "bg-mini";
    } else {
      return "bg-mix";
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap">
        {fillingLoader ? (
          <div className="w-50 d-flex justify-content-center">
            <CakeSpinner />
          </div>
        ) : (
          <div className="tableSize ">
            <section className="py-2 overflow-auto">
              <table>
                <colgroup>
                  <col width={250} />
                  {isWeekend ? <col width={520} /> : <col width={390} />}
                  <col width={70} />
                </colgroup>
                <tbody className="grid-table-body">
                  <tr>
                    <td>
                      <table className="cat-grid grid-table-striped border-0 filling_table">
                        <colgroup>
                          <col width={180} />
                          <col width={60} />
                        </colgroup>
                        <tbody className="grid-table-body ">
                          <tr>
                            <th>&nbsp;</th>
                          </tr>
                          <tr></tr>
                          <tr>
                            <th
                              className={`headerCellStyle ${handleToGiveBackGroundColor()} `}
                            >
                              {returnTitle()}
                            </th>
                            <th className="p-1 border border-dark text-center">
                              Total
                            </th>
                          </tr>

                          {!isEmpty(allFlavour) &&
                            handleSort([...allFlavour]).map((flavour) => (
                              <tr key={flavour?.id}>
                                <td
                                  className={`${
                                    selectFlavour.id === flavour?.id
                                      ? "flavour"
                                      : "border border-dark"
                                  }
                               
                                  ${
                                    isEverySlotsDone(flavour)
                                      ? "order-done"
                                      : ""
                                  }
                                 `}
                                >
                                  <button
                                    className="filling_btn border-box-right fw-bold mx-1"
                                    onClick={() =>
                                      handleSelectedFlavour(flavour)
                                    }
                                    value={flavour?.id}
                                  >
                                    {flavour?.flavor}
                                  </button>
                                </td>
                                <td
                                  className={`p-1 border border-dark text-center ${
                                    isEverySlotsDone(flavour)
                                      ? "order-done"
                                      : ""
                                  }`}
                                >
                                  {flavour?.total.toFixed(1)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </td>
                    <td>
                      <table className="text-center">
                        <colgroup>
                          <col width={130} />
                          <col width={130} />
                          <col width={130} />
                          {isWeekend && <col width={130} />}
                        </colgroup>
                        <tbody className="grid-table-body">
                          <tr>
                            <td className="px-2">
                              <table className="table-bordered cat-grid grid-table-striped filling_table">
                                <colgroup>
                                  <col width={60} />
                                  <col width={60} />
                                </colgroup>
                                <tbody className="grid-table-body ">
                                  <tr>
                                    <th colSpan="2" className="border-0">
                                      9 am
                                    </th>
                                  </tr>
                                  <tr></tr>
                                  <tr>
                                    <th className="border border-dark">
                                      Order
                                    </th>
                                    <th className="p-1 border border-dark">
                                      Done
                                    </th>
                                  </tr>

                                  {!isEmpty(allFlavour) &&
                                    handleSort([...allFlavour]).map(
                                      (flavour) => (
                                        <tr key={flavour?.id}>
                                          <td
                                            className={`border border-dark  ${
                                              flavour?.slot_9am ===
                                              flavour?.slot_9am_done
                                                ? "order-done"
                                                : ""
                                            }`}
                                          >
                                            {flavour?.slot_9am}
                                          </td>
                                          <td
                                            className={`p-1 border border-dark ${
                                              flavour?.slot_9am ===
                                              flavour?.slot_9am_done
                                                ? "order-done"
                                                : ""
                                            }`}
                                          >
                                            {flavour?.slot_9am_done}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                </tbody>
                              </table>
                            </td>

                            <td className="px-2">
                              <table className="table-bordered cat-grid grid-table-striped filling_table">
                                <colgroup>
                                  <col width={60} />
                                  <col width={60} />
                                </colgroup>
                                <tbody className="grid-table-body">
                                  <tr>
                                    <th colSpan="2" className="border-0">
                                      12 pm
                                    </th>
                                  </tr>
                                  <tr></tr>
                                  <tr>
                                    <td className="border border-dark">
                                      Order
                                    </td>
                                    <td className="p-1 border border-dark">
                                      Done
                                    </td>
                                  </tr>
                                  {!isEmpty(allFlavour) &&
                                    handleSort([...allFlavour]).map(
                                      (flavour) => (
                                        <tr key={flavour?.id}>
                                          <td
                                            className={`border border-dark ${
                                              flavour?.slot_12pm ===
                                              flavour?.slot_12pm_done
                                                ? "order-done"
                                                : ""
                                            }`}
                                          >
                                            {flavour?.slot_12pm}
                                          </td>
                                          <td
                                            className={`p-1 border border-dark ${
                                              flavour?.slot_12pm ===
                                              flavour?.slot_12pm_done
                                                ? "order-done"
                                                : ""
                                            }`}
                                          >
                                            {flavour?.slot_12pm_done}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                </tbody>
                              </table>
                            </td>

                            <td className="px-2">
                              <table className="table-bordered cat-grid grid-table-striped filling_table">
                                <colgroup>
                                  <col width={60} />
                                  <col width={60} />
                                </colgroup>
                                <tbody className="grid-table-body">
                                  <tr>
                                    <th colSpan="2" className="border-0">
                                      2 pm
                                    </th>
                                  </tr>
                                  <tr></tr>
                                  <tr>
                                    <td className="border border-dark">
                                      Order
                                    </td>
                                    <td className="p-1 border border-dark">
                                      Done
                                    </td>
                                  </tr>
                                  {!isEmpty(allFlavour) &&
                                    handleSort([...allFlavour]).map(
                                      (flavour) => (
                                        <tr key={flavour?.id}>
                                          <td
                                            className={`border border-dark ${
                                              flavour?.slot_2pm ===
                                              flavour?.slot_2pm_done
                                                ? "order-done"
                                                : ""
                                            } `}
                                          >
                                            {flavour?.slot_2pm}
                                          </td>
                                          <td
                                            className={`p-1 border border-dark ${
                                              flavour?.slot_2pm ===
                                              flavour?.slot_2pm_done
                                                ? "order-done"
                                                : ""
                                            } `}
                                          >
                                            {flavour?.slot_2pm_done}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                </tbody>
                              </table>
                            </td>

                            {isWeekend && (
                              <td className="px-2">
                                <table className="table-bordered cat-grid grid-table-striped filling_table">
                                  <colgroup>
                                    <col width={60} />
                                    <col width={60} />
                                  </colgroup>
                                  <tbody className="grid-table-body">
                                    <tr>
                                      <th colSpan="2" className="border-0">
                                        Sunday
                                      </th>
                                    </tr>
                                    <tr></tr>
                                    <tr>
                                      <td className="border border-dark">
                                        Order
                                      </td>
                                      <td className="p-1 border border-dark">
                                        Done
                                      </td>
                                    </tr>
                                    {!isEmpty(allFlavour) &&
                                      handleSort([...allFlavour]).map(
                                        (flavour) => (
                                          <tr key={flavour?.id}>
                                            <td
                                              className={`border border-dark ${
                                                flavour?.sunday ===
                                                flavour?.sunday_done
                                                  ? "order-done"
                                                  : ""
                                              }`}
                                            >
                                              {flavour?.sunday}
                                            </td>
                                            <td
                                              className={`p-1 border border-dark ${
                                                flavour?.sunday ===
                                                flavour?.sunday_done
                                                  ? "order-done"
                                                  : ""
                                              }`}
                                            >
                                              {flavour?.sunday_done}
                                            </td>
                                          </tr>
                                        )
                                      )}
                                  </tbody>
                                </table>
                              </td>
                            )}
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td className=" px-2 text-center">
                      <table className="table-bordered cat-grid grid-table-striped filling_table">
                        <colgroup>
                          <col width={60} />
                        </colgroup>
                        <tbody className="grid-table-body ">
                          <tr>
                            <th className="border-0">&nbsp;</th>
                          </tr>
                          <tr></tr>
                          <tr>
                            <th className="p-1 border border-dark">Count</th>
                          </tr>
                          {!isEmpty(allFlavour) &&
                            handleSort([...allFlavour]).map((flavour) => (
                              <tr key={flavour?.id}>
                                <td
                                  className={`p-1 border border-dark ${
                                    isEverySlotsDone(flavour)
                                      ? "order-done"
                                      : ""
                                  }`}
                                >
                                  <div>{flavour?.count}</div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
            <div
              className={`labelStyle ${handleToGiveBackGroundColor()}`}
              style={{ width: "100%" }}
            >
              <label className="p-2"> {returnTitle()}</label>
            </div>
          </div>
        )}

        <div className="pt-4">
          <Calculator
            selectedFlavour={selectFlavour}
            handleAddCalcResult={handleAddCalcResult}
          />
        </div>
      </div>
    </>
  );
};

export default Fillings;
