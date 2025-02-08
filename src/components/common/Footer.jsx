import React from "react";
import { ExitIcon } from "./icons";
import { Link, useNavigate } from "react-router-dom";
import { connect, useSelector } from "react-redux";
import { logout } from "../../redux/actions/userActions";
import { routesConstant } from "../../routes/routeConstant";
import userIcon from "../../assets/icons/user.svg";
import { dateToMMDDYYYY, getUpdatedId, spliceDate } from "../../global/helpers";
import { displayInfoToast } from "../../global/displayToast";
import { useEffect } from "react";
import { useState } from "react";
import { pageId, phasesId } from "../../utils/StaticData";
import { isEmpty } from "lodash";
import ProgressBar from "react-bootstrap/ProgressBar";

const Footer = (props) => {
  const { ordersByDate, itemInfo, selectedPageID } = props;
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [footerData, setFooterData] = useState({});

  const isCalculateValueForQuantityWiseData = () => {
    if (
      selectedPageID === pageId?.baker ||
      selectedPageID === pageId?.decorator ||
      selectedPageID === pageId?.production
    ) {
      return true;
    }
    return false;
  };

  const getItemsId = (items) => {
    let itemsId = [];
    items.forEach((item) => {
      if (item.cake_items) {
        item.cake_items.forEach((cakeItem) => {
          if (isCalculateValueForQuantityWiseData()) {
            for (let i = 0; i < cakeItem?.quantity; i++) {
              itemsId.push(getUpdatedId(cakeItem?.id, i));
            }
          } else {
            itemsId.push(cakeItem.id);
          }
        });
      } else {
        if (isCalculateValueForQuantityWiseData()) {
          for (let i = 0; i < item?.quantity; i++) {
            itemsId.push(getUpdatedId(item?.id, i));
          }
        } else {
          itemsId.push(item.id);
        }
      }
    });
    return itemsId;
  };

  // const getItemCountQtyWise = (item) => {
  //   const value = Array.from(
  //     { length: item?.quantity },
  //     (_, index) => index
  //   ).reduce((acc) => {
  //     // return (acc = acc + item?.product?.app_info?.ck_piece_cnt);
  //     return (acc = acc + 1);
  //   }, 0);
  //   return value;
  // };

  const getItemCount = (items) => {
    const itemsCount = items.reduce((acc, item) => {
      if (item?.cake_items) {
        return item.cake_items.reduce((acc, cakeItem) => {
          const appInfo = cakeItem?.product?.app_info;
          if (
            selectedPageID === pageId.baker ||
            selectedPageID === pageId.production
          ) {
            return (acc =
              acc +
              (appInfo.ck_build === "dl" ? 2 : 1) *
                (cakeItem?.expanded_quantity || cakeItem.quantity));
          }
          return (acc =
            acc + (cakeItem?.expanded_quantity || cakeItem?.quantity));
        }, 0);
      } else {
        const appInfo = item?.product?.app_info;
        if (selectedPageID === pageId.baker) {
          return (acc =
            acc +
            (appInfo.ck_build === "dl" ? 2 : 1) *
              (item?.expanded_quantity || item.quantity));
        } else if (selectedPageID === pageId.production) {
          return (acc =
            acc +
            (appInfo.ck_build === "dl" || appInfo.ck_piece_cnt === 2 ? 2 : 1) *
              (item?.expanded_quantity || item.quantity));
        } else {
          return (acc = acc + (item?.expanded_quantity || item.quantity));
        }
      }
    }, 0);
    return itemsCount;
  };

  const getPhase = (isItem) => {
    if (selectedPageID === pageId.baker) {
      return phasesId?.baked;
    } else if (selectedPageID === pageId.production) {
      return phasesId?.cakeAssembled;
    } else {
      return isItem ? phasesId.completed : phasesId?.boxed;
    }
  };

  const checkCompleteOrder = (items) => {
    const itemIds = getItemsId(items);
    const isCompleted = itemIds.every((itemId) => {
      const check =
        itemInfo[itemId] && itemInfo[itemId]?.item_phase >= getPhase(false);
      return check;
    });
    if (isCompleted) {
      return 1;
    }
    return 0;
  };

  const handleLogout = () => {
    props.logout();
    navigate(routesConstant.LOGIN);
    displayInfoToast("Logout Successful !");
  };

  let fullName = "";
  if (user && user.data) {
    const { first_name, last_name } = user.data;
    fullName = first_name + " " + last_name.charAt(0) + ".";
  }

  const isItemCompleted = (itemID) => {
    if (
      selectedPageID === pageId.baker ||
      selectedPageID === pageId.production
    ) {
      if (itemInfo[itemID] && itemInfo[itemID].completed_phases) {
        const completedPhases = itemInfo[itemID].completed_phases;
        return Object.values(completedPhases).reduce(
          (acc, layer) => (layer[getPhase(true)] ? ++acc : acc),
          0
        );
      }
    }
    if (itemInfo[itemID] && itemInfo[itemID].item_phase >= getPhase(true)) {
      return 1;
    }
    return 0;
  };

  const checkCompletedItem = (item) => {
    if (item?.cake_items) {
      return item?.cake_items.reduce((acc, cakeItem) => {
        if (isCalculateValueForQuantityWiseData()) {
          const value = Array.from(
            { length: cakeItem?.quantity },
            (_, index) => index
          ).reduce(
            (qtyAcc, index) => {
              return {
                productionHour:
                  (qtyAcc.productionHour || 0) +
                  (isItemCompleted(getUpdatedId(cakeItem.id, index))
                    ? cakeItem?.product?.app_info?.ck_prod_time
                    : 0),

                designHour:
                  (qtyAcc.designHour || 0) +
                  (isItemCompleted(getUpdatedId(cakeItem.id, index))
                    ? cakeItem?.product?.app_info?.ck_design_time
                    : 0),

                completed:
                  (qtyAcc.completed || 0) +
                  isItemCompleted(getUpdatedId(cakeItem.id, index)),
              };
            },
            { ...(acc || { productionHour: 0, designHour: 0, completed: 0 }) }
          );
          return value;
        } else {
          return {
            productionHour:
              (acc.productionHour || 0) +
              (isItemCompleted(cakeItem.id)
                ? cakeItem?.product?.app_info?.ck_prod_time
                : 0),

            designHour:
              (acc.designHour || 0) +
              (isItemCompleted(cakeItem.id)
                ? cakeItem?.product?.app_info?.ck_design_time
                : 0),

            completed:
              (acc.completed || 0) +
              isItemCompleted(cakeItem.id) *
                (cakeItem?.expanded_quantity || cakeItem?.quantity),
          };
        }
      }, {});

      //  else {
      //   return {
      //     productionHour: item?.cake_items.reduce(
      //       (acc, cakeItem) =>
      //         acc +
      //         (isItemCompleted(cakeItem.id)
      //           ? cakeItem?.product?.app_info?.ck_prod_time
      //           : 0),
      //       0
      //     ),
      //     designHour: item?.cake_items.reduce(
      //       (acc, cakeItem) =>
      //         acc +
      //         (isItemCompleted(cakeItem.id)
      //           ? cakeItem?.product?.app_info?.ck_design_time
      //           : 0),
      //       0
      //     ),
      //     completed: item?.cake_items.every((cakeItem) =>
      //       isItemCompleted(cakeItem.id)
      //     )
      //       ? 1
      //       : 0,
      //   };
      // }
    } else {
      if (isCalculateValueForQuantityWiseData()) {
        const value = Array.from(
          { length: item?.quantity },
          (_, index) => index
        ).reduce(
          (acc, index) => {
            if (isItemCompleted(getUpdatedId(item.id, index))) {
              return {
                productionHour:
                  (acc.productionHour || 0) +
                  isItemCompleted(getUpdatedId(item.id, index))
                    ? item?.product?.app_info?.ck_prod_time || 0
                    : 0,
                designHour:
                  (acc.designHour || 0) +
                  isItemCompleted(getUpdatedId(item.id, index))
                    ? item?.product?.app_info?.ck_design_time || 0
                    : 0,
                completed:
                  (acc.completed || 0) +
                  isItemCompleted(getUpdatedId(item.id, index)),
              };
            } else {
              return { ...acc };
            }
          },
          { productionHour: 0, designHour: 0, completed: 0 }
        );
        return value;
      } else {
        if (isItemCompleted(item.id)) {
          return {
            productionHour: isItemCompleted(item.id)
              ? item?.product?.app_info?.ck_prod_time || 0
              : 0,
            designHour: isItemCompleted(item.id)
              ? item?.product?.app_info?.ck_design_time || 0
              : 0,
            completed:
              isItemCompleted(item.id) *
              (item?.expanded_quantity || item?.quantity),
          };
        }
      }
    }
    return {
      productionHour: 0,
      designHour: 0,
      completed: 0,
    };
  };

  const getItemCommpletedCount = (data, acc) => {
    const value = data?.items.reduce(
      (previous, item) => {
        return {
          completedItemCount:
            (previous.completedItemCount || 0) +
            checkCompletedItem(item).completed,

          totalProductionHours:
            (previous.totalProductionHours || 0) +
            item?.product?.app_info?.ck_prod_time,

          completedProductionHours:
            (previous.completedProductionHours || 0) +
            checkCompletedItem(item).productionHour,

          totalDecoratorHours:
            (previous.totalDecoratorHours || 0) +
            item?.product?.app_info?.ck_design_time,

          completedDecoratorHours:
            (previous.completedDecoratorHours || 0) +
            checkCompletedItem(item).designHour,
        };
      },
      { ...(acc.completedItem || {}) }
    );
    return value;
  };

  useEffect(() => {
    if (!isEmpty(ordersByDate)) {
      const allOrders = Object.values(ordersByDate).map((orderData) =>
        Object.values(orderData.orders)
      );

      if (!isEmpty(allOrders)) {
        const tempFooterData = allOrders.flat().reduce((acc, data) => {
          return {
            orderCount: (acc.orderCount || 0) + 1,

            completedOrderCount:
              (acc.completedOrderCount || 0) + checkCompleteOrder(data?.items),

            itemCount: (acc.itemCount || 0) + getItemCount(data?.items),

            completedItem: getItemCommpletedCount(data, acc),
          };
        }, {});
        setFooterData({ ...tempFooterData });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersByDate, itemInfo]);

  const completedItemPercentage = () => {
    if (footerData?.itemCount > 0) {
      return (
        (footerData?.completedItem?.completedItemCount /
          footerData?.itemCount) *
        100
      ).toFixed(2);
    }
  };

  const completedDecoratorHoursPercentage = () => {
    if (footerData?.completedItem?.totalDecoratorHours > 0) {
      return (
        (footerData?.completedItem?.completedDecoratorHours /
          footerData?.completedItem?.totalDecoratorHours) *
        100
      ).toFixed(2);
    }
  };

  return (
    <>
      <footer className="footer">
        <ProgressBar now={completedItemPercentage()} />

        <div className="px-3 bg-primary d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Link
              onClick={handleLogout}
              to={routesConstant.LOGIN}
              className="p-0 nav-link d-flex align-items-center"
            >
              <ExitIcon color="white" width="32" />
            </Link>
            <div className="d-flex align-items-center ms-2">
              <img className="ms-4" src={userIcon} alt="" width={32} />
              <span className="text-white mx-2">{fullName}</span>
              <div
                className="vr text-white mx-3"
                style={{ width: "2px", height: "30px" }}
              ></div>
              {ordersByDate && (
                <>
                  <div className="text-white">
                    Items: {footerData?.completedItem?.completedItemCount || 0}/
                    {footerData?.itemCount || 0}{" "}
                    {footerData?.itemCount > 0 && (
                      <span>
                        -{" "}
                        {(
                          (footerData?.completedItem?.completedItemCount /
                            footerData?.itemCount) *
                          100
                        ).toFixed(2)}{" "}
                        % Completed
                      </span>
                    )}
                  </div>
                  <div
                    className="vr text-white mx-3"
                    style={{ width: "2px", height: "30px" }}
                  ></div>
                  <div className="text-white">
                    Orders: {footerData?.completedOrderCount || 0}/
                    {footerData?.orderCount || 0}{" "}
                    {footerData?.orderCount > 0 && (
                      <span>
                        -{" "}
                        {(
                          (footerData?.completedOrderCount /
                            footerData?.orderCount) *
                          100
                        ).toFixed(2)}
                        % Completed
                      </span>
                    )}
                  </div>
                  <div
                    className="vr text-white mx-3"
                    style={{ width: "2px", height: "30px" }}
                  ></div>
                  {selectedPageID === pageId.decorator && (
                    <div className="text-white">
                      Design Hours :{" "}
                      {footerData?.completedItem?.completedDecoratorHours.toFixed(
                        2
                      )}
                      /
                      {footerData?.completedItem?.totalDecoratorHours.toFixed(
                        2
                      )}{" "}
                      {footerData?.completedItem?.totalDecoratorHours > 0 && (
                        <span>
                          - {completedDecoratorHoursPercentage()} % Completed
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="d-flex">
            <div
              className="vr text-white me-2 mt-2"
              style={{ width: "2px", height: "35px" }}
            ></div>
            <div className="d-flex flex-column">
              <span className="text-center text-white">
                LU:{" "}
                {user?.dateTime
                  ? spliceDate(user?.dateTime)[0]
                    ? dateToMMDDYYYY(spliceDate(user?.dateTime)[0])
                    : " - / - / - "
                  : " - / - / - "}
              </span>
              <span className="text-center text-white">
                {user?.dateTime
                  ? spliceDate(user?.dateTime)[1]
                    ? spliceDate(user?.dateTime)[1]
                    : " - : - "
                  : " - : - "}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => dispatch(logout()),
  };
};

export default connect(null, mapDispatchToProps)(Footer);
