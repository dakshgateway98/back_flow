import { isEmpty } from "lodash";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

//apis
import { setToken } from "../../api";
import { editOrderInfoApi, getProductsCategoriesIdApi } from "../../api/orders";

//redux
import { addProductCategories } from "../../redux/actions/orderActions";

//helpers and static datas
import { Button, Form, Table } from "react-bootstrap";
import ListIcon from "../../assets/icons/list.svg";
import { displayErrorToast } from "../../global/displayToast";
import {
  calulateUntillTime,
  formatPhoneNumber,
  getBalDueClassName,
  getDinningType,
  isSearchValueIncluded,
} from "../../global/helpers";
import {
  orderOverViewFilterData,
  orderToken,
  orderTypeData,
} from "../../utils/StaticData";

//hooks
import useCalenderSearchQuery from "../../hooks/useCalenderSearchQuery";
import useCallOrder from "../../hooks/useCallOrder";

//components
import NoData from "../../components/common/NoData";
import OrderLayout from "../../components/common/OrderLayout";
import SearchInput from "../../components/common/SearchInput";
import SortButton from "../../components/common/SortButton";
import OrderOverviewModal from "../../components/modals/OrderOverviewModal";
import useOrderOverviewModal from "../../hooks/useOrderOverviewModal";

const displayHeaderDateFormat = "dddd, MMMM D";
const displayTimeFormat = "h:mm";

const {
  all,
  pickups,
  localDeliveries,
  largeEvent,
  deliveryPartners,
  shipping,
  activeOrders,
} = orderOverViewFilterData;

const sortButtonsData = [
  { name: "customer_info", label: "Customer Info" },
  { name: "delivery_info", label: "Second/Delivery" },
  { name: "order_time", label: "Order Time" },
  { name: "untill_time", label: "Untill Time" },
  { name: "order_id", label: "Order #" },
  { name: "dinning_type", label: "Dining Type" },
  { name: "bal_due", label: "Bal Due" },
  { name: "order_type", label: "Order Type" },
];

const dinningOptionData = [
  { name: all, label: "All" },
  { name: pickups, label: "Pickups" },
  { name: localDeliveries, label: "Local Deliveries" },
  { name: largeEvent, label: "Large Events" },
  { name: deliveryPartners, label: " Delivery Partners" },
];

