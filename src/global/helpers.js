import { isEmpty } from "lodash";
import moment from "moment";
import {
  dinningTypeData,
  ILLEGAL_CHARACTERS_REGEX,
  SLUG_REGEX,
} from "../utils/StaticData";

export const spliceDate = (date) => {
  if (date) {
    let value = date.split(" ");
    return value && value?.length > 0 ? [value[0], value[1]] : ["", ""];
  } else {
    return ["", ""];
  }
};

export const dateToMMDDYYYY = (date) => {
  var dateStart = new Date(date);
  if (dateStart instanceof Date && !isNaN(dateStart)) {
    return `${("0" + (dateStart.getMonth() + 1)).slice(-2)}/${(
      "0" + dateStart.getDate()
    ).slice(-2)}/${dateStart.getFullYear()}`;
  } else {
    return "";
  }
};

export const dateToHHMM = (date) => {
  var dateStart = new Date(date);
  if (dateStart instanceof Date && !isNaN(dateStart)) {
    return `${dateStart.toLocaleTimeString("en-US").slice(0, -6)} ${dateStart
      .toLocaleTimeString("en-US")
      .slice(-2)}`;
  } else {
    return "";
  }
};

export const capitalize = (input) => {
  return input
    .toLowerCase()
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(" ");
};

export const convertToSlug = (Text) => {
  return `${Text || ""}`
    .toLowerCase()
    .replace(SLUG_REGEX, "-")
    .replace(ILLEGAL_CHARACTERS_REGEX, "");
};

export const getDiffOfDate = (strDate, endDate) => {
  const a = moment(strDate);
  const b = moment(endDate);
  return b.diff(a, "days");
};

export const checkNoOrdersHandler = (orders) =>
  Object.entries(orders).filter(
    ([orderDate, orderData]) => !isEmpty(orderData.orders)
  );

export const convertDecimalMinutesToTime = (decimalMinutes) => {
  const value = decimalMinutes / 60;
  const hours = Math.floor(value);
  const remaininngMinutes = value - hours;
  const value_2 = remaininngMinutes * 60;
  const min = Math.floor(value_2);
  const remainingMinutes_2 = (value_2 - min).toFixed(2);
  const sec = remainingMinutes_2 * 60;

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMins = min.toString().padStart(2, "0");
  const formattedSecs = sec.toString().padStart(2, "0");
  if (formattedHours !== "00") {
    return `${formattedHours}:${formattedMins}:${formattedSecs}`;
  }
  return `${formattedMins}:${formattedSecs}`;
};

export const roundOf = (x) => {
  return Math.round(x * 10) / 10;
};

export const giveOrderDisplayName = (order, ordersInfo) => {
  let orderDisplayName = `${order?.customer?.first_name || ""} ${
    order?.customer?.last_name || ""
  }`;

  const venueRoom =
    ordersInfo[moment(order?.pickup_time).format("YYYY-MM-DD")]?.orders[
      order?.id
    ]?.venue_room;
  if (venueRoom) {
    orderDisplayName = `${venueRoom?.venue?.name}-${
      venueRoom?.meridiem || "-"
    }-${venueRoom?.name}`;
  } else if (
    getDinningType(order?.dining_option) === dinningTypeData.delivery ||
    getDinningType(order?.dining_option) === dinningTypeData.online
  ) {
    orderDisplayName = order?.call_name;
  }
  return orderDisplayName;
};

export const getDinningType = (dinningType) => {
  const { toGo, delivery, catering, delivPart, online, other, ship } =
    dinningTypeData;
  switch (dinningType) {
    case 1:
      return toGo;
    case 2:
      return delivery;
    case 3:
      return catering;
    case 4:
      return delivPart;
    case 5:
      return online;
    case 6:
      return other;
    case 7:
      return ship;
    case 0:
      return toGo;
    default:
      return;
  }
};

export const getBalDueClassName = (BalDue) => {
  if (BalDue === 0) return "text-success";
  else if (BalDue > 0) return "bg-danger text-white text-center p-0 rounded";
  else if (BalDue < 0)
    return "bg-in-progress text-white text-center p-0 rounded";
  else return "";
};

