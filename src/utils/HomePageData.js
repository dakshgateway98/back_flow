import { routesConstant } from "../routes/routeConstant";

export const adminPages = [
  {
    pageid: 1,
    template: "ConfigureUser",
    pagename: "Config Users",
    route: "/configure-user",
  },
  {
    pageid: 2,
    template: "CreateLevels",
    pagename: "Create Levels",
    route: "/create-levels",
  },
  {
    pageid: 3,
    template: "ConfigLevels",
    pagename: "Config Levels",
    route: routesConstant.ConfigureLevel,
  },
  {
    pageid: 4,
    template: "Phases",
    pagename: "Phases",
    route: routesConstant.Phases,
  },
  {
    pageid: 5,
    template: "Pages",
    pagename: "Pages",
    route: routesConstant.Pages,
  },
  {
    pageid: 6,
    template: "Templates",
    pagename: "Templates",
    route: routesConstant.Templates,
  },
  {
    pageid: 6,
    template: "Config Home Page",
    pagename: "Config Home Page",
    route: routesConstant.configHomePage,
  },
  {
    pageid: 7,
    template: "Settings",
    pagename: "Settings",
    route: routesConstant.Settings,
  },
  {
    pageid: 8,
    template: "Config Category Pages",
    pagename: "Config Category Pages",
    route: routesConstant.configCategoryPage,
  },
  {
    pageid: 9,
    template: "Config Templates Option",
    pagename: "Config Templates Option",
    route: routesConstant.ConfigTemplateOption,
  },
];

export const reportPages = [
  {
    pageid: 1,
    display_name: "Order Review",
  },
  {
    pageid: 2,
    display_name: "Cake Labels",
  },
  {
    pageid: 3,
    display_name: "Board Labels",
  },
  {
    pageid: 4,
    display_name: "Venue Config",
  },
];

export const customerServicePage = [
  {
    pageid: 1,
    template: "OrderOverview",
    pagename: "Order Overview",
    route: "/order-overview",
  },
];

// export const HomeData = [
//   {
//     sectionName: "Admin",
//     pages: [
//       {
//         pageid: 1,
//         template: "ConfigureUser",
//         pagename: "Config Users",
//         route: "/configure-user",
//       },
//       {
//         pageid: 2,
//         template: "CreateLevels",
//         pagename: "Create Levels",
//         route: "/create-levels",
//       },
//       {
//         pageid: 3,
//         template: "ConfigLevels",
//         pagename: "Config Levels",
//         route: routesConstant.ConfigureLevel,
//       },
//       {
//         pageid: 4,
//         template: "Phases",
//         pagename: "Phases",
//         route: routesConstant.Phases,
//       },
//       {
//         pageid: 5,
//         template: "Pages",
//         pagename: "Pages",
//         route: routesConstant.Pages,
//       },
//       {
//         pageid: 6,
//         template: "Templates",
//         pagename: "Templates",
//         route: routesConstant.Templates,
//       },
//       {
//         pageid: 6,
//         template: "Config Home Page",
//         pagename: "Config Home Page",
//         route: routesConstant.configHomePage,
//       },
//       {
//         pageid: 7,
//         template: "Settings",
//         pagename: "Settings",
//         route: routesConstant.Settings,
//       },
//       {
//         pageid: 8,
//         template: "Config Category Pages",
//         pagename: "Config Category Pages",
//         route: routesConstant.configCategoryPage,
//       },
//       {
//         pageid: 9,
//         template: "Config Templates Option",
//         pagename: "Config Templates Option",
//         route: routesConstant.ConfigTemplateOption,
//       },
//     ],
//   },
//   {
//     sectionName: "Product Pages",
//     pages: [
//       {
//         pageid: 26,
//         template: "CakeBalls",
//         pagename: "Cake Balls",
//       },
//       {
//         pageid: 20,
//         template: "Cupcakes",
//         pagename: "Cupcakes",
//       },
//       {
//         pageid: 17,
//         template: "standardCakes",
//         pagename: "Standard Cakes",
//         route: `/product/${"standard-cakes"}`,
//       },
//     ],
//   },
//   {
//     sectionName: "Reports",
//     pages: [
//       {
//         pageid: 6,
//         template: "OrderReview",
//         pagename: "Order Review",
//         route: "/order-review",
//       },
//     ],
//   },
//   {
//     sectionName: "Customer Service",
//     pages: [
//       {
//         pageid: 7,
//         template: "OrderOverview",
//         pagename: "Order Overview",
//         route: "/order-overview",
//       },
//     ],
//   },
// ];

export const UserData = [
  {
    name: "Sam Smith",
    username: "ssmith",
    level: 1,
    active: true,
    id: 1,
  },
  {
    name: "Tom Holland",
    username: "tholland",
    level: 2,
    active: false,
    id: 2,
  },
];
