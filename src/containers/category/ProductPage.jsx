import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clone, isEmpty, isEqual } from "lodash";

//apis
import { setToken } from "../../api";
import { getPagesApi } from "../../api/pages";
import { getPhasesApi } from "../../api/phases";
import { getTemplatesApi } from "../../api/templates";
import { getProductsCategoriesIdApi } from "../../api/orders";
import { getAllSubPagesConfigApi } from "../../api/configCategory";

//redux
import { updatePages } from "../../redux/actions/pageActions";
import { getUpdatePhases } from "../../redux/actions/phaseAction";
import { addProductCategories } from "../../redux/actions/orderActions";
import { updateAllTemplates } from "../../redux/actions/templateActions";
import { updateAllSubPageConfig } from "../../redux/actions/subPageConfigActions";

//helpers and static datas
import { displayErrorToast } from "../../global/displayToast";
import {
  getCheckboxFilteredOrder,
  isSearchValueIncluded,
} from "../../global/helpers";
import {
  filterData,
  orderToken,
  pageId,
  phasesId,
} from "../../utils/StaticData";
import {
  cakesFlavorSizeForBakerData,
  initialBakedFilterState,
  initialCommonFilterState,
  initialProductionFilterState,
} from "../../utils/filterData";

//hooks
import useCallOrder from "../../hooks/useCallOrder";
import useCalenderSearchQuery from "../../hooks/useCalenderSearchQuery";

//components
import Orders from "../../components/templates/Orders";
import CatGrid from "../../components/templates/CatGrid";
import Hourly from "../../components/templates/Hourly";
import BakerList from "../../components/templates/BakerList";
import Production from "../../components/templates/Production";
import SearchInput from "../../components/common/SearchInput";
import OrderLayout from "../../components/common/OrderLayout";
import FilterModal from "../../components/modals/FilterModal";
import ProductionFilterModal from "../../components/modals/ProductionFilterModal";
import BakerFilterModal from "../../components/modals/BakerFilterModal";
import Fillings from "../../components/templates/Fillings";
import FillingsSetting from "../../components/templates/FillingsSetting";
import PublicNotes from "../../components/common/PublicNotes";
import { getConfigLevelsApi } from "../../api/configureLevel";
import { getUpdatedConfigLevels } from "../../redux/actions/userlevelsActions";
import Decorator from "../../components/templates/Decorator";