export const calulateUntillTime = (pickupTime) => {
  const a = moment(pickupTime);
  const b = moment();
  return a.diff(b, "minutes");
};

export const hexToRgbA = (hex) => {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return (
      "rgba(" + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") + ",0.3)"
    );
  }
  throw new Error("Bad Hex");
};

export const formatPhoneNumber = (phoneNumberString) => {
  var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
  var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return "(" + match[1] + ") " + match[2] + "-" + match[3];
  }
  return phoneNumberString;
};
export const getUpdatedId = (itemId, qtyItemIndex) =>
  `${itemId}.${qtyItemIndex + 1}`;

export const normalizeOrderWithoutQuantity = (order) => {
  let finalOrder = {};

  const itemsData = order.items
    .map((qtyItems) => qtyItems[0])
    .map((item) => {
      if (item.cake_items) {
        const cakeItems = item.cake_items.map(
          (qtyCakeItems) => qtyCakeItems[0]
        );
        return { ...item, cake_items: cakeItems };
      }
      return { ...item };
    });
  finalOrder = { ...order, items: itemsData };
  return finalOrder;
};

export const calculatePercentage = (orders, getDoneItemsAndTotalItems) => {
  if (!isEmpty(orders)) {
    const [totalDone, totalItems] = getDoneItemsAndTotalItems(orders);
    const percentage = (totalDone / totalItems) * 100;
    return totalItems > 0 ? percentage : 0;
  }
  return 0;
};

export const getCheckboxFilteredOrder = (orders, filterFunc) => {
  const filteredSearchedOrders = Object.entries(orders).map(
    ([orderDate, orderData]) => {
      let filteredOrders = [];
      if (orderData?.orders) {
        filteredOrders = filterFunc(Object.entries(orderData?.orders));
        return [
          orderDate,
          {
            ...orderData,
            orders: Object.fromEntries(filteredOrders),
          },
        ];
      }
      return [
        orderDate,
        {
          ...orderData,
        },
      ];
    }
  );

  return Object.fromEntries(filteredSearchedOrders);
};

export const removeDuplicate = (arr, key) => [
  ...new Map(arr.map((v) => [v[key], v])).values(),
];

export const convertText = (text) =>
  text.toString().trim().toLowerCase().replace(/ /g, "");

export const isSearchValueIncluded = (dataText, searchText) => {
  const searchValue = convertText(searchText);
  return convertText(dataText).includes(searchValue);
};

export const getAllOrdersInfo = (ordersInfo) => {
  let tempAllOrderInfoObj = {};
  Object.entries(ordersInfo).forEach(([orderDate, data]) => {
    tempAllOrderInfoObj = { ...tempAllOrderInfoObj, ...data.orders };
  });
  return tempAllOrderInfoObj;
};

export const makeGroupAsPerKey = (array, key) => {
  if (array.length === 0) return [];

  return array.reduce((acc, item) => {
    const itemKey = item[key];
    acc[itemKey] = acc[itemKey] || [];
    acc[itemKey].push(item);
    return acc;
  }, {});
};

export const handleSortByKey = (items, key) => {
  return [...items].sort((a, b) => {
    const [letterA, numA] = [a?.[key][0], +a?.[key].slice(1)];
    const [letterB, numB] = [b?.[key][0], +b?.[key].slice(1)];
    return letterA.localeCompare(letterB) || numA - numB;
  });
};

export const getTieredNotTieredItems = (
  printItems,
  isTieredFunc,
  handleSort
) => {
  let tiered = [];
  let nonTiered = [];
  Object.entries(printItems).forEach(([orderId, orderItem]) => {
    if (orderItem.length > 0) {
      for (let index in orderItem) {
        if (isTieredFunc(orderItem[index]?.ITEM_ID, orderItem[index]?.ORDER)) {
          tiered.push(orderItem[index]);
        } else {
          nonTiered.push(orderItem[index]);
        }
      }
    }
  });

  const sortedNonTiered = handleSort(nonTiered);

  const sortedTiered = tiered;

  const finalObject = {
    tiered: sortedTiered,
    nonTiered: sortedNonTiered,
  };
  return finalObject;
};

// export const convertToSlug = (Text) =>  {
//   return Text?.toLowerCase()?.replace(/ /g, "-") ?? "";
// }
