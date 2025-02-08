export const filterData = {
  all: 0,
  selected: 1,
  notSelected: 2,
  partiallySelected: 3,
};

export const tierCakesData = {
  all: 0,
  tier_1: 1,
  tier_2: 2,
  tier_3: 3,
};

export const cakesFlavorSizeForBakerData = {
  all: 0,
  other: 1,
};

export const cakesShapeData = {
  all: 0,
  round: 1,
  square: 2,
  sheet: 3,
};

export const cakesFlavorData = {
  all: 0,
  white: 1,
  colored: 2,
  vegan: 3,
};

export const fillingsAndIcedData = {
  all: 0,
  other: 1,
};

export const initialProductionFilterState = {
  boards: filterData.all,
  baked: filterData.all,
  completed: filterData.all,
  tierCakes: tierCakesData.all,
  shapeCakes: cakesShapeData.all,
  flavorCakes: cakesFlavorData.all,
  fillings: fillingsAndIcedData.all,
  iced: fillingsAndIcedData.all,
};

export const initialCommonFilterState = {
  completed: filterData.all,
  boxed: filterData.all,
};

export const initialBakedFilterState = {
  baked: filterData.all,
  shapeCakes: cakesShapeData.all,
  flavorCakes: cakesFlavorSizeForBakerData.all,
  sizeCakes: cakesFlavorSizeForBakerData.all,
};

export const bakedFilterData = [
  {
    name: "baked",
    checkboxes: [
      { id: `baked-${filterData.all}`, displayName: "Show All" },
      { id: `baked-${filterData.selected}`, displayName: "Show Baked" },
      {
        id: `baked-${filterData.notSelected}`,
        displayName: "Show Not-Baked",
      },
    ],
  },

  {
    name: "flavorCakes",
    checkboxes: [
      {
        id: `cake_flavour-${cakesFlavorSizeForBakerData.all}`,
        displayName: "Show All Flavor",
      },
      {
        id: `cake_flavour-${cakesFlavorSizeForBakerData.other}`,
        dropdownValues: [],
      },
    ],
  },
  {
    name: "sizeCakes",
    checkboxes: [
      {
        id: `cake_size-${cakesFlavorSizeForBakerData.all}`,
        displayName: "Show All Cake Size",
      },
      {
        id: `cake_size-${cakesFlavorSizeForBakerData.other}`,
        dropdownValues: [],
      },
    ],
  },
  {
    name: "shapeCakes",
    checkboxes: [
      {
        id: `shapeCakes_baker-${cakesFlavorSizeForBakerData.all}`,
        displayName: "Show All Cake Shape",
      },
      {
        id: `shapeCakes_baker-${cakesFlavorSizeForBakerData.other}`,
        dropdownValues: [],
      },
    ],
  },
];

export const commonFilterData = [
  {
    name: "completed",
    checkboxes: [
      { id: `completed-${filterData.all}`, displayName: "Show All" },
      { id: `completed-${filterData.selected}`, displayName: "Show Completed" },
      {
        id: `completed-${filterData.notSelected}`,
        displayName: "Show Not-Completed",
      },
    ],
  },
  {
    name: "boxed",
    checkboxes: [
      { id: `boxed-${filterData.all}`, displayName: "Show All" },
      { id: `boxed-${filterData.selected}`, displayName: "Show Boxed" },
      { id: `boxed-${filterData.notSelected}`, displayName: "Show Not-Boxed" },
    ],
  },
  {
    name: "cakeAssembled",
    checkboxes: [
      { id: `cakeAssembled-${filterData.all}`, displayName: "Show All" },
      { id: `cakeAssembled-${filterData.selected}`, displayName: "Show Ready" },
      {
        id: `cakeAssembled-${filterData.notSelected}`,
        displayName: "Show Pending",
      },
    ],
  },
];

export const productionFiltersData = [
  {
    column: 1,
    data: [
      {
        name: "boards",
        checkboxes: [
          { id: `boards-${filterData.all}`, displayName: "Show All" },
          { id: `boards-${filterData.selected}`, displayName: "Boards DONE" },
          {
            id: `boards-${filterData.notSelected}`,
            displayName: "Boards NOT done",
          },
        ],
      },
      {
        name: "baked",
        checkboxes: [
          { id: `baked-${filterData.all}`, displayName: "Show All" },
          { id: `baked-${filterData.selected}`, displayName: "Baked" },
          { id: `baked-${filterData.notSelected}`, displayName: "NOT Baked" },
        ],
      },
      {
        name: "completed",
        checkboxes: [
          { id: `completed-${filterData.all}`, displayName: "Show All" },
          { id: `completed-${filterData.selected}`, displayName: "Completed" },
          {
            id: `completed-${filterData.partiallySelected}`,
            displayName: "Partially Completed",
          },
          {
            id: `completed-${filterData.notSelected}`,
            displayName: "Not Started",
          },
        ],
      },
    ],
  },
  {
    column: 2,
    data: [
      {
        name: "tierCakes",
        checkboxes: [
          { id: `tierCakes-${tierCakesData.all}`, displayName: "Show All" },
          {
            id: `tierCakes-${tierCakesData.tier_1}`,
            displayName: "Single Tier Cakes",
          },
          {
            id: `tierCakes-${tierCakesData.tier_2}`,
            displayName: "2 Tier Cakes",
          },
          {
            id: `tierCakes-${tierCakesData.tier_3}`,
            displayName: "3+ Tier Cakes",
          },
        ],
      },
      {
        name: "shapeCakes",
        checkboxes: [
          { id: `shapeCakes-${cakesShapeData.all}`, displayName: "Show All" },
          { id: `shapeCakes-${cakesShapeData.round}`, displayName: "Round" },
          { id: `shapeCakes-${cakesShapeData.square}`, displayName: "Square" },
          { id: `shapeCakes-${cakesShapeData.sheet}`, displayName: "Sheet" },
        ],
      },
      {
        name: "flavorCakes",
        checkboxes: [
          { id: `flavorCakes-${cakesFlavorData.all}`, displayName: "Show All" },
          {
            id: `flavorCakes-${cakesFlavorData.white}`,
            displayName: "White-Iced",
          },
          {
            id: `flavorCakes-${cakesFlavorData.colored}`,
            displayName: "Colored-Iced",
          },
          {
            id: `flavorCakes-${cakesFlavorData.vegan}`,
            displayName: "Vegan-Iced",
          },
        ],
      },
    ],
  },
  {
    column: 3,
    data: [
      {
        name: "fillings",
        checkboxes: [
          {
            id: `fillings-${fillingsAndIcedData.all}`,
            displayName: "Show All Fillings",
          },
          { id: `fillings-${fillingsAndIcedData.other}`, dropdownValues: [] },
        ],
      },
      {
        name: "iced",
        checkboxes: [
          {
            id: `iced-${fillingsAndIcedData.all}`,
            displayName: "Show Iced All",
          },
          { id: `iced-${fillingsAndIcedData.other}`, dropdownValues: [] },
        ],
      },
    ],
  },
];
