import { isEmpty } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { setToken } from "../../api";
import { getConfigLevelsApi } from "../../api/configureLevel";
import { getDailyIdsApi, getDailySortApi } from "../../api/dailyId";
import { getProductsCategoriesIdApi } from "../../api/orders";
import { getPagesApi } from "../../api/pages";
import { getTemplatesApi } from "../../api/templates";
import { getAllRoomsApi, getVenueRoomsApi } from "../../api/venue";
import OrderLayout from "../../components/common/OrderLayout";
import BoardLabel from "../../components/templates/BoardLabel";
import CakeLabels from "../../components/templates/CakeLabels";
import OrderReview from "../../components/templates/OrderReview";
import VenueConfig from "../../components/templates/VenueConfig";
import { displayErrorToast } from "../../global/displayToast";
import useCalenderSearchQuery from "../../hooks/useCalenderSearchQuery";
import useCallOrder from "../../hooks/useCallOrder";
import { addProductCategories } from "../../redux/actions/orderActions";
import { updatePages } from "../../redux/actions/pageActions";
import { updateAllTemplates } from "../../redux/actions/templateActions";
import { getUpdatedConfigLevels } from "../../redux/actions/userlevelsActions";
import {
  updatedAllRooms,
  updateVenueRooms,
} from "../../redux/actions/venueConfigActions";
import { orderToken, reports } from "../../utils/StaticData";

const Reports = () => {
  const [loader, setLoader] = useState(false);
  const [productCatName, setProductCatName] = useState("");

  const [showSubPage, setShowSubPage] = useState({});

  const [dailyIdsOrders, setDailyIdsOrders] = useState({});
  const [dailSortIds, setdailSortIds] = useState([]);

  const { token, data: userData } = useSelector((state) => state.user);
  const { productCategories } = useSelector((state) => state.orders);
  const { allTemplates } = useSelector((state) => state.templates);
  const { allVenueRooms, allRooms } = useSelector((state) => state.venueConfig);
  const { configLevels } = useSelector((state) => state.userlevels);
  const { pages } = useSelector((state) => state.pages);

  const [calenderDates, setCalenderDates] = useCalenderSearchQuery();
  const [ordersByDate, ordersInfo, itemInfo, setItemInfo, setOrdersInfo] =
    useCallOrder(
      calenderDates,
      setLoader,
      null,
      pages,
      allTemplates,
      allVenueRooms,
      allRooms
    );

  const dispatch = useDispatch();

  const params = useParams();
  const { childPage, parentPage } = params;

  const changeString = (text) => {
    const tempstring = text
      .toLowerCase()
      .replace(/-/g, " ")
      .replace(/\b[a-z]/g, function (letter) {
        return letter.toUpperCase();
      })
      .replace(/By/, "by");
    return tempstring;
  };

  const getOrdersData = (ordersByObj) =>
    Object.values(ordersByObj).map((orderData) =>
      Object.values(orderData.orders)
    );

  const getProductCategoriesById = async () => {
    setToken(orderToken);
    const res = await getProductsCategoriesIdApi();
    if (res && res.success === true) {
      dispatch(addProductCategories(res.data));
    } else {
      displayErrorToast(res.message);
    }
  };

  const getAllVenueRooms = async () => {
    setToken(token);
    const res = await getVenueRoomsApi();
    if (res && res.success === true) {
      dispatch(updateVenueRooms(res.data));
    }
  };
  const getAllRooms = async () => {
    setToken(token);
    const res = await getAllRoomsApi();
    if (res && res.success === true) {
      dispatch(updatedAllRooms(res.data));
    }
  };

  const getAllTemplates = async () => {
    setToken(token);
    const res = await getTemplatesApi();
    if (res && res.success === true) {
      dispatch(updateAllTemplates(res.data));
    }
  };

  const callReportsPageApi = async () => {
    setLoader(true);
    if (isEmpty(productCategories)) {
      await getProductCategoriesById();
    }
    if (isEmpty(pages) && isEmpty(configLevels)) {
      await getPages();
    } else {
      handleShowSubPage(pages, configLevels);
    }
    if (isEmpty(allVenueRooms)) {
      await getAllVenueRooms();
    }
    if (isEmpty(allRooms)) {
      await getAllRooms();
    }
    if (isEmpty(allTemplates)) {
      await getAllTemplates();
    }
  };

  useEffect(() => {
    setToken(token);
    const getDailySort = async (date) => {
      const res = await getDailySortApi(date);
      if (res?.success) setdailSortIds(res.data?.sort);
    };

    const getDailyIds = async (date) => {
      const res = await getDailyIdsApi(date);
      if (res && res.success === true) {
        setDailyIdsOrders(res?.data?.orders);
      }
    };

    getDailySort(calenderDates?.startDate);
    getDailyIds(calenderDates?.startDate);
  }, [calenderDates?.startDate, token]);

  useEffect(() => {
    callReportsPageApi();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSort = (subPages) =>
    subPages.sort((a, b) => {
      if (a?.sort !== b?.sort) return a?.sort - b?.sort;
      else
        return a?.display_name
          .replace(/\s/g, "")
          .localeCompare(b?.display_name.replace(/\s/g, ""));
    });

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

  const displayOrdersByDate = useMemo(() => {
    if (!isEmpty(ordersByDate)) {
      const simplifiedOrders = getOrdersData(ordersByDate);
      return simplifiedOrders.flat();
    }
    return [];
  }, [ordersByDate]);

  const renderSubPage = () => {
    const template = allTemplates.find(
      (item) => item.id === showSubPage.templateId
    )?.template;
    switch (template?.replace(".jsx", "")) {
      case "orderReview":
        return (
          <OrderReview
            {...{
              calenderDates,
              displayOrdersByDate,
              ordersByDate,
              ordersInfo,
              setOrdersInfo,
              dailyIdsOrders,
              setDailyIdsOrders,
              setItemInfo,
              dailSortIds,
              setdailSortIds,
            }}
          />
        );
      case "Label":
        if (showSubPage?.subPageId === reports?.boardLabel) {
          return (
            <BoardLabel
              {...{
                dailyIdsOrders,
                showSubPage,
                displayOrdersByDate,
                ordersByDate,
                ordersInfo,
                itemInfo,
                setItemInfo,
                calenderDates,
              }}
            />
          );
        } else {
          return (
            <CakeLabels
              {...{
                dailyIdsOrders,
                showSubPage,
                displayOrdersByDate,
                ordersByDate,
                ordersInfo,
                itemInfo,
                setItemInfo,
                dailSortIds,
              }}
            />
          );
        }
      case "venueConfig":
        return <VenueConfig />;

      default:
        return;
    }
  };

  return (
    <OrderLayout
      {...{
        loader,
        showSubpage: showSubPage,
        setShowSubPage,
        calenderDates,
        setCalenderDates,
      }}
    >
      {() => (
        <div className="mb-3">
          <h6 className="text-primary h3 border-bottom-primary borde-primary font-weight-bold mb-3 pb-2">
            {productCatName} : {showSubPage?.subPageName}
          </h6>
          {renderSubPage()}
        </div>
      )}
    </OrderLayout>
  );
};

export default Reports;