const OrderOverview = () => {
  const [loader, setLoader] = useState(false);
  const [displayOrdersByDate, setDisplayOrdersByDate] = useState([]);
  const [isToDisplayAllOrders, setIsToDisplayAllOrders] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeSortingField, setActiveSortingField] = useState("order_time");
  const [tempColorobject, setColorObj] = useState({});
  const [sortOrder, setSortOrder] = useState(false);
  const [currentFilter, setCurrentFilter] = useState(all);
  const [headerCurrentFilter, setHeaderCurrentFilter] = useState(activeOrders);

  const dispatch = useDispatch();

  const [calenderDates, setCalenderDates] = useCalenderSearchQuery();
  const [ordersByDate, ordersInfo] = useCallOrder(calenderDates, setLoader);

  const [
    handleOrderOverviewModal,
    orderOverviewModalShow,
    componentType,
    handleCloseModal,
    handleChangeOrderInfo,
    allordersInfoObj,
  ] = useOrderOverviewModal(ordersInfo);
  const getAllOrders = useCallback((sortedOrders) => {
    const ordersArray = [];

    sortedOrders.forEach(([orderDate, orderData]) => {
      orderData.forEach((orderDetail) => {
        ordersArray.push(orderDetail);
      });
    });

    return ordersArray;
  }, []);

  const getDataSortedByTime = useCallback((orderData, sortTimeOrder) => {
    const timeSorted = orderData.sort((a, b) => {
      const a_orderTimeMoment = moment(a?.orders_time).valueOf();
      const b_orderTimeMoment = moment(b?.orders_time).valueOf();
      if (a_orderTimeMoment !== b_orderTimeMoment)
        return (
          (a_orderTimeMoment - b_orderTimeMoment) * (sortTimeOrder ? 1 : -1)
        );
      else
        return (
          a.customer_info
            .replace(/\s/g, "")
            .localeCompare(b.customer_info.replace(/\s/g, "")) *
          (sortTimeOrder ? 1 : -1)
        );
    });
    return timeSorted;
  }, []);

  const handleTimeSort = useCallback(
    (orderData, sortOrder) => {
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

  const handleSort = useCallback((allOrders, sortField, sortOrder) => {
    if (sortField) {
      const sortedList = [...allOrders].sort((a, b) => {
        if (a[sortField] === undefined || null) return 1;
        if (b[sortField] === undefined || null) return -1;
        if (
          a[sortField] === undefined ||
          (null && b[sortField] === undefined) ||
          null
        )
          return 0;
        if (
          sortField === "order_id" ||
          sortField === "untill_time" ||
          sortField === "bal_due"
        ) {
          let a_value = a[sortField];
          let b_value = b[sortField];
          if (sortField === "order_id") {
            a_value = a.order_id.replace(/^w/, "");
            b_value = b.order_id.replace(/^w/, "");
          }
          return (+a_value - +b_value) * (sortOrder ? 1 : -1);
        } else if (sortField === "order_type") {
          return (
            (a[sortField] === b[sortField] ? 0 : a[sortField] ? -1 : 1) *
            (sortOrder ? 1 : -1)
          );
        }
        return (
          a[sortField].toString().localeCompare(b[sortField].toString(), "en", {
            numeric: true,
          }) * (sortOrder ? 1 : -1)
        );
      });
      return sortedList;
    }
  }, []);

  const handleOnClickSort = (btnName) => {
    setActiveSortingField(btnName);
    setSortOrder((prev) => !prev);
    if (btnName === "order_time") {
      setIsToDisplayAllOrders(false);
    } else {
      setIsToDisplayAllOrders(true);
    }
  };

  const getProductCategoriesById = async () => {
    setToken(orderToken);
    const res = await getProductsCategoriesIdApi();
    if (res && res.success === true) {
      dispatch(addProductCategories(res.data));
    } else {
      displayErrorToast(res.message);
    }
  };

  useEffect(() => {
    getProductCategoriesById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getOrderStatus = (orderInfo) => {
    const complete_percentage = orderInfo?.status?.boxed?.complete_percentage;
    if (orderInfo?.fulfilled === true) {
      return "Fulfilled";
    }
    if (orderInfo?.returned === true && orderInfo?.fulfilled === false) {
      return "Returned";
    }
    if (complete_percentage === 0) {
      return "-";
    }
    if (complete_percentage > 0 && complete_percentage < 100) {
      return "Partial";
    }
    if (complete_percentage === 100 && orderInfo?.fulfilled === false) {
      return "Ready";
    }

    return "-";
  };

  const getOrderOverViewObj = (orderDetails, orderInfo) => {
    return {
      orderDetails,
      id: orderDetails?.id,
      customer_info:
        orderDetails?.customer?.first_name +
        " " +
        orderDetails.customer?.last_name,
      delivery_info: orderDetails?.shopify_data
        ? orderDetails?.dining_option === 2
          ? orderDetails?.shopify_data?.shipping?.name
          : orderDetails?.shopify_data?.billing?.name
        : "-",
      orders_time: orderDetails?.pickup_time,
      untill_time: calulateUntillTime(orderDetails?.pickup_time),
      order_id: orderDetails?.local_id,
      dinning_type: getDinningType(orderDetails?.dining_option),
      bal_due: orderDetails?.remaining_due,
      order_type: orderDetails?.is_invoice,
      state: !isEmpty(orderInfo) ? getOrderStatus(orderInfo) : "-",
      here: !isEmpty(orderInfo) ? orderInfo.here : false,
      fulfilled: !isEmpty(orderInfo) ? orderInfo.fulfilled : false,
      balance_collected: !isEmpty(orderInfo)
        ? orderInfo.balance_collected
        : false,
      returned: !isEmpty(orderInfo) ? orderInfo?.returned : {},
      status: !isEmpty(orderInfo) ? orderInfo?.status : {},
      email: orderDetails?.customer?.email || "",
      phone_number: orderDetails?.customer?.phone_number || "",
    };
  };

  const getColorObj = (orderDetails, tempColorobject) => {
    const phone_number = orderDetails.customer?.phone_number;
    if (tempColorobject[phone_number]) {
      const tempColorObj = { ...tempColorobject };
      tempColorObj[phone_number].count++;
    } else {
      function getRandomColor() {
        var letters = "BCDEF".split("");
        var color = "#";
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * letters.length)];
        }
        return color;
      }
      const color = getRandomColor();
      let obj = {
        count: 1,
        color,
      };
      tempColorobject[phone_number] = obj;
    }
    return tempColorobject;
  };

  useEffect(() => {
    if (!isEmpty(ordersByDate) && !isEmpty(ordersInfo)) {
      var tempColorobject = {};
      const updatedOrders = Object.entries(ordersByDate).map(
        ([orderDate, orderData]) => {
          const ordersArraybyData = [];
          Object.entries(orderData?.orders).forEach(
            ([orderId, orderDetails]) => {
              let requiredOrderInfo = allordersInfoObj[orderId];
              tempColorobject = getColorObj(orderDetails, tempColorobject);
              const OrderOverviewObj = getOrderOverViewObj(
                orderDetails,
                requiredOrderInfo
              );
              ordersArraybyData.push(OrderOverviewObj);
            }
          );

          return [orderDate, ordersArraybyData];
        }
      );
      const removedEmptyOrders = updatedOrders.filter(
        ([orderDate, orderData]) => !isEmpty(orderData)
      );
      if (updatedOrders) {
        setColorObj({ ...tempColorobject });
        if (!(currentFilter === all)) {
          setCurrentFilter(all);
          setHeaderCurrentFilter(activeOrders);
        }
        setDisplayOrdersByDate(removedEmptyOrders);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersByDate, ordersInfo, allordersInfoObj]);

  const getUntillTimeClassName = (untillTime) => {
    if (untillTime >= 0) return "text-danger";
    else if (untillTime < 0) return "text-success";
  };

  const handleSearchFilterOrders = useCallback(
    (searchValue) => {
      const searchFilterOrders = displayOrdersByDate.map(
        ([orderDate, orderData]) => {
          const searchedfilteredOrder = orderData.filter((orders) => {
            return (
              (orders?.customer_info &&
                isSearchValueIncluded(orders?.customer_info, searchValue)) ||
              (orders?.delivery_info &&
                isSearchValueIncluded(orders?.delivery_info, searchValue)) ||
              isSearchValueIncluded(
                orders?.order_id && orders?.order_id,
                searchValue
              ) ||
              (orders?.dinning_type &&
                isSearchValueIncluded(orders?.dinning_type, searchValue)) ||
              (orders?.email &&
                isSearchValueIncluded(orders?.email, searchValue)) ||
              (orders?.phone_number &&
                isSearchValueIncluded(
                  formatPhoneNumber(orders?.phone_number),
                  searchValue
                ))
            );
          });
          return [orderDate, searchedfilteredOrder];
        }
      );
      return searchFilterOrders;
    },
    [displayOrdersByDate]
  );

  const handlefilterOrders = useCallback((ordersData, filterType) => {
    const filteredOrdersByDate = ordersData.map(([orderDate, orderData]) => {
      const filteredOrder = orderData.filter((orders) => {
        const dinningOption = orders?.orderDetails?.dining_option;
        const orderTotals = orders?.orderDetails?.order_totals;
        switch (filterType) {
          case pickups:
            return dinningOption === 3 || dinningOption === 5;
          case localDeliveries:
            return dinningOption === 2 && orderTotals.event_type !== largeEvent;
          case largeEvent:
            return (
              orderTotals.event_type && orderTotals.event_type === largeEvent
            );
          case deliveryPartners:
            return dinningOption === 4;
          case shipping:
            return dinningOption === 7;

          default:
            return true;
        }
      });
      return [orderDate, filteredOrder];
    });
    return filteredOrdersByDate;
  }, []);

  const handleHeaderfilterOrders = useCallback((ordersData, filterType) => {
    const filteredOrdersByDate = ordersData.map(([orderDate, orderData]) => {
      const headerfilteredOrders = orderData.filter((orders) => {
        switch (filterType) {
          case orderOverViewFilterData.activeOrders:
            return !orders?.fulfilled;
          case orderOverViewFilterData.fullfilled:
            return orders?.fulfilled;

          case orderOverViewFilterData.checkedIn:
            return orders?.here;
          default:
            return true;
        }
      });
      return [orderDate, headerfilteredOrders];
    });
    return filteredOrdersByDate;
  }, []);

  const handleHereValChange = async (e, data) => {
    const updatedOrders = displayOrdersByDate.map((singleDateOrders) => {
      const updatedOrderArr = singleDateOrders[1].map((order) => {
        if (order?.id === data?.id) {
          return {
            ...order,
            here: e.target.checked,
          };
        }
        return order;
      });

      return [singleDateOrders[0], [...updatedOrderArr]];
    });
    setDisplayOrdersByDate(updatedOrders);

    const Payload = {
      here: e.target.checked,
      // fulfilled: data?.fulfilled,
      // balance_collected: data?.balance_collected,
    };

    setToken(orderToken);
    const res = await editOrderInfoApi(Payload, data?.id);
    if (res && res.success === true) {
      // displaySuccessToast(res.message);
    }
  };

  const handleBackgroundColor = (phone_number) => {
    return tempColorobject[phone_number]?.count > 1
      ? tempColorobject[phone_number]?.color
      : "";
  };

  const handleIsEmptyOrders = (selectedOrdersView) => {
    if (isToDisplayAllOrders) {
      return !isEmpty(selectedOrdersView);
    } else {
      return selectedOrdersView.some(
        ([dateSlot, orderData]) => !isEmpty(orderData)
      );
    }
  };

  const renderOrders = (ordersArray) => {
    return ordersArray.map((ele) => (
      <tr
        key={ele.id}
        style={{
          backgroundColor: `${handleBackgroundColor(ele.phone_number)}`,
          cursor: "pointer",
        }}
      >
        <td
          onClick={() => handleOrderOverviewModal("fulFill", ele.orderDetails)}
        >
          {ele.customer_info}
        </td>
        <td
          onClick={() => handleOrderOverviewModal("fulFill", ele.orderDetails)}
        >
          {ele.delivery_info}
        </td>
        <td
          onClick={() => handleOrderOverviewModal("fulFill", ele.orderDetails)}
          className="text-center"
        >
          {moment(ele.orders_time).format(displayTimeFormat)}
        </td>
        <td
          onClick={() => handleOrderOverviewModal("fulFill", ele.orderDetails)}
          className={`text-center ${getUntillTimeClassName(ele.untill_time)}`}
        >
          {ele.untill_time > 720 || ele.untill_time < -720
            ? "day+"
            : `${ele.untill_time} m`}
        </td>
        <td
          onClick={() => handleOrderOverviewModal("fulFill", ele.orderDetails)}
          className="text-center"
        >
          {ele.order_id}
        </td>
        <td
          onClick={() => handleOrderOverviewModal("fulFill", ele.orderDetails)}
          className="text-center"
        >
          {ele.dinning_type}
        </td>
        <td
          onClick={() => handleOrderOverviewModal("fulFill", ele.orderDetails)}
          className="text-center"
        >
          <div className={getBalDueClassName(ele.bal_due)}>
            {ele.bal_due === 0 ? "Paid" : `$${ele.bal_due}`}
          </div>
        </td>
        <td
          onClick={() => handleOrderOverviewModal("fulFill", ele.orderDetails)}
        >
          <div
            className={`text-center ${
              ele.order_type ? "text-white bg-secondary rounded" : ""
            }`}
          >
            {ele.order_type ? orderTypeData.Inv : orderTypeData.Ord}
          </div>
        </td>

        <td
          onClick={() => handleOrderOverviewModal("fulFill", ele.orderDetails)}
        >
          <div
            className={`status ${
              ele.state === "-"
                ? "dash"
                : ele.state === "Partial"
                ? "partial"
                : ele.state === "Ready"
                ? "ready"
                : ele.state === "Fulfilled"
                ? "fulfilled"
                : ele.state === "Returned"
                ? "returned"
                : ""
            }`}
          >
            {ele.state}
          </div>
        </td>
        <td className="text-center">
          <Form.Group>
            <Form.Check
              className="custom-input-box checkbox-24"
              type="checkbox"
              id={ele.id}
              label=""
              name="here"
              checked={ele.here}
              onChange={(e) => handleHereValChange(e, ele)}
            />
          </Form.Group>
        </td>
        <td>
          <div
            className="fullfill"
            onClick={() =>
              handleOrderOverviewModal("fulFill", ele.orderDetails)
            }
          >
            Fulfill
          </div>
        </td>
        <td>
          <div
            onClick={() => handleOrderOverviewModal("order", ele.orderDetails)}
            style={{ cursor: "pointer" }}
          >
            <img
              style={{ width: "35px", height: "35px" }}
              src={ListIcon}
              alt="list"
            />
          </div>
        </td>
      </tr>
    ));
  };

  const searchedOrders = useMemo(() => {
    if (!isEmpty(displayOrdersByDate)) {
      return handleSearchFilterOrders(searchText);
    } else {
      return [];
    }
  }, [searchText, displayOrdersByDate, handleSearchFilterOrders]);

  const headerfilteredOrders = useMemo(
    () => handleHeaderfilterOrders(searchedOrders, headerCurrentFilter),
    [headerCurrentFilter, searchedOrders, handleHeaderfilterOrders]
  );

  const filteredOrders = useMemo(
    () => handlefilterOrders(headerfilteredOrders, currentFilter),
    [currentFilter, headerfilteredOrders, handlefilterOrders]
  );

  const sortedAllOrders = useMemo(() => {
    const allOrders = getAllOrders(filteredOrders);
    if (activeSortingField === "order_time") {
      return handleTimeSort(filteredOrders, sortOrder);
    } else {
      return handleSort(allOrders, activeSortingField, sortOrder);
    }
  }, [
    activeSortingField,
    sortOrder,
    filteredOrders,
    getAllOrders,
    handleTimeSort,
    handleSort,
  ]);

  const selectedOrdersView = isToDisplayAllOrders
    ? sortedAllOrders
    : filteredOrders;

  return (
    <OrderLayout
      {...{
        loader,
        calenderDates,
        setCalenderDates,
      }}
      setOrderOverviewFilter={setHeaderCurrentFilter}
      orderOverviewFilter={headerCurrentFilter}
    >
      {() => (
        <div className="mb-3">
          <div className="d-flex align-items-center justify-content-between border-bottom-secondary pb-2 mb-3">
            <div>
              {dinningOptionData.map((data, index) => (
                <Button
                  className={`tertiary-btn ${
                    currentFilter === data.name ? "bg-primary text-white" : ""
                  }`}
                  key={index}
                  onClick={() => setCurrentFilter(data.name)}
                >
                  {data.label}
                </Button>
              ))}
            </div>
            <SearchInput
              onChangeHandler={(e) => {
                setIsToDisplayAllOrders(false);
                setSearchText(e.target.value);
              }}
              removeSearch={() => {
                setSearchText("");
              }}
              searchText={searchText}
            />
          </div>
          <Table responsive className="editable-table custom-table-striped">
            <colgroup>
              <col width={180} />
              <col width={180} />
              <col width={80} />
              <col width={60} />
              <col width={90} />
              <col width={80} />
              <col width={70} />
              <col width={70} />
              <col width={60} />
              <col width={40} />
              <col width={60} />
              <col width={50} />
            </colgroup>
            <thead className="border-0  ">
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

                <th>State</th>
                <th>Here</th>
                <th>Fullfill</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                <>
                  <OrderOverviewModal
                    show={orderOverviewModalShow}
                    onHide={handleCloseModal}
                    componenttype={componentType}
                    handleChangeOrderInfo={handleChangeOrderInfo}
                  />
                  {!isEmpty(selectedOrdersView) &&
                  handleIsEmptyOrders(selectedOrdersView) ? (
                    !isToDisplayAllOrders ? (
                      selectedOrdersView.map(
                        ([dateSlot, orderData]) =>
                          !isEmpty(orderData) && (
                            <React.Fragment key={dateSlot}>
                              <tr className="slot-header">
                                <th colSpan={12} className="ps-4">
                                  {moment(dateSlot).format(
                                    displayHeaderDateFormat
                                  )}
                                </th>
                              </tr>
                              {renderOrders(orderData)}
                            </React.Fragment>
                          )
                      )
                    ) : (
                      renderOrders(selectedOrdersView)
                    )
                  ) : (
                    <tr className="bg-white">
                      <td colSpan={12}>
                        <NoData />
                      </td>
                    </tr>
                  )}
                </>
              }
            </tbody>
          </Table>
        </div>
      )}
    </OrderLayout>
  );
};

export default OrderOverview;
