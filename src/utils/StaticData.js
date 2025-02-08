export const baseName = "/bakeflow";

export const desiredPath = "desiredPath";

export const multiplierListData = [
  { id: 1, display_name: "Filling", name: "ck_filling_area" },
  { id: 2, display_name: "Cake Serving", name: "ck_servings" },
  { id: 3, display_name: "Total Surface Area", name: "ck_surface_area" },
  { id: 4, display_name: "Cake Piece", name: "ck_piece_cnt" },
  { id: 5, display_name: "Bake Batch", name: "ck_batch" },
];

export const SLUG_REGEX = / /g;
export const ILLEGAL_CHARACTERS_REGEX = /[^\w-]+/g;

export const reports = {
  cakeLabel: 65,
  boardLabel: 66,
};

export const page_Order_Prep_ID = 63;

export const setting = {
  multiplier_ID: 1,
  printer_setting_ID: 2,
  board_sizes_ID: 3,
  bakers_calculator: 4,
};

export const CONFIG_ID = {
  config_page: 3,
};

export const dinningTypeData = {
  toGo: "To Go",
  delivery: "Delivery",
  catering: "Catering",
  delivPart: "Deliv. Part",
  online: "Online",
  other: "Other",
  ship: "Ship",
};

export const orderTypeData = {
  Ord: "Ord.",
  Inv: "Inv.",
  order: "Order",
  invoice: "Invoice",
};

export const filterConstant = {
  local_id: "local_id",
};

export const filterLabels = {
  order: {
    asc: 1,
    desc: 2,
  },
  time: {
    asc: 3,
    desc: 4,
  },
  dailyID: {
    asc: 5,
    desc: 6,
  },
  printed: {
    all: 0,
    printed: 1,
    notPrinted: 2,
  },
  dailyOrder: {
    asc: 7,
    desc: 8,
  },
};

export const filterOrderReview = {
  all: 0,
  showCakes: 1,
  hideCakes: 2,
};

export const orderOverViewComponentData = {
  fulFill: "fulFill",
  order: "order",
  communication: "communication",
  details: "details",
  log: "log",
};

export const orderOverViewFilterData = {
  all: "All",
  pickups: "Pickups",
  localDeliveries: "Local-Deliveries",
  largeEvent: "Large Event",
  deliveryPartners: "Delivery-Partners",
  shipping: "Shipping",
  activeOrders: "Active-Orders",
  fullfilled: "Fullfilled",
  checkedIn: "Checked-In",
};

export const orderToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhbGciOiJIUzI1NiIsInN1YiI6MiwiaWF0IjoxNjUxNjIxNzQyfQ.kpfhHZiaLVC_xclHfivC4uvpYccS4inK4uKYUDS8Fvw";

export const print_key =
  "philip@pattys-cakes.com_a633dcacba343f992210f2404450df617c4aa418e30adb57941ab34c34989f3c3a84502a5";

export const dinningOptionData = [
  { id: 1, display_name: "Eat in", name: "eat_in" },
  { id: 2, display_name: "Delivery", name: "delivery" },
  { id: 3, display_name: "Catering", name: "catering" },
  { id: 4, display_name: "Deliv. Part.", name: "deliv_part" },
  { id: 5, display_name: "Online", name: "online" },
  { id: 6, display_name: "Other", name: "other" },
  { id: 7, display_name: "Ship", name: "ship" },
  { id: 8, display_name: "Drive-through", name: "drive_thru" },
  { id: 0, display_name: "To Go", name: "to_go" },
];

export const staticFlavourKeys = {
  flavorCakes: "flavorCakes",
  sizeCakes: "sizeCakes",
  shapeCakes: "shapeCakes",
};

export const modifierCatData = {
  flavor: [8, 9],
  filling: 10,
  iced_color: 101,
  iced: 38,
  borders: 37,
  build: 97,
  board: "board",
  note: "note",
};

export const printOrderSorting = {
  printByOrder: 1,
  printByFlavour: 2,
};

export const modifierIdData = {
  white_iced_color: 1014,
  vegan_iced: [1304, 1305, 1306, 1307, 1308, 1309, 1310],
  stackedCakes: 890,
  tieredCakes: 891,
  hybridCakes: 892,
  seperatedCakes: 970,
};

export const deliveryItemsId = {
  rangeStart: 512,
  rangeEnd: 529,
  singleDeliveryItemId: 771,
};

export const bakersLevels = {
  nonTiered: "Non-Tiered",
  tiered: "Tiered",
};

export const print = {
  printer_setting: 8,
};

export const phasesId = {
  completed: 90,
  boxed: 100,
  baked: 20,
  cakeAssembled: 60,
};

export const tiersData = {
  tier_one: 1,
  tier_two: 2,
};

export const pageId = {
  standardCakes: 31,
  baker: 36,
  decorator: 39,
  production: 38,
  backerOrder: 34,
};

export const filterData = {
  all: 0,
  selected: 1,
  notSelected: 2,
  partiallySelected: 3,
};

export const bakersCalcIds = {
  large: 59,
  mini: 60,
  mixes: 61,
};

export const levelListIds = {
  admin: 1,
  owner: 22,
};

export const homePageSectionIds = {
  product: 29,
  reports: 45,
};

export const parentCategory = {
  standard_ck_piece: 42,
};

export const standardCakes = [132, 141, 142, 143];
