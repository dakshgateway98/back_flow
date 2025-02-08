export const apiEndPoint = {
  LOGIN_ENDPOINT: "/token",
  VIEW_USERS: "/users/view",
  ACTIVE_USERS: "/users/view/active",
  INACTIVE_USERS: "/users/view/inactive",
  ADD_USER: "/users/add",
  EDIT_USER: "/users/edit",

  // LEVEL END POINTS
  VIEW_LEVELS: "/levels/view",
  ADD_LEVEL: "/levels/add",
  EDIT_LEVEL: "/levels/edit",

  // CONFIG LEVELS
  VIEW_CONFIG_LEVELS: "/levelConfig/view",
  EDIT_CONFIG_LEVEL: "/levelConfig/edit",
  ADD_CONFIG_LEVEL: "/levelConfig/add",

  //SETTINGS APIS END POINT
  VIEW_TEXTMESSAGES: "/textMessages/view",
  ADD_TEXTMESSAGES: "/textMessages/add",
  EDIT_TEXTMESSAGES: "/textMessages/edit",
  VIEW_PRINTSETTINGS: "/printerSettings",
  VIEW_APPSETTING: "/appSettings/view",
  EDIT_APPSETTING: "/appSettings/edit",
  ADD_APPSETTING: "/appSettings/add",

  // TEMPLATE APIS END POINT
  VIEW_TEMPLATES: "/templates/view",
  ADD_TEMPLATES: "/templates/add",
  EDIT_TEMPLATES: "/templates/edit",
  DELETE_TEMPLATE: "/templates/delete",

  // PHASES APIS END POINTS
  VIEW_PHASES: "/phases/view",
  ADD_PHASES: "/phases/add",
  EDIT_PHASES: "/phases/edit",
  DELETE_PHASES: "/phases/delete",

  // PAGES APIS END POINT
  VIEW_PAGES: "/appPages/view",
  VIEW_ALL_PAGES: "/appPages/viewAll",
  VIEW_ALL_PARENTS_PAGES: "appPages/viewParents",
  VIEW_CHILDREN_FOR_PARENTS: "appPages/viewChildren",
  ADD_PAGES: "/appPages/add",
  EDIT_PAGES: "/appPages/edit",
  DELETE_PAGES: "/appPages/delete",

  // TEMPLATES CONFIG APIS END POINT
  VIEW_TEMPLATES_CONFIG: "/templatesConfig/view",
  ADD_TEMPLATES_CONFIG: "/templatesConfig/add",
  EDIT_TEMPLATES_CONFIG: "/templatesConfig/edit",

  // CONFIG HOME PAGE APIS
  VIEW_HOME_CONFIG_PAGES: "/homeConfig/view",
  VIEW_ALL_HOME_CONFIG_PAGES: "/homeConfig/viewAll",
  VIEW_ALL_HOME_CONFIG_SECTIONS: "/homeConfig/viewSections",
  ADD_HOME_CONFIG_PAGES: "/homeConfig/add",
  EDIT_HOME_CONFIG_PAGES: "/homeConfig/edit",
  DELETE_HOME_CONFIG_PAGES: "/homeConfig/delete",

  //  SUB-PAGE CONFIGS APIS
  VIEW_SUB_PAGE_CONFIG: "/subPageConfig/view",
  ADD_SUB_PAGE_CONFIG: "/subPageConfig/add",
  EDIT_SUB_PAGE_CONFIG: "/subPageConfig/edit",
  DELETE_SUB_PAGE_CONFIG: "/subPageConfig/delete",

  // SUB-PAGE OPTIONS APIS
  VIEW_SUB_PAGE_OPTIONS_CONFIG: "/subPageOptions/view",
  ADD_SUB_PAGE_OPTIONS_CONFIG: "/subPageOptions/add",
  EDIT_SUB_PAGE_OPTIONS_CONFIG: "/subPageOptions/edit",
  DELETE_SUB_PAGE_OPTIONS_CONFIG: "/subPageOptions/delete",

  // ORDERS_API

  VIEW_ALL_ORDERS: "/revelOrders",
  VIEW_PRODUCT_CATEGORIES_ID: "/revelCache/categories",
  VIEW_PRODUCT_CATEGORIES_Parent: "/revelCache/categories/parent",
  VIEW_MODIFIERS: "/revelCache/modifiers",
  ORDER_INFO: "/revelOrderInfo",

  // SETTINGS_MODIFIERS_APIS

  VIEW_APP_SETTING_ID: "/appSettings/view/",
  EDIT_APP_SETTING_ID: "appSettings/edit/",
  DELETE_APP_SETTING_ID: "appSettings/delete/",

  // ITEM_INFO

  VIEW_ITEM_INFO: "revelOrdersItems/view",
  EDIT_ITEM_INFO: "revelOrdersItems/edit",

  //PRINT_APIS

  GET_BARCODE: "https://api.pdf.co/v1/barcode/generate",
  HTML_TO_PDF: "https://api.pdf.co/v1/pdf/convert/from/html",
  PRINT_ORDER: "printOrder",
  VIEW_PRINT_ORDER: "printQueue",

  // TWILIO

  SEND_MESSAGE: "/twilio/sendMessage",
  CHECK_MESSAGE: "/twilio/checkMessages",

  //CALCULATOR_SETTINGS

  GET_CALC_SETTING: "/calcSettings/view",
  ADD_CALC_SETTING: "/calcSettings/add",
  EDIT_CALC_SETTING: "/calcSettings/edit",
  DELETE_CALC_SETTING: "/calcSettings/delete",

  // BAKER_CALC

  ADD_BAKER_CALC: "bakersCalc/add",
  VIEW_BAKER_CALC: "bakersCalc/view",

  // VENUE_CONFIG

  VIEW_VENUE_ROOMS: "/venuesRooms/view",
  ADD_VENUE_ROOMS: "/venuesRooms/add",
  EDIT_VENUE_ROOMS: "/venuesRooms/edit",
  DELETE_VENUE_ROOMS: "/venuesRooms/delete",
  VIEW_ALL_ROOMS: "/venuesRooms/viewAllRooms",

  //Daily ids

  VIEW_DAILY_IDS: "dailyIds/view",
  ADD_DAILY_IDS: "dailyIds/add",
  DELETE_DAILY_IDS: "dailyIds/delete",

  VIEW_DAILY_SORT: "dailySort/view",
  ADD_DAILY_SORT: "dailySort/add",
  DELETE_DAILY_SORT: "dailySort/delete",

  // Update Labels

  EDIT_LABELS: "revelOrdersItems/labels",
};
