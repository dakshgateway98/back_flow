import React, { useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import moment from "moment";
import { displayErrorToast } from "../../global/displayToast";
import { getDiffOfDate } from "../../global/helpers";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { isEmpty } from "lodash";

const Calender = ({ setSelectedDates, calenderDates, showSubpage }) => {
  const location = useLocation();
  const { pathname } = location;
  const pathArray = pathname.split("/");
  const isReports = pathArray.includes("reports");
  const { allTemplates } = useSelector((state) => state.templates);

  const getdatesArray = () => {
    let datesArray = [];
    for (let i = 0; i < calenderDates.days; i++) {
      const date = moment(calenderDates.startDate, "YYYY-MM-DD")
        .add(i, "days")
        .format("YYYY-MM-DD");
      datesArray.push(date);
    }
    return datesArray;
  };

  const handleSelectedDatesDom = () => {
    const calenderRowArray = document.querySelectorAll(
      ".fc-scrollgrid-sync-table"
    )[0]?.children[1]?.children;
    const selectedDatesArray = getdatesArray();
    [...calenderRowArray].forEach((row) => {
      [...row?.children].forEach((col) => {
        const elementDate = col?.dataset?.date;
        // if ([...col.classList].includes("fc-day-today")) {
        //   col.classList.remove("fc-day-today");
        // }
        if (selectedDatesArray.includes(elementDate)) {
          col.style.backgroundColor = "#f0f0f0";
        }
      });
    });
  };

  useEffect(() => {
    handleSelectedDatesDom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isBakersCalc = () => {
    if (!isEmpty(allTemplates)) {
      return (
        showSubpage?.templateId ===
        allTemplates.find((item) => item.template === "baker_calculator.jsx").id
      );
    }
  };

  function CheckWeekend(startDate, endDate) {
    let day1 = startDate.getDay();
    let day2 = endDate.getDay();

    if (day1 === 6 && day2 === 1) {
      return true;
    }
    return false;
  }

  const handleSelectDate = (info) => {
    setSelectedDates({
      selectedStartDate: moment(info.startStr).format("YYYY-MM-DD"),
      selectedEndDate: moment(info.endStr).format("YYYY-MM-DD"),
    });
  };

  const handleDateSelection = (info) => {
    if (info) {
      const diff = getDiffOfDate(
        moment(info.startStr).format("YYYY-MM-DD"),
        moment(info.endStr).format("YYYY-MM-DD")
      );
      if (isReports) {
        if (diff < 2) {
          handleSelectDate(info);
        } else {
          displayErrorToast("Please select only date", 3000);
        }
      }
      if (isBakersCalc()) {
        if (CheckWeekend(info.start, info.end)) {
          if (diff < 3) {
            handleSelectDate(info);
          } else {
            displayErrorToast("Please select only weekend", 3000);
          }
        } else {
          if (diff < 2) {
            handleSelectDate(info);
          } else {
            displayErrorToast("Please select only one date or weekends", 3000);
          }
        }
      } else {
        if (diff < 8) {
          handleSelectDate(info);
        } else {
          displayErrorToast("Please select number of dates less than 8", 3000);
        }
      }
    } else {
      displayErrorToast("Please select dates", 3000);
    }
  };
  return (
    <div>
      <FullCalendar
        selectLongPressDelay={0}
        longPressDelay={0}
        initialDate={calenderDates.startDate || moment().format("YYYY-MM-DD")}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable={true}
        select={(info) => handleDateSelection(info)}
        dayHeaderFormat={{ weekday: "long" }}
        firstDay={2}
        headerToolbar={{
          start: "prev",
          center: "title",
          end: "next",
        }}
        buttonText={{ prev: "previous", next: "next" }}
        height={520}
        datesSet={() => handleSelectedDatesDom()}
      />
    </div>
  );
};

export default Calender;
