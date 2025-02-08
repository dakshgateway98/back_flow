import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import moment from "moment";
import { getDiffOfDate } from "../global/helpers";
import { useSelector } from "react-redux";
import { isEmpty } from "lodash";

let startdate = moment().format("YYYY-MM-DD");
let day = 1;
let endDate = moment(startdate).add(day, "days").format("YYYY-MM-DD");

const useCalenderSearchQuery = (showSubpage) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { allTemplates } = useSelector((state) => state.templates);

  const location = useLocation();
  const { pathname } = location;
  const pathArray = pathname.split("/");
  const isReports = pathArray.includes("reports");

  const isBakersCalc = () => {
    if (!isEmpty(allTemplates) && !isEmpty(showSubpage)) {
      return (
        showSubpage?.templateId ===
        allTemplates.find((item) => item.template === "baker_calculator.jsx").id
      );
    }
  };

  if (searchParams.get("startDate")) {
    startdate = searchParams.get("startDate");
  }
  if (searchParams.get("days")) {
    day = searchParams.get("days");
  }

  if (isReports || isBakersCalc()) {
    const date = moment(startdate);
    endDate = date.clone().add(1, "days").format("YYYY-MM-DD");
    day = getDiffOfDate(startdate, endDate);
  }

  const [calenderDates, setCalenderDates] = useState({
    startDate: startdate,
    endDate: moment(startdate).add(day, "days").format("YYYY-MM-DD"),
    days: day,
  });

  useEffect(() => {
    let tempObj = {};

    for (const [key, value] of searchParams.entries()) {
      if (value !== 0) {
        tempObj = { ...tempObj, [key]: value };
      }
    }
    tempObj.startDate = calenderDates.startDate;
    tempObj.days = calenderDates.days;

    const updatedSearchParams = {
      ...tempObj,
      startDate: calenderDates.startDate,
      days: calenderDates.days,
    };

    setSearchParams(updatedSearchParams);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calenderDates, setSearchParams]);

  return [calenderDates, setCalenderDates];
};

export default useCalenderSearchQuery;