const ProductPage = () => {
  const [loader, setLoader] = useState(false);
  const [productCatName, setProductCatName] = useState("");
  const [showSubpage, setShowSubPage] = useState({});
  const [filterModalShow, setFilterModalShow] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [categoryOrders, setCategoryOrders] = useState({});
  const [currentFilters, setCurrentFilters] = useState(
    initialCommonFilterState
  );
  const [productionFilters, setProductionFilters] = useState(
    initialProductionFilterState
  );
  const [currentdropDownValue, setCurrentDropDownValue] = useState({});
  const [currentdropDownValueForBaker, setCurrentDropDownValueForBaker] =
    useState({});

  const [filterDropdown, setFilterDropdown] = useState([
    {
      filter: "fillings",
      filterValue: [],
    },
    {
      filter: "iced",
      filterValue: [],
    },
  ]);
  const [bakerFilterDropDown, setBakerFilterDropDown] = useState([
    {
      filter: "flavorCakes",
      filterValue: [],
    },
    {
      filter: "sizeCakes",
      filterValue: [],
    },
    {
      filter: "shapeCakes",
      filterValue: [],
    },
  ]);
  const [bakerFilter, setBakerFilter] = useState(initialBakedFilterState);

  const { token, data: userData } = useSelector((state) => state.user);
  const { pages } = useSelector((state) => state.pages);
  const { allTemplates } = useSelector((state) => state.templates);
  const { allSubPagesConfig } = useSelector((state) => state.subPageConfig);
  const { productCategories } = useSelector((state) => state.orders);
  const { phasesList } = useSelector((state) => state.phases);
  const { configLevels } = useSelector((state) => state.userlevels);
  const [searchParams, setSearchParams] = useSearchParams();

  const dispatch = useDispatch();

  const params = useParams();
  const { childPage, parentPage } = params;

  const [calenderDates, setCalenderDates] = useCalenderSearchQuery(showSubpage);
  const [ordersByDate, ordersInfo, itemInfo, setItemInfo, setOrdersInfo] =
    useCallOrder(
      calenderDates,
      setLoader,
      allSubPagesConfig,
      pages,
      allTemplates
    );

  const getupdatedItem = (orderDetail, productRevelsId) => {
    const updatedItem = orderDetail?.items
      ? orderDetail?.items.filter((item) => {
          if (item?.cake_items) {
            let cakeItems = item?.cake_items.filter((cake_item) => {
              const check =
                productRevelsId.includes((cake_item?.product?.id).toString()) ||
                productRevelsId.includes((item?.product?.id).toString());
              return check;
            });
            if (isEmpty(cakeItems)) {
              return false;
            } else {
              return true;
            }
          } else {
            const check = productRevelsId.includes(
              (item?.product?.id).toString()
            );
            return check;
          }
        })
      : [];
    return updatedItem;
  };

  const filterByCategory = (orders) => {
    const allRevelsId = [];
    allSubPagesConfig.forEach((subPageConfig) => {
      if (subPageConfig.page_id === showSubpage?.subPageId) {
        allRevelsId.push(subPageConfig?.revel_ids);
      }
    });

    const productRevelsId = allRevelsId.flat().filter((ele) => ele !== "");

    const ordersByCategory = Object.entries(orders).map(
      ([orderDate, orderData]) => {
        let filteredOrders = [];
        if (orderData?.orders) {
          filteredOrders = Object.entries(orderData?.orders).map(
            ([orderId, orderDetail]) => {
              return [
                orderId,
                {
                  ...orderDetail,
                  items: getupdatedItem(orderDetail, productRevelsId),
                },
              ];
            }
          );
        }
        const removedEmptyItemOrderfilteredOrders = filteredOrders.filter(
          ([orderId, orderDetail]) => !isEmpty(orderDetail?.items)
        );

        return [
          orderDate,
          {
            ...orderData,
            orders: Object.fromEntries(removedEmptyItemOrderfilteredOrders),
          },
        ];
      }
    );
    const filteredOrderObj = Object.fromEntries(ordersByCategory);
    setCategoryOrders(filteredOrderObj);
  };

  useEffect(() => {
    if (ordersByDate && !isEmpty(showSubpage)) {
      filterByCategory(ordersByDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersByDate, showSubpage.subPageId]);

  const handleDefaultFilter = (queryParamObject) => {
    let tempCurrentFilters = {};
    if (showSubpage.subPageId === pageId.decorator) {
      tempCurrentFilters = {
        completed: +searchParams.get("completed") || filterData.all,
        boxed: +searchParams.get("boxed") || filterData.all,
        cakeAssembled: +searchParams.get("cakeAssembled") || filterData.all,
      };
    } else {
      tempCurrentFilters = {
        completed: +searchParams.get("completed") || filterData.all,
        boxed: +searchParams.get("boxed") || filterData.all,
      };
    }
    let currentParams = {}; 
    for (let [key, value] of searchParams.entries()) {
      if (["completed", "boxed", "cakeAssembled"].includes(key))
        currentParams[key] = +value;
      else currentParams[key] = value;
    }
    if (queryParamObject.startDate && queryParamObject.days) {
      const updatedParams = { ...queryParamObject, ...tempCurrentFilters };
      if (!isEqual(currentParams, updatedParams)) {
        setSearchParams({ ...updatedParams });
      }
    }
    setCurrentFilters({ ...tempCurrentFilters });
  };

  const handleProductionFilterUsingSearchQuery = (queryParamObject) => {
    let tempCurrentFilters = {};
    let tempProductionFilterObj = {};

    tempProductionFilterObj = {
      boards: +searchParams.get("boards") || filterData.all,
      baked: +searchParams.get("baked") || filterData.all,
      completed: +searchParams.get("completed") || filterData.all,
      tierCakes: +searchParams.get("tierCakes") || filterData.all,
      shapeCakes: +searchParams.get("shapeCakes") || filterData.all,
      flavorCakes: +searchParams.get("flavorCakes") || filterData.all,
      fillings:
        searchParams.get("fillings") && searchParams.get("fillings") !== "0"
          ? cakesFlavorSizeForBakerData.other
          : cakesFlavorSizeForBakerData.all,
      iced:
        searchParams.get("iced") && searchParams.get("iced") !== "0"
          ? cakesFlavorSizeForBakerData.other
          : cakesFlavorSizeForBakerData.all,
    };

    tempCurrentFilters = {
      boards: +searchParams.get("boards") || filterData.all,
      baked: +searchParams.get("baked") || filterData.all,
      completed: +searchParams.get("completed") || filterData.all,
      tierCakes: +searchParams.get("tierCakes") || filterData.all,
      shapeCakes: +searchParams.get("shapeCakes") || filterData.all,
      flavorCakes: +searchParams.get("flavorCakes") || filterData.all,
      fillings: searchParams.get("fillings")
        ? searchParams.get("fillings")
        : filterData.all,
      iced: searchParams.get("iced")
        ? searchParams.get("iced")
        : filterData.all,
    };

    let tempCurrDropFilterProduction = {};

    if (tempCurrentFilters.iced !== cakesFlavorSizeForBakerData.all) {
      tempCurrDropFilterProduction = {
        ...tempCurrDropFilterProduction,
        iced: tempCurrentFilters.iced,
      };
    }
    if (tempCurrentFilters.fillings !== cakesFlavorSizeForBakerData.all) {
      tempCurrDropFilterProduction = {
        ...tempCurrDropFilterProduction,
        fillings: tempCurrentFilters.fillings,
      };
    }

    if (queryParamObject.startDate && queryParamObject.days) {
      setSearchParams({ ...queryParamObject, ...tempCurrentFilters });
    }

    setCurrentDropDownValue({ ...clone(tempCurrDropFilterProduction) });
    setProductionFilters(tempProductionFilterObj);
  };

  const handleBakerFilterUsingSearchQuery = (queryParamObject) => {
    let tempCurrentFilters = {};
    let tempBakerFilterObj = {};

    tempBakerFilterObj = {
      baked: +searchParams.get("baked") || filterData.all,
      shapeCakes:
        searchParams.get("shapeCakes") && searchParams.get("shapeCakes") !== "0"
          ? cakesFlavorSizeForBakerData.other
          : cakesFlavorSizeForBakerData.all,
      flavorCakes:
        searchParams.get("flavorCakes") &&
        searchParams.get("flavorCakes") !== "0"
          ? cakesFlavorSizeForBakerData.other
          : cakesFlavorSizeForBakerData.all,
      sizeCakes:
        searchParams.get("sizeCakes") && searchParams.get("sizeCakes") !== "0"
          ? cakesFlavorSizeForBakerData.other
          : cakesFlavorSizeForBakerData.all,
    };

    tempCurrentFilters = {
      baked: +searchParams.get("baked") || filterData.all,
      shapeCakes: searchParams.get("shapeCakes")
        ? searchParams.get("shapeCakes")
        : filterData.all,
      flavorCakes: searchParams.get("flavorCakes")
        ? searchParams.get("flavorCakes")
        : filterData.all,
      sizeCakes: searchParams.get("sizeCakes")
        ? searchParams.get("sizeCakes")
        : filterData.all,
    };
    let tempCurrDropFilterBaker = { ...currentdropDownValueForBaker };

    if (tempCurrentFilters.flavorCakes !== cakesFlavorSizeForBakerData.all) {
      tempCurrDropFilterBaker = {
        ...tempCurrDropFilterBaker,
        flavorCakes: tempCurrentFilters.flavorCakes,
      };
    }
    if (tempCurrentFilters.sizeCakes !== cakesFlavorSizeForBakerData.all) {
      tempCurrDropFilterBaker = {
        ...tempCurrDropFilterBaker,
        sizeCakes: tempCurrentFilters.sizeCakes,
      };
    }
    if (tempCurrentFilters.shapeCakes !== cakesFlavorSizeForBakerData.all) {
      tempCurrDropFilterBaker = {
        ...tempCurrDropFilterBaker,
        shapeCakes: tempCurrentFilters.shapeCakes,
      };
    }

    if (queryParamObject.startDate && queryParamObject.days) {
      setSearchParams({ ...queryParamObject, ...tempCurrentFilters });
    }

    setCurrentDropDownValueForBaker({ ...clone(tempCurrDropFilterBaker) });

    setBakerFilter(tempBakerFilterObj);
  };

  const updateFilterFromSearchQuery = () => {
    const queryParamObject = {
      startDate: searchParams.get("startDate"),
      days: searchParams.get("days"),
    };
    switch (showSubpage.subPageId) {
      case pageId.production:
        handleProductionFilterUsingSearchQuery(queryParamObject);
        break;
      case pageId.baker:
        handleBakerFilterUsingSearchQuery(queryParamObject);
        break;
      default:
        handleDefaultFilter(queryParamObject);
        break;
    }
  };

  useEffect(() => {
    if (showSubpage.subPageId) {
      updateFilterFromSearchQuery();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, showSubpage.subPageId]);

  const getAllSubPagesConfig = async () => {
    setToken(token);
    const res = await getAllSubPagesConfigApi();
    if (res && res.success === true) {
      dispatch(updateAllSubPageConfig(res.data));
    }
  };

  const handleSort = (subPages) =>
    subPages.sort((a, b) => {
      if (a?.sort !== b?.sort) return a?.sort - b?.sort;
      else
        return a?.display_name
          .replace(/\s/g, "")
          .localeCompare(b?.display_name.replace(/\s/g, ""));
    });

  const changeString = (text) => {
    const tempstring = text.replace(/-/g, " ");
    return tempstring;
  };

  const handleShowSubPage = (pages, configLevels) => {
    const strChild = changeString(childPage);
    const strParent = changeString(parentPage);

    const tempParentpage = pages.find(
      (page) => page.display_name.toLowerCase() === strParent.toLowerCase()
    );

    const tempShowSubPage = pages.find(
      (page) =>
        page.display_name.toLowerCase() === strChild.toLowerCase() &&
        page.sub_page === tempParentpage.id
    );

    const currentLevelId = userData?.level;
    const currentConfigLevel = configLevels.find(
      (configLevel) => configLevel.id === currentLevelId
    );
    const currentAccessLevel = currentConfigLevel
      ? currentConfigLevel?.access
      : null;

    if (tempShowSubPage?.sub_page) {
      const tempSubPages = pages
        .filter((page) => page?.sub_page === tempShowSubPage?.sub_page)
        .filter((page) => {
          if (currentAccessLevel) {
            return Object.entries(currentAccessLevel).some(
              ([accessPageId, accessValue]) =>
                +accessPageId === +page?.id && accessValue
            );
          }
          return false;
        });

      const tempProductCatName = pages.find(
        (page) => page.id === tempShowSubPage?.sub_page
      )?.display_name;

      setProductCatName(tempProductCatName);
      setShowSubPage({
        subPages: handleSort(tempSubPages),
        templateId: tempShowSubPage?.template_id,
        subPageName: tempShowSubPage?.display_name,
        subPageId: tempShowSubPage?.id,
      });
    } else {
      const tempSubPages = pages.filter(
        (page) => page?.sub_page === tempShowSubPage?.id
      );

      const tempProductCatName = pages.find(
        (page) => page.display_name === strChild
      )?.display_name;

      setProductCatName(tempProductCatName);

      const sortedSubPages = handleSort(tempSubPages);
      setShowSubPage({
        subPages: sortedSubPages,
        templateId: sortedSubPages[0]?.template_id,
        subPageName: sortedSubPages[0]?.display_name,
        subPageId: sortedSubPages[0]?.id,
      });
    }
  };

  const getPages = async () => {
    setToken(token);
    const PagesRes = await getPagesApi();
    const ConfigRes = await getConfigLevelsApi();
    if (
      PagesRes &&
      PagesRes.success === true &&
      ConfigRes &&
      ConfigRes.success === true
    ) {
      handleShowSubPage(PagesRes.data, ConfigRes.data);
      dispatch(updatePages(PagesRes.data));
      dispatch(getUpdatedConfigLevels(ConfigRes.data));
    }
  };

  const getAllTemplates = async () => {
    setToken(token);
    const res = await getTemplatesApi();
    if (res && res.success === true) {
      dispatch(updateAllTemplates(res.data));
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

  const getPhasesData = async () => {
    setToken(token);
    const res = await getPhasesApi();

    if (res && res.success === true) {
      dispatch(getUpdatePhases(res.data));
    }
  };

  const callProductPagesAPIs = async () => {
    setLoader(true);
    if (isEmpty(allSubPagesConfig)) {
      await getAllSubPagesConfig();
    }
    if (isEmpty(pages) && isEmpty(configLevels)) {
      await getPages();
    } else {
      handleShowSubPage(pages, configLevels);
    }

    if (isEmpty(allTemplates)) {
      await getAllTemplates();
    }
    if (isEmpty(productCategories)) {
      await getProductCategoriesById();
    }
    if (isEmpty(phasesList)) {
      await getPhasesData();
    }
  };

  useEffect(() => {
    callProductPagesAPIs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchFilterOrders = useCallback(
    (searchValue) => {
      const searchFilterOrders = Object.entries(categoryOrders).map(
        ([orderDate, orderData]) => {
          const filteredOrders = Object.entries(orderData.orders).filter(
            ([orderId, orderDetail]) => {
              return (
                (orderDetail?.customer &&
                  (isSearchValueIncluded(
                    orderDetail?.customer?.first_name,
                    searchValue
                  ) ||
                    isSearchValueIncluded(
                      orderDetail?.customer?.last_name,
                      searchValue
                    ) ||
                    isSearchValueIncluded(
                      orderDetail?.customer?.first_name +
                        " " +
                        orderDetail?.customer?.last_name,
                      searchValue
                    ))) ||
                (orderDetail?.call_name &&
                  isSearchValueIncluded(orderDetail?.call_name, searchValue)) ||
                (orderDetail?.local_id &&
                  isSearchValueIncluded(orderDetail?.local_id, searchValue)) ||
                (orderDetail?.id &&
                  isSearchValueIncluded(
                    orderDetail?.id.toString(),
                    searchValue
                  )) ||
                (orderDetail?.items &&
                  orderDetail?.items.some((item) =>
                    isSearchValueIncluded(item.product.name, searchValue)
                  )) ||
                orderDetail?.items.some((item) =>
                  item.modifieritems.some((ele) =>
                    isSearchValueIncluded(ele.modifier.name, searchValue)
                  )
                )
              );
            }
          );
          return [
            orderDate,
            {
              ...orderData,
              orders: Object.fromEntries(filteredOrders),
            },
          ];
        }
      );
      return Object.fromEntries(searchFilterOrders);
    },
    [categoryOrders]
  );

  const getCommonFilter = useCallback(
    (orderDetail, key) => {
      const check = orderDetail?.items.some((item) => {
        if (item?.cake_items) {
          return item.cake_items.some(
            (cakeItem) =>
              itemInfo[cakeItem.id] &&
              itemInfo[cakeItem.id]?.item_phase >= phasesId[key]
          );
        } else {
          return (
            itemInfo[item.id] && itemInfo[item.id]?.item_phase >= phasesId[key]
          );
        }
      });
      return check;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemInfo, currentFilters]
  );

  const isCalculateValueForQuantityWiseData = () => {
    if (
      showSubpage?.subPageId === pageId?.decorator ||
      showSubpage?.subPageId === pageId?.production
    ) {
      return true;
    }
    return false;
  };

  const getFilteredOrders = useCallback(
    (orders) => {
      const filterKeys = Object.keys(currentFilters);
      const filteredOrders = orders.filter(([orderId, orderDetail]) => {
        return filterKeys.every((key) => {
          if (!isCalculateValueForQuantityWiseData()) {
            switch (currentFilters[key]) {
              case 0:
                return true;
              case 1:
                return getCommonFilter(orderDetail, key);
              case 2:
                return !getCommonFilter(orderDetail, key);
              default:
                return true;
            }
          }
          return true;
        });
      });
      return filteredOrders;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentFilters, itemInfo]
  );

  const handleCheckboxfilterOrders = useCallback(
    (searchedOrders) => {
      if (!isEmpty(searchedOrders)) {
        const filteredOrders = getCheckboxFilteredOrder(
          searchedOrders,
          getFilteredOrders
        );
        return filteredOrders;
      }
      return searchedOrders;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getFilteredOrders, itemInfo]
  );

  const searchedOrders = useMemo(() => {
    if (!isEmpty(categoryOrders)) {
      return handleSearchFilterOrders(searchText);
    } else {
      return {};
    }
  }, [searchText, categoryOrders, handleSearchFilterOrders]);

  const checkBoxFilterOrders = useMemo(
    () => handleCheckboxfilterOrders(searchedOrders),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchedOrders, handleCheckboxfilterOrders, itemInfo]
  );

  const ordersArray = useMemo(() => {
    const tempOrdersArray = [];
    if (checkBoxFilterOrders) {
      Object.entries(checkBoxFilterOrders).forEach(([orderDate, orderData]) => {
        Object.entries(orderData?.orders).forEach(([orderId, orderDetail]) => {
          tempOrdersArray.push(orderDetail);
        });
      });
    }

    return tempOrdersArray;
  }, [checkBoxFilterOrders]);

  const handleUpdateItems = (items, updatedItemInfo, item_id) => {
    const newItems = items.map((item) => {
      if (item.cake_items && !isEmpty(item.cake_items)) {
        const cakeItems = item.cake_items.map((cake_item) => {
          if (cake_item?.id === item_id) {
            return {
              ...cake_item,
              ...updatedItemInfo,
            };
          }
          return {
            ...cake_item,
          };
        });

        return {
          ...item,
          cake_items: cakeItems,
        };
      } else {
        if (item?.id === item_id) {
          return {
            ...item,
            ...updatedItemInfo,
          };
        }
        return {
          ...item,
        };
      }
    });
    return newItems;
  };

  const handleUpdateCategoryOrder = (updatedItemInfo, itemId) => {
    const updateCategoryOrder = Object.entries(categoryOrders).map(
      ([orderDate, orderData]) => {
        let updatedOrders = [];
        if (orderData?.orders) {
          updatedOrders = Object.entries(orderData?.orders).map(
            ([orderId, orderDetail]) => {
              return [
                orderId,
                {
                  ...orderDetail,
                  items: handleUpdateItems(
                    orderDetail?.items,
                    updatedItemInfo,
                    itemId
                  ),
                },
              ];
            }
          );
        }
        return [
          orderDate,
          { ...orderData, orders: Object.fromEntries(updatedOrders) },
        ];
      }
    );

    let tempItemInfo = { ...itemInfo };

    tempItemInfo = {
      ...itemInfo,
      [itemId]: updatedItemInfo,
    };
    setItemInfo(tempItemInfo);
    setCategoryOrders(Object.fromEntries(updateCategoryOrder));
  };

  const renderSubPage = (onHandleSave) => {
    const template = allTemplates.find(
      (item) => item.id === showSubpage.templateId
    )?.template;

    const subPageConfig = allSubPagesConfig.filter(
      (pageConfig) =>
        parseInt(pageConfig?.page_id) === parseInt(showSubpage?.subPageId)
    );

    const selectedPage = pages.find(
      (page) => page.id === showSubpage?.subPageId
    );

    switch (template?.replace(".jsx", "")) {
      case "decorator":
        return (
          <Decorator
            handleUpdateCategoryOrder={handleUpdateCategoryOrder}
            ordersByDate={checkBoxFilterOrders}
            itemInfo={itemInfo}
            setItemInfo={setItemInfo}
            phasesList={phasesList}
            selectedPage={selectedPage}
            setOrdersInfo={setOrdersInfo}
            ordersInfo={ordersInfo}
            searchParams={searchParams}
          />
        );

      case "cupcake_template_1":
        return (
          <Orders
            handleUpdateCategoryOrder={handleUpdateCategoryOrder}
            ordersByDate={checkBoxFilterOrders}
            itemInfo={itemInfo}
            setItemInfo={setItemInfo}
            phasesList={phasesList}
            selectedPage={selectedPage}
            setOrdersInfo={setOrdersInfo}
            ordersInfo={ordersInfo}
          />
        );

      case "cupcake_template_145":
        return (
          <CatGrid
            calenderDates={calenderDates}
            onSave={onHandleSave}
            orders={checkBoxFilterOrders}
            currentTemplateId={showSubpage.templateId}
            subpagesData={showSubpage.subPages}
            allSubPagesConfig={allSubPagesConfig}
            selectedPageID={showSubpage?.subPageId}
          />
        );

      case "cupcake_template_2":
        return (
          <Hourly
            hourlySubPageConfig={subPageConfig}
            orders={checkBoxFilterOrders}
            ordersInfo={ordersInfo}
          />
        );

      case "baker_template_1":
        return (
          <BakerList
            orders={ordersArray}
            setBakerFilterDropDown={setBakerFilterDropDown}
            bakerSubPageConfig={subPageConfig}
            ordersInfo={ordersInfo}
            itemInfo={itemInfo}
            setItemInfo={setItemInfo}
            bakerFilter={bakerFilter}
            currentdropDownValueForBaker={currentdropDownValueForBaker}
          />
        );
      case "production_template_1":
        return (
          <Production
            ordersByDate={searchedOrders}
            itemInfo={itemInfo}
            setItemInfo={setItemInfo}
            productionFilters={productionFilters}
            setFilterDropdown={setFilterDropdown}
            currentdropDownValue={currentdropDownValue}
          />
        );
      case "baker_calculator":
        return (
          <Fillings
            orders={ordersByDate}
            calenderDates={calenderDates}
            onSave={onHandleSave}
            selectedPageID={showSubpage?.subPageId}
            currentTemplateId={showSubpage.templateId}
          />
        );

      case "baker_calculator_setting":
        return <FillingsSetting selectedPageID={showSubpage?.subPageId} />;

      default:
        return;
    }
  };

  const handleHideSearchInput = () => {
    const hideTemplatesId = [1, 9, 10];
    return hideTemplatesId.includes(+showSubpage?.templateId);
  };

  const isBakerCalcTemplate = () => +showSubpage?.templateId === 9;

  const handleRenderingFilterModals = () => {
    if (!isEmpty(allTemplates)) {
      if (!handleHideSearchInput()) {
        if (
          showSubpage.templateId ===
          allTemplates.find(
            (item) => item.template === "production_template_1.jsx"
          ).id
        ) {
          return (
            <ProductionFilterModal
              show={filterModalShow}
              onHide={() => setFilterModalShow(false)}
              {...{
                searchParams,
                setSearchParams,
                productionFilters,
                setProductionFilters,
                filterDropdown,
                setCurrentDropDownValue,
                currentdropDownValue,
              }}
            />
          );
        } else if (
          showSubpage.templateId ===
          allTemplates.find((item) => item.template === "baker_template_1.jsx")
            .id
        ) {
          return (
            <BakerFilterModal
              show={filterModalShow}
              onHide={() => setFilterModalShow(false)}
              {...{
                bakerFilter,
                setBakerFilter,
                bakerFilterDropDown,
                currentdropDownValueForBaker,
                setCurrentDropDownValueForBaker,
                searchParams,
                setSearchParams,
              }}
            />
          );
        } else {
          return (
            <FilterModal
              show={filterModalShow}
              onHide={() => setFilterModalShow(false)}
              {...{
                currentFilters,
                setCurrentFilters,
                searchParams,
                setSearchParams,
              }}
              selectedPageID={showSubpage?.subPageId}
            />
          );
        }
      }
    }
  };

  return (
    <OrderLayout
      {...{
        loader,
        showSubpage,
        calenderDates,
        setShowSubPage,
        setCalenderDates,
        setFilterModalShow,
        handleRenderingFilterModals,
        itemInfo,
        checkBoxFilterOrders,
      }}
    >
      {(onHandleSave) => (
        <div>
          {!(!isEmpty(allTemplates) && handleHideSearchInput()) && (
            <SearchInput
              onChangeHandler={(e) => {
                const searchValue = e.target.value;
                setSearchText(searchValue);
              }}
              removeSearch={() => {
                setSearchText("");
              }}
              searchText={searchText}
            />
          )}
          {!isBakerCalcTemplate() && (
            <h6 className="text-primary h3 border-bottom-primary borde-primary font-weight-bold mb-3 pb-2">
              {productCatName} : {showSubpage?.subPageName}
            </h6>
          )}
          {renderSubPage(onHandleSave)}
          {!isBakerCalcTemplate() && <PublicNotes showSubpage={showSubpage} />}
        </div>
      )}
    </OrderLayout>
  );
};

export default ProductPage;
