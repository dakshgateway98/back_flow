import React, { useCallback } from "react";
import _ from "lodash";
import { Button, Image } from "react-bootstrap";
import { CalendarIcon, HomeIcon, FilterIcon } from "./icons";
import LogoIcon from "../../assets/images/logo-icon.png";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { displayErrorToast } from "../../global/displayToast";
import moment from "moment";
import { orderOverViewFilterData } from "../../utils/StaticData";
import { useDispatch, useSelector } from "react-redux";
import { removeMessageHistory } from "../../redux/actions/settingsAction";
import { removeOrderItemsInfoDetail } from "../../redux/actions/orderActions";
import { convertToSlug } from "../../global/helpers";

const toRequiredFormat = (date) => moment(date).format("ddd., MMMM DD, YYYY");

const Header = (props) => {
  const {
    onHandleActiveUser,
    onHandleInActiveUser,
    setShowSubPage,
    showSubpage,
    setFilterModalShow,
    setCalenderModalShow,
    calenderDates,
    setShowOrderViewCategory,
    setOrderOverviewFilter,
    orderOverviewFilter,
  } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const params = useParams();
  const { parentPage } = params;
  const pathArray = pathname.split("/");
  const isActiveInActive = pathArray.includes("configure-user");
  const isCategoryProducts = pathArray.includes("product");
  const isOrderOverview = pathArray.includes("order-overview");
  const isReports = pathArray.includes("reports");
  const isOrderOverviewCategory = pathArray.includes("order-overview-category");
  const { orderDetail: orderdetail } = useSelector((state) => state.orders);

  const dispatch = useDispatch();

  const convertToSlugMemoized = _.memoize(convertToSlug);

  const onHandleShowPage = useCallback(
    (templateId, displayName, id) => {
      if (templateId) {
        const slug = convertToSlugMemoized(displayName);
        if (isReports) {
          navigate(`/reports/${parentPage}/${slug}/${location?.search}`);
        } else {
          navigate(`/product/${parentPage}/${slug}/${location?.search}/`);
        }

        setShowSubPage((prev) => ({
          ...prev,
          templateId: templateId,
          subPageName: displayName,
          subPageId: id,
        }));
      } else {
        displayErrorToast("There is no template");
      }
    },
    [
      convertToSlugMemoized,
      isReports,
      setShowSubPage,
      navigate,
      parentPage,
      location?.search,
    ]
  );

  const getDate = () => {
    const getStartDate = toRequiredFormat(calenderDates?.startDate);
    const getEndDate = toRequiredFormat(
      moment(calenderDates?.endDate).subtract(1, "days")
    );
    if (calenderDates.days > 1) {
      return (
        <>
          <div>{getStartDate} - </div>
          <div>{getEndDate}</div>
        </>
      );
    }
    return getStartDate;
  };

  const onHandleModalShowPage = (componentType) => {
    navigate(`/order-overview-category/${componentType}/${orderdetail.id}`);
    setShowOrderViewCategory(componentType);
  };

  const onHandleShowOrderOverview = () => {
    navigate("/order-overview");
    dispatch(removeMessageHistory());
    dispatch(removeOrderItemsInfoDetail());
  };

  return (
    <header className="px-3 py-2 d-flex justify-content-between align-items-center bg-primary">
      <div className="d-flex align-items-center">
        <Link to="/home">
          <HomeIcon color="white" width="32" />
        </Link>
        <div className="vr vertical-border"></div>
        {isActiveInActive && (
          <div className="mx-2">
            <Button
              className="py-0 my-1  px-3 secondary-btn mx-1"
              onClick={onHandleActiveUser}
            >
              Active
            </Button>
            <Button
              className="py-0 my-1 px-3 secondary-btn mx-1"
              onClick={onHandleInActiveUser}
            >
              Inactive
            </Button>
          </div>
        )}
        {(isCategoryProducts || isReports) && (
          <div className="mx-2">
            {showSubpage?.subPages &&
              showSubpage?.subPages.length > 0 &&
              showSubpage?.subPages
                .filter((ele) => ele?.display_name !== undefined)
                .map((page) => (
                  <Button
                    className="py-0 my-1 px-3 secondary-btn mx-1"
                    onClick={() =>
                      onHandleShowPage(
                        page?.template_id,
                        page?.display_name,
                        page?.id
                      )
                    }
                    key={page.id}
                  >
                    {page.display_name}
                  </Button>
                ))}
          </div>
        )}
        {isOrderOverview && (
          <div className="mx-2">
            <Button
              className={`py-0 px-3 secondary-btn mx-1 ${
                orderOverviewFilter === orderOverViewFilterData.activeOrders
                  ? "fw-bold"
                  : ""
              }`}
              onClick={() =>
                setOrderOverviewFilter(orderOverViewFilterData.activeOrders)
              }
            >
              Active Orders
            </Button>
            <Button
              className={`py-0 my-1 px-3 secondary-btn mx-1 ${
                orderOverviewFilter === orderOverViewFilterData.checkedIn
                  ? "fw-bold"
                  : ""
              }`}
              onClick={() =>
                setOrderOverviewFilter(orderOverViewFilterData.checkedIn)
              }
            >
              Checked In
            </Button>
            <Button
              className={`py-0 my-1 px-3 secondary-btn mx-1 ${
                orderOverviewFilter === orderOverViewFilterData.fullfilled
                  ? "fw-bold"
                  : ""
              }`}
              onClick={() =>
                setOrderOverviewFilter(orderOverViewFilterData.fullfilled)
              }
            >
              Fullfilled
            </Button>
            <Button
              className={`py-0 my-1 px-3 secondary-btn mx-1 ${
                orderOverviewFilter === orderOverViewFilterData.all
                  ? "fw-bold"
                  : ""
              }`}
              onClick={() =>
                setOrderOverviewFilter(orderOverViewFilterData.all)
              }
            >
              All Orders
            </Button>
          </div>
        )}
        {isOrderOverviewCategory && (
          <div className="mx-2">
            <Button
              className="py-0 my-1 px-3 secondary-btn mx-1"
              onClick={() => onHandleModalShowPage("fulFill")}
            >
              Fulfill
            </Button>
            <Button
              className="py-0 my-1 px-3 secondary-btn mx-1"
              onClick={() => onHandleModalShowPage("order")}
            >
              Order
            </Button>
            <Button
              className="py-0 my-1 px-3 secondary-btn mx-1"
              onClick={() => onHandleModalShowPage("communication")}
            >
              Communication
            </Button>
            <Button
              className="py-0 my-1 px-3 secondary-btn mx-1"
              onClick={() => onHandleModalShowPage("details")}
            >
              Details
            </Button>
            <Button
              className="py-0 my-1 px-3 secondary-btn mx-1"
              onClick={() => onHandleModalShowPage("log")}
            >
              Log
            </Button>
            <Button
              className="py-0 my-1 px-3 secondary-btn mx-1"
              onClick={() => onHandleShowOrderOverview()}
            >
              Order Overview
            </Button>
          </div>
        )}
      </div>

      <div className="d-flex align-items-center">
        {isCategoryProducts && (
          <>
            <div className="vr vertical-border"></div>
            <Button
              className="d-flex right-button"
              onClick={() => setFilterModalShow((prev) => !prev)}
            >
              <FilterIcon color="white" width="40" />
              <div className="btn-text">Filters</div>
            </Button>
          </>
        )}
        {(isCategoryProducts || isOrderOverview || isReports) && (
          <>
            <div className="vr vertical-border"></div>
            <Button
              className="d-flex right-button ms-2"
              onClick={() => setCalenderModalShow((prev) => !prev)}
            >
              <CalendarIcon color="white" width="40" />
              <div className="btn-text" style={{ width: "220px" }}>
                {getDate()}
              </div>
            </Button>
            <div className="vr vertical-border"></div>
          </>
        )}

        <Link to="">
          <Image src={LogoIcon} />
        </Link>
      </div>
    </header>
  );
};
export default Header;
