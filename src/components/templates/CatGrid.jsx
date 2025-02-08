import { isEmpty } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToken } from "../../api";
import { getAllModifierAPI } from "../../api/multiplier";
import { updateMultiplier } from "../../redux/actions/multiplierActions";
import { setting } from "../../utils/StaticData";
import NoData from "../common/NoData";

const weekDays = [1, 2, 3, 4, 5, 6, 7];

const CatGrid = (props) => {
  const {
    orders,
    onSave,
    calenderDates,
    currentTemplateId,
    allSubPagesConfig,
    selectedPageID,
  } = props;

  const { startDate, days } = calenderDates;
  const { token } = useSelector((state) => state.user);
  const [allSubPages, setAllSubPages] = useState([]);
  const { multiplierList } = useSelector((state) => state.multiplier);
  const dispatch = useDispatch();

  const getAllSubPages = () => {
    const filteredData = allSubPagesConfig.filter(
      (data) => parseInt(data?.page_id) === parseInt(selectedPageID)
    );
    const updatedData = filteredData.map((data) => {
      return {
        ...data,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
      };
    });

    setAllSubPages(updatedData);
    return [...updatedData];
  };

  const existID = (arr, ID) => {
    const selectedId = arr.filter((arrId) => parseInt(arrId) === parseInt(ID));
    if (selectedId && selectedId.length > 0) {
      return true;
    }
    return false;
  };

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

  const getDataFromRecipeArray = (recipe, recipeId) => {
    if (recipe) {
      let sum = 0;
      recipe.forEach((rec) => {
        if (parseInt(rec?.id) === parseInt(recipeId)) {
          sum += rec.quantity;
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

  const FilterDataForGrid = (pageData) => {
    if (
      !isEmpty(orders) &&
      !isEmpty(pageData) &&
      Object.keys(orders).length === 7
    ) {
      const tempSubPages = [...pageData];
      tempSubPages.forEach((subPage) => {
        let count = 1;
        Object.entries(orders).forEach(([orderDate, orderData]) => {
          let sum = 0;

          Object.entries(orderData.orders).forEach(([orderId, orderDetail]) => {
            orderDetail?.items.forEach((item) => {
              // if (existID(subPage?.revel_ids, item?.product?.id)) {
              if (item?.cake_items && !isEmpty(item?.cake_items)) {
                item?.cake_items.forEach((cake_item) => {
                  if (
                    existID(subPage?.revel_ids, cake_item?.product?.id) ||
                    existID(subPage?.revel_ids, item?.product?.id)
                  ) {
                    if (subPage?.recipe && subPage?.recipe_id.toString()) {
                      // check if recipe array exist in cake_item product
                      sum +=
                        (cake_item?.quantity *
                          (cake_item?.product?.recipe &&
                          !isEmpty(cake_item?.product?.recipe)
                            ? getDataFromRecipeArray(
                                cake_item?.product?.recipe,
                                subPage?.recipe_id
                              )
                            : getModifierRecipeQuantity(
                                cake_item?.modifieritems,
                                subPage?.recipe_id
                              )) *
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
                    // check if recipe array exist in product
                    sum +=
                      (item?.quantity *
                        (item?.product?.recipe &&
                        !isEmpty(item?.product?.recipe)
                          ? getDataFromRecipeArray(
                              item?.product?.recipe,
                              subPage?.recipe_id
                            )
                          : getModifierRecipeQuantity(
                              item?.modifieritems,
                              subPage?.recipe_id
                            )) *
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
              // }
            });
          });
          subPage[count] = sum;

          count += 1;
        });
      });

      setAllSubPages([...tempSubPages]);
    }
  };

  const handleSumForSigleDay = (key) => {
    const allSubPagesData = [...allSubPages];
    let sum = 0;
    allSubPagesData.forEach((subpage) => {
      sum += subpage[key];
    });
    return sum;
  };

  useEffect(() => {
    if (currentTemplateId) {
      if (parseInt(days) !== 7) {
        let date = moment(startDate);
        const day = date.clone().day();
        if (day === 0 || day === 1) {
          date = date.clone().subtract(3, "days");
        }
        const updatedStartDate = date
          .clone()
          .startOf("week")
          .add(2, "days")
          .format("YYYY-MM-DD");
        const endDate = date
          .clone()
          .endOf("week")
          .add(3, "days")
          .format("YYYY-MM-DD");
        onSave(updatedStartDate, endDate);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTemplateId, days]);

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
      if (!isEmpty(allSubPagesConfig)) {
        const pageData = getAllSubPages();
        FilterDataForGrid(pageData);
        if (isEmpty(multiplierList)) {
          await getAllMultiplierData();
        }
      }
    };
    defaultUseEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, multiplierList]);

  const calculateTotalSum = () =>
    weekDays.reduce((a, day) => a + handleSumForSigleDay(day), 0);

  if (allSubPages && allSubPages.length > 0) {
    return (
      <Table responsive className="cat-grid table-bordered grid-table-striped">
        <tbody className="grid-table-body">
          <tr>
            <th className="fw-bold"></th>
            <th className="fw-bold">Tue</th>
            <th className="fw-bold">Wed</th>
            <th className="fw-bold">Thu</th>
            <th className="fw-bold">Fri</th>
            <th className="fw-bold">Sat</th>
            <th className="fw-bold">Sun</th>
            <th className="fw-bold">Mon</th>
            <th className="fw-bold highlight-primary">Total</th>
            <th className="fw-bold">Done</th>
            <th className="fw-bold highlight-purple">left</th>
            <th className="fw-bold">5 wk avg</th>
            <th className="fw-bold">Up/Down Avg</th>
          </tr>
          {allSubPages &&
            allSubPages.length > 0 &&
            allSubPages.map((item) => (
              <tr key={item?.id}>
                <td className="border-box-right fw-bold"> {item?.name}</td>
                <td className="border-box">
                  <span> {Number(item[1]).toFixed(2)}</span>
                </td>
                <td className="border-box">
                  <span> {Number(item[2]).toFixed(2)}</span>
                </td>
                <td className="border-box">
                  <span> {Number(item[3]).toFixed(2)}</span>
                </td>
                <td className="border-box">
                  <span> {Number(item[4]).toFixed(2)}</span>
                </td>
                <td className="border-box">
                  <span> {Number(item[5]).toFixed(2)}</span>
                </td>
                <td className="border-box">
                  <span>{Number(item[6]).toFixed(2)}</span>
                </td>
                <td className="border-box">
                  <span>{Number(item[7]).toFixed(2)}</span>
                </td>
                <td className="border-box fw-bold highlight-primary">
                  <span>
                    {Number(
                      item[1] +
                        item[2] +
                        item[3] +
                        item[4] +
                        item[5] +
                        item[6] +
                        item[7]
                    ).toFixed(2)}
                  </span>
                </td>
                <td className="border-box">
                  <span>26</span>
                </td>
                <td className="border-box highlight-purple">
                  <span>0</span>
                </td>
                <td className="border-box">
                  <span>32</span>
                </td>
                <td className="border-box text-success">
                  <span>10%</span>
                </td>
              </tr>
            ))}
          <tr>
            <td className="border-box-right fw-bold highlight-primary">
              Total
            </td>
            {weekDays.map((day) => (
              <td className="border-box fw-bold highlight-primary" key={day}>
                <span>{Number(handleSumForSigleDay(day)).toFixed(2)}</span>
              </td>
            ))}

            <td className="border-box fw-bold highlight-primary">
              <span>{calculateTotalSum().toFixed(2)}</span>
            </td>
          </tr>

          <tr>
            <td className="border-box-right fw-bold">Done</td>
            <td className="border-box  ">
              <span>{1}</span>
            </td>
            <td className="border-box  ">
              <span>{2}</span>
            </td>
            <td className="border-box  ">
              <span>{3}</span>
            </td>
            <td className="border-box  ">
              <span>{4}</span>
            </td>
            <td className="border-box  ">
              <span>{5}</span>
            </td>
            <td className="border-box  ">
              <span>{6}</span>
            </td>
            <td className="border-box  ">
              <span>{7}</span>
            </td>
            <td className="border-box  ">
              <span>{1 + 2 + 3 + 4 + 5 + 6 + 7}</span>
            </td>
            {/* <td className="">
              <span></span>
            </td>
            <td className="">
              <span></span>
            </td>
            <td className="">
              <span></span>
            </td>
            <td className="">
              <span></span>
            </td> */}
          </tr>

          <tr>
            <td className="border-box-right fw-bold highlight-purple">Left</td>
            <td className="border-box highlight-purple">
              <span>{1}</span>
            </td>
            <td className="border-box highlight-purple">
              <span>{2}</span>
            </td>
            <td className="border-box highlight-purple">
              <span>{3}</span>
            </td>
            <td className="border-box highlight-purple">
              <span>{4}</span>
            </td>
            <td className="border-box highlight-purple">
              <span>{5}</span>
            </td>
            <td className="border-box highlight-purple">
              <span>{6}</span>
            </td>
            <td className="border-box highlight-purple">
              <span>{7}</span>
            </td>
            <td className="border-box highlight-purple">
              <span>{1 + 2 + 3 + 4 + 5 + 6 + 7}</span>
            </td>
          </tr>

          <tr>
            <td className="border-box-right fw-bold">5 Week Avg</td>
            <td className="border-box  ">
              <span>{1}</span>
            </td>
            <td className="border-box  ">
              <span>{2}</span>
            </td>
            <td className="border-box  ">
              <span>{3}</span>
            </td>
            <td className="border-box  ">
              <span>{4}</span>
            </td>
            <td className="border-box  ">
              <span>{5}</span>
            </td>
            <td className="border-box  ">
              <span>{6}</span>
            </td>
            <td className="border-box  ">
              <span>{7}</span>
            </td>
            <td className="border-box  ">
              <span>{1 + 2 + 3 + 4 + 5 + 6 + 7}</span>
            </td>
          </tr>

          <tr>
            <td className="border-box-right fw-bold">Up/Down Avg</td>
            <td className="border-box text-success">
              <span>20 %</span>
            </td>
            <td className="border-box text-danger">
              <span>-10 %</span>
            </td>
            <td className="border-box text-success">
              <span>20 %</span>
            </td>
            <td className="border-box text-danger">
              <span>-10 %</span>
            </td>
            <td className="border-box text-success">
              <span>20 %</span>
            </td>
            <td className="border-box text-danger">
              <span>-10 %</span>
            </td>
            <td className="border-box text-success">
              <span>20 %</span>
            </td>
            <td className="border-box text-danger">
              <span>-10 %</span>
            </td>
          </tr>
        </tbody>
      </Table>
    );
  } else {
    return (
      <Table responsive className="cat-grid table-bordered">
        <tbody>
          <tr>
            <td colSpan={4}>
              <NoData />
            </td>
          </tr>
        </tbody>
      </Table>
    );
  }
};

export default CatGrid;
