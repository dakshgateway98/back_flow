import _, { isEmpty } from "lodash";
import moment from "moment/moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import { setToken } from "../../api";
import {
  addDailyIdsApi,
  addDailySortApi,
  deleteDailyIdsApi,
  deleteDailySortApi,
} from "../../api/dailyId";
import { editMultipleOrderInfoApi, editOrderInfoApi } from "../../api/orders";
import {
  displayErrorToast,
  displaySuccessToast,
} from "../../global/displayToast";
import {
  convertDecimalMinutesToTime,
  getBalDueClassName,
  getDinningType,
} from "../../global/helpers";

import {
  deliveryItemsId,
  dinningTypeData,
  filterOrderReview,
  modifierCatData,
  modifierIdData,
  orderToken,
  orderTypeData,
  parentCategory,
} from "../../utils/StaticData";
import { CheckedIcon, CircleClose } from "../common/icons";
import NoData from "../common/NoData";

const getShape = (shape) => {
  switch (shape) {
    case "rnd":
      return "round";
    case "sht":
      return "sheet";
    case "sqr":
      return "square";
    default:
      return "";
  }
};

const displayFormat = "YYYY-MM-DD";

const OrderReview = (props) => {
  const {
    calenderDates,
    displayOrdersByDate,
    ordersInfo,
    setOrdersInfo,
    dailyIdsOrders,
    setDailyIdsOrders,
    dailSortIds,
    setdailSortIds,
  } = props;

  const { productCategories } = useSelector((state) => state.orders);
  const { allVenueRooms, allRooms } = useSelector((state) => state.venueConfig);

  const [currentVenueDetail, setCurrentVenueDetail] = useState([]);
  const [venueEditId, setVenueEditId] = useState(null);
  const [venueLoader, setVenueLoader] = useState(false);
  const [resetLoader, setResetLoader] = useState(false);
  const [filterState, setFilterState] = useState(filterOrderReview.all);

  const getQtyArray = (item) => {
    const arr = [];
    for (let i = 0; i < item?.quantity; i++) {
      arr.push(i);
    }
    return arr;
  };

  useEffect(() => {
    const tempCurrentVenueDetail = displayOrdersByDate.map((order) => {
      return {
        orderId: order?.id,
        venue_room:
          ordersInfo[moment(order?.pickup_time).format("YYYY-MM-DD")]?.orders[
            order?.id
          ]?.venue_room,
      };
    });
    setCurrentVenueDetail(tempCurrentVenueDetail);
  }, [displayOrdersByDate, ordersInfo]);

  // <----------------------------------------------------------helper functions------------------------------------------------------------>

  const getItemModifier = (item, modifierName) => {
    const requiredModifierObj = item?.modifieritems.find((modiItem) => {
      const modifierCatId = modiItem?.modifier?.modifierCat;
      switch (modifierName) {
        case "flavor1":
          return modifierCatData?.flavor[0] === modifierCatId;
        case "flavor2":
          return modifierCatData?.flavor[1] === modifierCatId;
        case "filling":
          return modifierCatData?.filling === modifierCatId;
        case "build":
          return modifierCatData?.build === modifierCatId;
        default:
          return false;
      }
    });
    return requiredModifierObj
      ? requiredModifierObj?.modifier?.kitchen_print_name
      : "No modifier";
  };

  const getFillingsModifier = (item) => {
    const fillingsModifiers = item?.modifieritems
      .filter((modiItem) => {
        const modifierCatId = modiItem?.modifier?.modifierCat;
        return modifierCatId === modifierCatData?.filling;
      })
      .map((modiItem) =>
        modiItem ? modiItem?.modifier?.kitchen_print_name : "No modifier"
      );

    return fillingsModifiers;
  };

  const getCakeDescription = (modifieritems) => {
    const cakeDescription = modifieritems.reduce((acc, modiItem) => {
      const modifier = modiItem?.modifier;
      switch (modifier?.modifierCat) {
        case modifierCatData?.iced_color:
          return { ...acc, clr: modifier?.kitchen_print_name };
        case modifierCatData?.iced:
          return { ...acc, ice: modifier?.kitchen_print_name };
        case modifierCatData?.borders:
          return { ...acc, brd: modifier?.kitchen_print_name };
        default:
          return acc;
      }
    }, {});
    return cakeDescription;
  };

  const checkIsModifiersSame = (cakeItems) => {
    const firstCakeItemDescription = getCakeDescription(
      cakeItems[0]?.modifieritems
    );
    const isEqual = cakeItems.every((item) => {
      const cakeDescription = getCakeDescription(item?.modifieritems);
      return _.isEqual(cakeDescription, firstCakeItemDescription);
    });
    return isEqual;
  };

  const renderCakeDescription = (modifieritems, index, cakeItems) => {
    const cakeDescription = getCakeDescription(modifieritems);
    if (index !== 0 && cakeItems && checkIsModifiersSame(cakeItems)) {
      return (
        <>
          <div>-</div>
          <div>-</div>
          <div>-</div>
        </>
      );
    } else {
      return (
        <>
          <div>CLR: {cakeDescription?.clr}</div>
          <div>ICE: {cakeDescription?.ice}</div>
          <div>BRD: {cakeDescription?.brd}</div>
        </>
      );
    }
  };

  const getCategoriesId = useCallback(
    (catId) => {
      const categoryDetails = productCategories[catId];
      return categoryDetails ? [catId, categoryDetails] : null;
    },
    [productCategories]
  );

  const getCategories = useCallback(
    (item) => {
      const catObj = getCategoriesId(item?.product?.category);
      const parentCatObj = catObj && getCategoriesId(catObj[1]?.parent);
      return {
        subCat: catObj?.[1]?.name || "",
        parentCat: parentCatObj?.[1]?.name || "",
      };
    },
    [getCategoriesId]
  );

  const calculateRight = (
    parentCakeSize,
    index,
    cakeItemsArrLength,
    shape,
    size
  ) => {
    const arr = parentCakeSize.split("-");
    let right;
    const diff = 45;

    if (size) {
      right = -((diff / 2) * (cakeItemsArrLength - index));
    } else {
      right = -((+arr.length * diff - (shape === "sht" ? 100 : 50)) / 2);
    }
    return right;
  };

  // <----------------------------------------------------------render items functions------------------------------------------------------------>

  const renderSingleLayerItems = (item) => {
    return getQtyArray(item).map((index) => {
      const appInfo = item?.product?.app_info;
      const { subCat, parentCat } = getCategories(item);
      return (
        <div key={`${item?.id}-${index}`}>
          <div className="category my-2">{`${parentCat} / ${subCat}`} </div>
          <div className="item d-flex justify-content-between">
            <div className="item-info">
              <span className="item-exp-quantity">1</span> <span>X</span>{" "}
              <span className="custom-item-title-2">{item?.product?.name}</span>
              <div className="m-3">
                <div className="modifiers-title">
                  {getItemModifier(item, "flavor1") ||
                    getItemModifier(item, "flavor2")}
                  {"/"}
                  {getFillingsModifier(item).map((modifier) => (
                    <span key={modifier}>{modifier}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className={`item-shape ${getShape(appInfo?.ck_shape)}`}>
              {appInfo?.ck_size}
            </div>
            <div className="cake-description">
              {renderCakeDescription(item?.modifieritems)}
            </div>
          </div>
        </div>
      );
    });
  };

  const renderDoubleLayerItems = (item) => {
    return getQtyArray(item).map((index) => {
      const appInfo = item?.product?.app_info;
      const { subCat, parentCat } = getCategories(item);
      return (
        <React.Fragment key={`${item?.id}-${index}`}>
          <div className="category my-2">{`${parentCat} / ${subCat}`} </div>
          <div className="item ">
            <span className="item-exp-quantity">1</span> <span>X</span>{" "}
            <span className={getItemTitleClassName(item)}>
              {item?.product?.name}
            </span>
            <table>
              <colgroup>
                <col style={{ minWidth: "300px" }} />
                <col style={{ minWidth: "400px" }} />
                <col style={{ minWidth: "200px" }} />
              </colgroup>
              <tbody>
                <tr>
                  <td>
                    <div className="m-3 d-flex align-items-center">
                      <div>
                        <div className="modiiersfititle ms-1">
                          {getItemModifier(item, "flavor2")}{" "}
                        </div>
                        <hr width="150" className="m-0" />
                        <div className="modiiersfititle ms-1">
                          {getItemModifier(item, "flavor1")}{" "}
                        </div>
                      </div>
                      <div className="ms-1">
                        {getFillingsModifier(item).map((modifier) => (
                          <div key={modifier}>{modifier}</div>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-column align-items-center">
                      <div
                        className={`item-shape ${getShape(appInfo?.ck_shape)}`}
                      >
                        {appInfo?.ck_size}
                      </div>
                      <div
                        className={`item-shape ${getShape(appInfo?.ck_shape)}`}
                      >
                        {appInfo?.ck_size}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cake-description">
                      {renderCakeDescription(item?.modifieritems)}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </React.Fragment>
      );
    });
  };

  const renderStackedTieredItems = (
    item,
    isStackedCakes,
    isTieredCakes,
    isHybridOrSeparatedCakes
  ) => {
    return getQtyArray(item).map((index) => {
      const { subCat, parentCat } = getCategories(item);
      const parentAppInfo = item?.product?.app_info;
      const parentCakeSize = parentAppInfo?.ck_size;
      return (
        <React.Fragment key={`${item?.id}-${index}`}>
          <div className="category my-2">{`${parentCat} / ${subCat}`} </div>
          <div className="item">
            <div>
              <span className="item-exp-quantity">1</span> <span>X</span>{" "}
              <span className="custom-item-title-2">{item?.product?.name}</span>
            </div>
            <div className="d-flex justify-content-center">
              <span
                className={`item-shape mb-2 ${getShape(
                  parentAppInfo?.ck_shape
                )} `}
                style={{
                  position: "relative",
                  right: `calc( -50px + ${
                    isStackedCakes || isTieredCakes
                      ? calculateRight(
                          parentCakeSize,
                          0,
                          item?.cake_items.length,
                          parentAppInfo?.ck_shape
                        )
                      : 0
                  }px)`,
                  marginBottom: `${
                    isTieredCakes || isHybridOrSeparatedCakes ? "40px" : "0px  "
                  }`,
                }}
              >
                {parentAppInfo?.ck_shape.toUpperCase()}
              </span>
            </div>

            <table>
              <colgroup>
                <col style={{ minWidth: "450px" }} />
                <col style={{ minWidth: "350px" }} />
                <col style={{ minWidth: "140px" }} />
              </colgroup>
              <tbody>
                {item?.cake_items.map((cakeItem, index, self) => {
                  const appInfo = cakeItem?.product?.app_info;
                  return (
                    <tr key={`${cakeItem?.id}-${index}`}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div>
                            <span className="modiiersfititle ms-1">
                              {getItemModifier(cakeItem, "flavor1")}
                            </span>
                            <hr width="150" className="m-0" />
                            <span className="modiiersfititle ms-1">
                              {getItemModifier(cakeItem, "flavor2")}
                            </span>
                          </div>
                          <span className="ms-1">
                            {getFillingsModifier(cakeItem).map((modifier) => (
                              <div key={modifier}>{modifier}</div>
                            ))}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div
                          className="item-shape stacked"
                          style={{
                            width: `${(index + 1) * 45}px`,
                            position: "relative",
                            right: `${
                              isStackedCakes || isTieredCakes
                                ? calculateRight(
                                    parentCakeSize,
                                    index + 1,
                                    self.length,
                                    appInfo?.ck_shape,
                                    appInfo?.ck_size
                                  )
                                : 0
                            }px`,
                            marginBottom: `${
                              isTieredCakes || isHybridOrSeparatedCakes
                                ? "40px"
                                : "0px  "
                            }`,
                          }}
                        >
                          {appInfo?.ck_size}
                        </div>
                      </td>
                      <td>
                        <div className="cake-description">
                          <span>
                            {renderCakeDescription(
                              cakeItem?.modifieritems,
                              index,
                              self
                            )}
                          </span>
                          <hr className="m-0" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div
              className="my-2 d-flex justify-content-center"
              style={{
                position: "relative",
                right: `calc( -50px + ${calculateRight(
                  parentCakeSize,
                  0,
                  item?.cake_items.length
                )}px)`,
              }}
            >
              BLD: {getItemModifier(item, "build")}
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  const getItemTitleClassName = (item) => {
    const appInfo = item?.product?.app_info;
    const productCategory = appInfo?.product?.category;
    if (appInfo?.ck_build === "dl" && appInfo?.ck_tiers === 1) {
      if ([132, 141, 142, 143].includes(productCategory)) {
        // todo remove static ids
        return "custom-item-title-1";
      } else {
        return "custom-item-title-2";
      }
    } else if (
      productCategory === 296 ||
      [745, 766].includes(item?.product?.id)
    ) {
      return "custom-item-title-1";
    } else {
      return "item-title";
    }
  };

  const renderDefaultItem = (item) => {
    return (
      <div className="item mb-2" key={item?.id}>
        <span className="item-exp-quantity">{item?.expanded_quantity}</span>{" "}
        <span>X</span>{" "}
        <span className={`${getItemTitleClassName(item)}`}>
          {item?.product?.name}
        </span>
      </div>
    );
  };

  const renderSingleItem = (item) => {
    const appInfo = item?.product?.app_info;
    const modifierItem = item?.modifieritems[0];
    if (appInfo?.ck_build === "sl") {
      return renderSingleLayerItems(item);
    } else if (appInfo?.ck_build === "dl" && appInfo?.ck_tiers === 1) {
      return renderDoubleLayerItems(item);
    } else if (appInfo?.ck_tiers > 1) {
      const modifierId = modifierItem?.modifier?.id;
      const isStackedCakes = modifierId === modifierIdData?.stackedCakes;
      const isTieredCakes = modifierId === modifierIdData?.tieredCakes;
      const isHybridOrSeparatedCakes =
        modifierId === modifierIdData?.hybridCakes ||
        modifierId === modifierIdData?.seperatedCakes;

      return renderStackedTieredItems(
        item,
        isStackedCakes,
        isTieredCakes,
        isHybridOrSeparatedCakes
      );
    }
  };

  // <----------------------------------------------------------venue and room functions------------------------------------------------------------>
  const renderRoomsOptions = (orderId) => {
    const venueRoom = currentVenueDetail.find(
      (ele) => ele.orderId === orderId
    )?.venue_room;
    if (venueRoom) {
      const requiredVenue = Object.values(allVenueRooms).find(
        (venue) => +venue?.id === +venueRoom?.venue?.id
      );
      if (requiredVenue?.rooms) {
        return Object.values(requiredVenue?.rooms).map((room) => (
          <option value={room.id} key={room.id}>
            {room?.name}
          </option>
        ));
      }
    }
  };

  const getVenueRoomValue = (orderId, selectName) => {
    const venueRoom = currentVenueDetail.find(
      (ele) => ele.orderId === orderId
    )?.venue_room;
    if (!venueRoom) {
      return "";
    }
    switch (selectName) {
      case "venue_id":
        return venueRoom.venue?.id || "";
      case "room_id":
        return venueRoom.id || "";
      default:
        return venueRoom[selectName] || "";
    }
  };

  const handleVenueOnChange = (e, orderId) => {
    const selectName = e.target.name;
    const selectValue = e.target.value;

    let venueRoom = {};

    if (selectName === "venue_id") {
      const venueRoomDetails = allVenueRooms[selectValue];
      const { rooms, ...venueDetails } = venueRoomDetails || {};
      venueRoom = {
        ...(!isEmpty(venueDetails) && { venue: venueDetails }),
      };
    } else if (selectName === "room_id") {
      venueRoom = allRooms.find((room) => +room.id === +selectValue);
    } else {
      venueRoom = {
        [selectName]: selectValue,
      };
    }

    setCurrentVenueDetail((prev) =>
      prev.map((ele) => {
        if (ele.orderId === orderId) {
          return {
            ...ele,
            venue_room: {
              ...(selectName !== "venue_id" ? ele?.venue_room : {}),
              ...(ele?.venue_room?.meridiem && {
                meridiem: ele?.venue_room?.meridiem,
              }),
              ...venueRoom,
            },
          };
        }
        return ele;
      })
    );
  };

  const handleAddVenueRoom = async (order) => {
    const venueRoom = currentVenueDetail.find(
      (ele) => ele.orderId === order?.id
    )?.venue_room;
    const doesRoomsExist = !!Object.values(allVenueRooms).find(
      (venue) => +venue?.id === +venueRoom?.venue?.id
    )?.rooms;
    if (!!venueRoom?.venue) {
      if (!!venueRoom?.meridiem) {
        if (!doesRoomsExist || !!venueRoom?.id) {
          const payload = {
            venue_room: venueRoom?.id || venueRoom?.venue?.id,
            meridiem: venueRoom?.meridiem,
          };
          setVenueLoader(true);
          setToken(orderToken);
          const res = await editOrderInfoApi(payload, order?.id);

          if (res?.success) {
            displaySuccessToast(res.message);
            const orderDate = moment(order?.pickup_time).format(displayFormat);
            let tempOrdersInfo = _.cloneDeep(ordersInfo);
            tempOrdersInfo = {
              ...tempOrdersInfo,
              [orderDate]: {
                orders: {
                  ...tempOrdersInfo[orderDate].orders,
                  [order?.id]: res.data,
                },
              },
            };
            setOrdersInfo(tempOrdersInfo);
            setVenueEditId(null);
          }
        } else {
          displayErrorToast("Please select room before adding");
        }
      } else {
        displayErrorToast("Please select AM/PM before adding");
      }
    } else {
      displayErrorToast("Please select venue before adding");
    }
    setVenueLoader(false);
  };

  const handleClearVenueRoom = async (order) => {
    const orderDate = moment(order?.pickup_time).format("YYYY-MM-DD");
    const payload = { venue_room: null, confirmed: false };

    setCurrentVenueDetail((prev) =>
      prev.map((ele) =>
        ele.orderId === order?.id ? { ...ele, venue_room: null } : ele
      )
    );

    setVenueLoader(true);
    setToken(orderToken);

    const res = await editOrderInfoApi(payload, order?.id);

    if (res?.success) {
      displaySuccessToast(res.message);

      setOrdersInfo((prev) => ({
        ...prev,
        [orderDate]: {
          ...prev[orderDate],
          orders: { ...prev[orderDate].orders, [order?.id]: res.data },
        },
      }));

      setVenueEditId(null);
    }

    setVenueLoader(false);
  };

  const handleShowVenue = (order) =>
    order?.items?.some((item) => {
      const productId = +item?.product?.id;
      return (
        (productId >= deliveryItemsId?.rangeStart &&
          productId <= deliveryItemsId?.rangeEnd) ||
        productId === deliveryItemsId?.singleDeliveryItemId
      );
    });

  const renderVenue = (order) => {
    const requiredOrderInfo =
      ordersInfo[moment(order?.pickup_time).format(displayFormat)]?.orders[
        order?.id
      ];

    const venueRoom = requiredOrderInfo?.venue_room;

    if (venueRoom && venueEditId !== order?.id) {
      return (
        <>
          <span className="review-title">Venue</span>

          <span>{venueRoom?.venue?.name} -</span>
          <span>{venueRoom?.meridiem} -</span>

          <span>{venueRoom?.name}</span>
          <Button
            className="px-2 py-0"
            onClick={() => setVenueEditId(order?.id)}
          >
            <div>Edit</div>
          </Button>
          <Button
            className="px-2 py-0 clear"
            onClick={() => handleClearVenueRoom(order)}
          >
            <div className="d-flex gap-2 align-items-center">
              <span>Clear</span>
              {venueLoader && (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              )}
            </div>
          </Button>
        </>
      );
    } else {
      return (
        <>
          <span className="review-title">Venue</span>

          <Form.Select
            style={{ width: "170px", height: "30px" }}
            className="custom-input board-select p-0 px-1"
            value={getVenueRoomValue(order?.id, "venue_id")}
            name="venue_id"
            onChange={(e) => handleVenueOnChange(e, order?.id)}
          >
            <option value="">Venue select</option>
            {!isEmpty(allVenueRooms) &&
              Object.values(allVenueRooms).map((venue) => (
                <option value={venue?.id} key={venue?.id}>
                  {venue?.name}
                </option>
              ))}
          </Form.Select>
          <Form.Select
            style={{ width: "90px", height: "30px" }}
            className="custom-input board-select p-0 px-2 "
            value={getVenueRoomValue(order?.id, "meridiem")}
            name="meridiem"
            onChange={(e) => handleVenueOnChange(e, order?.id)}
          >
            <option value="-">-</option>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </Form.Select>
          <Form.Select
            style={{ width: "140px", height: "30px" }}
            className="custom-input board-select p-0 px-1"
            value={getVenueRoomValue(order?.id, "room_id")}
            name="room_id"
            onChange={(e) => handleVenueOnChange(e, order?.id)}
          >
            <option>Room select</option>
            {!isEmpty(allVenueRooms) &&
              currentVenueDetail.find((detail) => detail?.orderId === order?.id)
                ?.venue_room?.venue &&
              renderRoomsOptions(order?.id)}
          </Form.Select>
          <Button
            className="px-2 py-0 me-2"
            onClick={() => handleAddVenueRoom(order)}
          >
            <div className="d-flex gap-2 align-items-center">
              <span>Add</span>
              {venueLoader && (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              )}
            </div>
          </Button>
        </>
      );
    }
  };

  // <----------------------------------------------------------counter functions------------------------------------------------------------>
  const calculateCkPieceCount = (order) => {
    const calculatedCkCount = order?.items.reduce(
      (itemAcc, item) => {
        if (item?.cake_items) {
          const cakeItemsCount = item.cake_items.reduce(
            (cakeItemAcc, cakeItem) => {
              const ckCount = cakeItem?.product?.app_info?.ck_piece_cnt || 0;
              if (
                cakeItem?.product?.parent_category ===
                parentCategory?.standard_ck_piece
              ) {
                return {
                  ...cakeItemAcc,
                  standardCkCount:
                    (cakeItemAcc?.standardCkCount || 0) + ckCount,
                };
              }
              return {
                ...cakeItemAcc,
                customCkCount: (cakeItemAcc?.customCkCount || 0) + ckCount,
              };
            },
            { customCkCount: 0, standardCkCount: 0 }
          );
          return {
            customCkCount:
              itemAcc?.customCkCount + cakeItemsCount?.customCkCount,
            standardCkCount:
              itemAcc?.standardCkCount + cakeItemsCount?.standardCkCount,
          };
        }
        const itemCkCount = item?.product?.app_info?.ck_piece_cnt || 0;
        if (
          item?.product?.parent_category === parentCategory?.standard_ck_piece
        ) {
          return {
            ...itemAcc,
            standardCkCount: (itemAcc?.standardCkCount || 0) + itemCkCount,
          };
        }
        return {
          ...itemAcc,
          customCkCount: (itemAcc?.customCkCount || 0) + itemCkCount,
        };
      },
      { customCkCount: 0, standardCkCount: 0 }
    );
    return calculatedCkCount;
  };

  const calculateProDesignCount = (order, key) => {
    const calculatedCkCount = order?.items.reduce((itemAcc, item) => {
      if (item?.cake_items) {
        const cakeItemsCount = item.cake_items.reduce(
          (cakeItemAcc, cakeItem) => {
            const ckCount = cakeItem?.product?.app_info[key] || 0;
            if (
              (key === "ck_prod_time_calcd" ||
                key === "ck_design_time_calcd") &&
              item?.product?.category === 42
            ) {
              return cakeItemAcc;
            }
            return (cakeItemAcc += ckCount);
          },
          0
        );
        return (itemAcc += cakeItemsCount);
      }
      if (
        (key === "ck_prod_time_calcd" || key === "ck_design_time_calcd") &&
        item?.product?.category === 42
      ) {
        return itemAcc;
      }
      return (itemAcc += item?.product?.app_info[key] || 0);
    }, 0);
    return calculatedCkCount;
  };

  const calculateTotalOrderCount = (orders, key) => {
    const calculatedTotalOrderCount = orders.reduce((orderAcc, order) => {
      return (orderAcc += calculateProDesignCount(order, key));
    }, 0);
    return calculatedTotalOrderCount;
  };

  const calculateTotalCkPieceCount = (orders) => {
    const calculatedTotalCkPieceCount = orders.reduce(
      (orderAcc, order) => {
        const { customCkCount, standardCkCount } = calculateCkPieceCount(order);
        return {
          customCkCount: (orderAcc.customCkCount || 0) + customCkCount,
          standardCkCount: (orderAcc.standardCkCount || 0) + standardCkCount,
        };
      },
      { customCkCount: 0, standardCkCount: 0 }
    );
    return calculatedTotalCkPieceCount;
  };

  // <-----------------------------------------Daily Ids and user icons functions ---------------------------------------------------->

  const isConfirmedOrder = useCallback(
    (orderId) => {
      return ordersInfo[calenderDates?.startDate]?.orders[orderId]?.confirmed;
    },
    [calenderDates?.startDate, ordersInfo]
  );

  const handleConfirmedOrders = async (order) => {
    const { id: orderId, pickup_time } = order;
    const showVenue = handleShowVenue(order);
    const requiredOrderInfo =
      ordersInfo[moment(pickup_time).format(displayFormat)]?.orders[orderId];
    const venueRoom = requiredOrderInfo?.venue_room;

    const isOrderConfirmed = isConfirmedOrder(orderId);

    if (!showVenue || !!venueRoom) {
      const payload = { confirmed: !isOrderConfirmed };

      const dailSortPayload = sortedOrders.map((order) => order.id);

      const orderinfoRes = await editOrderInfoApi(payload, orderId);

      if (orderinfoRes?.success) {
        setOrdersInfo((prev) => ({
          ...prev,
          [calenderDates?.startDate]: {
            orders: {
              ...prev[calenderDates?.startDate].orders,
              [orderId]: orderinfoRes.data,
            },
          },
        }));
      }
      if (!dailSortIds.includes(order?.id)) {
        const dailySortRes = await addDailySortApi(
          calenderDates?.startDate,
          dailSortPayload
        );

        if (dailySortRes?.success) {
          setdailSortIds(dailySortRes.data?.sort);
        }
      }
    } else {
      displayErrorToast("Please add venue before confirming the order");
    }
  };

  const handleUpdateItems = useCallback(
    (orderItems) => {
      const defaultItemsObject = orderItems
        .filter((orderItem) => !orderItem?.product?.app_info?.ck_tiers)
        .reduce((acc, orderItem) => {
          const { subCat = "", parentCat = "" } =
            getCategories(orderItem) || {};
          acc = {
            ...acc,
            [parentCat]: {
              ...acc[parentCat],
              [subCat]: [...(acc[parentCat]?.[subCat] || []), orderItem],
            },
          };
          return acc;
        }, {});
      return defaultItemsObject;
    },
    [getCategories]
  );

  const renderItems = (orderItems) => {
    const defaultItemsObject = handleUpdateItems(orderItems);

    const cakeItems = orderItems.filter(
      (item) => item?.product?.app_info?.ck_tiers
    );

    const renderDefaultItems = Object.entries(defaultItemsObject).map(
      ([parentCat, childObj]) =>
        Object.entries(childObj).map(([subCat, items]) => {
          return (
            <div className="mb-4" key={`${parentCat} / ${subCat}`}>
              <div className="category my-2">{`${parentCat} / ${subCat}`}</div>
              {items.map((item) => renderDefaultItem(item))}
            </div>
          );
        })
    );

    const renderCakeItems = cakeItems.map((item, index, self) => {
      return (
        <div key={item?.id}>
          <div className="my-3">
            {renderSingleItem(item, defaultItemsObject)}
          </div>
          {self.length - 1 !== index && (
            <div>
              <hr />
            </div>
          )}
        </div>
      );
    });

    return (
      <>
        {renderDefaultItems}
        {renderCakeItems}
      </>
    );
  };

  const filteredOrders = useMemo(() => {
    const filteredOrders = displayOrdersByDate.filter((order) =>
      order?.items.some((item) => {
        switch (filterState) {
          case filterOrderReview.all:
            return true;
          case filterOrderReview.showCakes:
            return item?.product?.app_info?.ck_shape;
          case filterOrderReview.hideCakes:
            return !item?.product?.app_info?.ck_shape;
          default:
            return true;
        }
      })
    );
    return filteredOrders;
  }, [displayOrdersByDate, filterState]);

  const sortedOrders = useMemo(() => {
    return filteredOrders.sort((a, b) => {
      const aIndex = dailSortIds.indexOf(a.id);
      const bIndex = dailSortIds.indexOf(b.id);

      if (aIndex !== -1 && bIndex !== -1) {
        // If both elements are in dailySort array, compare their positions
        return aIndex - bIndex;
      } else if (aIndex !== -1) {
        // If only a is in dailySort array, a should come first
        return -1;
      } else if (bIndex !== -1) {
        // If only b is in dailySort array, b should come first
        return 1;
      } else {
        // If both elements are not in dailySort array, sort by date/time
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
  }, [dailSortIds, filteredOrders]);

  const allOrdersId = useMemo(
    () => sortedOrders?.map((order) => order?.id),
    [sortedOrders]
  );

  const confirmedOrdersIds = useMemo(() => {
    if (ordersInfo?.[calenderDates?.startDate]) {
      const tempOrdersInfo = _.cloneDeep(ordersInfo);
      const tempConfirmedIds = Object.entries(
        tempOrdersInfo[calenderDates?.startDate]?.orders
      ).reduce((acc, [orderId, ordersInfoDetail]) => {
        if (ordersInfoDetail?.confirmed) {
          return (acc = [...acc, +orderId]);
        }
        return acc;
      }, []);
      return tempConfirmedIds;
    }
    return [];
  }, [calenderDates?.startDate, ordersInfo]);

  useEffect(() => {
    const addDailyIds = async (dailyIdsPayload) => {
      const res = await addDailyIdsApi(
        calenderDates?.startDate,
        dailyIdsPayload
      );
      if (res?.success) {
        setDailyIdsOrders(res?.data?.orders);
      }
    };

    const isItemCake = (order) =>
      order?.items.some((item) => item?.product?.app_info?.ck_shape);

    const sortedOrderIds = sortedOrders.map((order) => order.id);

    const dailyIdsPayload = sortedOrderIds.filter((orderId) => {
      const requiredOrder = sortedOrders.find((order) => order.id === orderId);
      return isItemCake(requiredOrder);
    });

    const tempDailyIds = Object.keys(_.cloneDeep(dailyIdsOrders)).map(
      (id) => +id
    );
    const isTempDailyIdsMatched =
      tempDailyIds.length > 0 &&
      _.isEqual([...tempDailyIds].sort(), [...dailyIdsPayload].sort());

    const isConfirmedOrdersMatched = _.isEqual(
      confirmedOrdersIds.sort(),
      sortedOrderIds.sort()
    );

    if (
      !isEmpty(allOrdersId) &&
      !isTempDailyIdsMatched &&
      isConfirmedOrdersMatched
    ) {
      addDailyIds(dailyIdsPayload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    confirmedOrdersIds,
    sortedOrders,
    calenderDates?.startDate,
    allOrdersId,
    dailyIdsOrders,
  ]);

  const handleEditMultipleOrderInfo = async () => {
    const payload = {
      orders: !isEmpty(confirmedOrdersIds) ? confirmedOrdersIds : allOrdersId,
      confirmed: false,
    };
    const OrderInfoRes = await editMultipleOrderInfoApi(payload);
    const updatedOrdersInfo = {
      [calenderDates?.startDate]: {
        orders: {
          ...ordersInfo[calenderDates?.startDate]?.orders,
          ...OrderInfoRes.data,
        },
      },
    };
    setOrdersInfo(updatedOrdersInfo);
  };

  const handleDeleteDailyId = async () => {
    const res = await deleteDailyIdsApi(calenderDates?.startDate);
    if (res?.success) {
      setDailyIdsOrders({});
    }
  };
  const handleDeleteDailySort = async () => {
    const res = await deleteDailySortApi(calenderDates?.startDate);
    if (res?.success) {
      setdailSortIds([]);
    }
  };

  const handleReset = async () => {
    setResetLoader(true);

    await handleEditMultipleOrderInfo();
    await handleDeleteDailyId();
    await handleDeleteDailySort();

    setResetLoader(false);
  };

  const isModified = (orderId) => {
    return ordersInfo?.[calenderDates?.startDate]?.orders?.[orderId]?.modified;
  };

  const handleClassNameforIcon = (orderId) => {
    const isDailyOrder = dailyIdsOrders[orderId];
    const isPresentInDailySort = dailSortIds.includes(orderId);
    const isConfirmedOrder = confirmedOrdersIds.includes(orderId);
    const isOrderModified = isModified(orderId);

    if (isOrderModified) {
      return `modified ${!isDailyOrder ? "py-0" : ""}`;
    } else if (isPresentInDailySort && (isDailyOrder || isConfirmedOrder)) {
      return isDailyOrder ? "complete" : "complete py-0";
    }

    return "not-complete";
  };

  return (
    <div className="order-review">
      {!isEmpty(displayOrdersByDate) ? (
        <>
          <div className="border-bottom-primary borde-primary d-flex align-items-center justify-content-between">
            <div className="mb-2">
              <Form.Select
                onChange={(e) => setFilterState(+e.target.value)}
                style={{ width: "130px", height: "35px" }}
                className="custom-input board-select"
              >
                <option value={filterOrderReview.all}>Show all</option>
                <option value={filterOrderReview.showCakes}>Show Cakes</option>
                <option value={filterOrderReview.hideCakes}>Hides Cakes</option>
              </Form.Select>
            </div>
            <div className=" header">
              <div className="review-title total">Totals:</div>
              <div className="mx-2">
                <span className="review-title"> Custom Cake Piece Count:</span>
                <span className="review-value">
                  {
                    calculateTotalCkPieceCount(displayOrdersByDate)
                      ?.customCkCount
                  }
                </span>
              </div>
              <div className="mx-2">
                <span className="review-title">Standard Cake Piece Count:</span>
                <span className="review-value">
                  {
                    calculateTotalCkPieceCount(displayOrdersByDate)
                      ?.standardCkCount
                  }
                </span>
              </div>
              <div className="mx-2">
                <span className="review-title">
                  Custom Cake Production Time:
                </span>
                <span className="review-value">
                  {convertDecimalMinutesToTime(
                    calculateTotalOrderCount(
                      displayOrdersByDate,
                      "ck_prod_time_calcd"
                    )
                  )}
                </span>
              </div>
              <div className="mx-2">
                <span className="review-title">Custom Cake Desgin Time:</span>
                <span className="review-value">
                  {convertDecimalMinutesToTime(
                    calculateTotalOrderCount(
                      displayOrdersByDate,
                      "ck_design_time_calcd"
                    )
                  )}
                </span>
              </div>
              <div className="mx-2">
                <span className="review-title">Orders:</span>
                <span className="review-value">
                  {displayOrdersByDate.length}
                </span>
              </div>
            </div>
          </div>
          {sortedOrders.map((order) => (
            <table className="table-bordered my-4 w-100" key={order?.id}>
              <colgroup>
                <col style={{ minWidth: "500px" }} />
                <col width={200} />
                <col width={200} />
                <col width={250} />
                <col width={80} />
              </colgroup>

              <thead>
                <tr>
                  <th>
                    <div className="d-flex my-2">
                      <div>
                        <span className="review-title">Time</span>
                        <span className="review-value fw-bold">
                          {moment(order?.pickup_time).format("hh:mm a")}
                        </span>
                      </div>
                      <div>
                        <span className="review-title">Name</span>
                        <span className="review-value fw-bold">
                          {getDinningType(order?.dining_option) ===
                            dinningTypeData?.delivery ||
                          getDinningType(order?.dining_option) ===
                            dinningTypeData?.online
                            ? order?.call_name
                            : order?.customer?.first_name +
                              " " +
                              order?.customer?.last_name}
                        </span>
                      </div>
                    </div>
                    {handleShowVenue(order) && (
                      <div className="d-flex gap-2 my-2">
                        {renderVenue(order)}
                      </div>
                    )}
                  </th>
                  <th>
                    <div>
                      <span className="review-title">Order #:</span>
                      <span className="review-value">{order?.local_id}</span>
                    </div>
                    <div>
                      <span className="review-title">Type:</span>
                      <span className="review-value">
                        {order?.is_invoice
                          ? orderTypeData.invoice
                          : orderTypeData.order}
                      </span>
                    </div>
                    <div>
                      <span className="review-title">Cake Piece Count:</span>
                      <span className="review-value">
                        {calculateProDesignCount(order, "ck_piece_cnt")}
                      </span>
                    </div>
                  </th>
                  <th>
                    <div>
                      <span className="review-title">Order Total:</span>
                      <span className="review-value">{`$${order?.final_total}`}</span>
                    </div>
                    <div>
                      <span className="review-title">Balance Due:</span>
                      <span
                        className={`review-value ${
                          order?.remaining_due === 0 ? "p-0" : "p-1"
                        } ${getBalDueClassName(order?.remaining_due)}`}
                      >
                        {order?.remaining_due === 0
                          ? "Paid"
                          : `$${order?.remaining_due}`}
                      </span>
                    </div>
                    <div>
                      <span className="review-title">Production Time:</span>
                      <span className="review-value">
                        {convertDecimalMinutesToTime(
                          calculateProDesignCount(order, "ck_prod_time_calcd")
                        )}
                      </span>
                    </div>
                  </th>
                  <th>
                    <div>
                      <span className="review-title">Dinning Type:</span>
                      <span className="review-value">
                        {getDinningType(order?.dining_option)}
                      </span>
                    </div>
                    <div>
                      <span className="review-title">Placed:</span>
                      <span className="review-value">
                        {moment(order?.created_date).format(
                          "MM/DD/YYYY - h:mm a"
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="review-title">Design Time:</span>
                      <span className="review-value">
                        {convertDecimalMinutesToTime(
                          calculateProDesignCount(order, "ck_design_time_calcd")
                        )}
                      </span>
                    </div>
                  </th>
                  <th className="text-center">
                    <Button
                      onClick={() => handleConfirmedOrders(order)}
                      className={`checked-status ${handleClassNameforIcon(
                        order?.id
                      )} px-2`}
                    >
                      {dailyIdsOrders[order?.id] ? (
                        <span className="p-2" style={{ fontSize: "20px" }}>
                          {dailyIdsOrders[order?.id]}
                        </span>
                      ) : isModified(order?.id) ||
                        (dailSortIds.includes(order?.id) &&
                          confirmedOrdersIds.includes(order?.id)) ? (
                        <CheckedIcon color="white" />
                      ) : (
                        <CircleClose color="white" />
                      )}
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3" colSpan="5">
                    {renderItems(order?.items)}
                  </td>
                </tr>
              </tbody>
            </table>
          ))}
          <table
            className="table-bordered w-100"
            style={{ backgroundColor: "#f0f0f0" }}
          >
            <colgroup>
              <col style={{ minWidth: "500px" }} />
              <col width={200} />
              <col width={200} />
              <col width={250} />
              <col width={80} />
            </colgroup>
            <thead>
              <tr>
                <th colSpan={5} className="reset-button">
                  <div className="d-flex justify-content-center">
                    <Button className="px-2 py-0 me-2" onClick={handleReset}>
                      <div className="d-flex gap-2 align-items-center px-2">
                        <span className="text-uppercase">Reset</span>
                        {resetLoader && (
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </Button>
                  </div>
                </th>
              </tr>
            </thead>
          </table>
        </>
      ) : (
        <table
          className="table-bordered"
          style={{ backgroundColor: "#f0f0f0" }}
        >
          <colgroup>
            <col style={{ minWidth: "500px" }} />
            <col width={200} />
            <col width={200} />
            <col width={250} />
            <col width={80} />
          </colgroup>
          <thead>
            <tr>
              <th colSpan={5}>
                <NoData />
              </th>
            </tr>
          </thead>
        </table>
      )}
    </div>
  );
};

export default OrderReview;
