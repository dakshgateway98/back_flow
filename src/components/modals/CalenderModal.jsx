import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Calender from "../common/Calender";
import moment from "moment";
import { useSelector } from "react-redux";
import { isEmpty } from "lodash";

const CalenderModal = (props) => {
  const { onSave, showSubpage, calenderDates, ...rest } = props;
  const { allTemplates } = useSelector((state) => state.templates);

  const [selectedDates, setSelectedDates] = useState({
    selectedStartDate: "",
    selectedEndDate: "",
  });

  const { selectedStartDate, selectedEndDate } = selectedDates;

  const isCatGridTemplate = () => {
    if (!isEmpty(allTemplates)) {
      return (
        showSubpage?.templateId ===
        allTemplates.find(
          (item) => item.template === "cupcake_template_145.jsx"
        ).id
      );
    }
  };

  const updatesDates = (startDate) => {
    let date = moment(startDate);
    const day = date.clone().day();
    if (day === 0 || day === 1) {
      date = date.clone().subtract(3, "days");
    }

    const updatedStartDate = date
      .clone()
      .startOf("week")
      .add(2, "days")
      .format("YYYY-MM-DD");
    const updatedEndDate = date
      .clone()
      .endOf("week")
      .add(3, "days")
      .format("YYYY-MM-DD");

    return { updatedStartDate, updatedEndDate };
  };

  const onHandleTimeFrame = (timeStamp) => {
    const currentDate = moment();
    switch (timeStamp) {
      case "today": {
        let startDate = currentDate.format("YYYY-MM-DD");
        let endDate = currentDate.clone().add(1, "days").format("YYYY-MM-DD");
        if (isCatGridTemplate()) {
          const { updatedStartDate, updatedEndDate } = updatesDates(startDate);
          startDate = updatedStartDate;
          endDate = updatedEndDate;
        }
        onSave(startDate, endDate);
        break;
      }

      case "tomorrow": {
        let startDate = currentDate.clone().add(1, "days").format("YYYY-MM-DD");
        let endDate = currentDate.clone().add(2, "days").format("YYYY-MM-DD");
        if (isCatGridTemplate()) {
          const { updatedStartDate, updatedEndDate } = updatesDates(startDate);
          startDate = updatedStartDate;
          endDate = updatedEndDate;
        }
        onSave(startDate, endDate);
        break;
      }

      case "yesterday": {
        let startDate = currentDate
          .clone()
          .subtract(1, "days")
          .format("YYYY-MM-DD");
        let endDate = currentDate.format("YYYY-MM-DD");
        if (isCatGridTemplate()) {
          const { updatedStartDate, updatedEndDate } = updatesDates(startDate);
          startDate = updatedStartDate;
          endDate = updatedEndDate;
        }
        onSave(startDate, endDate);
        break;
      }
      case "thisWeek": {
        let date = moment(currentDate);
        const day = date.clone().day();
        if (day === 0 || day === 1) {
          date = date.clone().subtract(3, "days");
        }
        const startDate = date
          .clone()
          .startOf("week")
          .add(2, "days")
          .format("YYYY-MM-DD");
        const endDate = date
          .clone()
          .endOf("week")
          .add(3, "days")
          .format("YYYY-MM-DD");
        onSave(startDate, endDate);

        break;
      }
      case "lastWeek": {
        let date = moment(currentDate);
        const day = date.clone().day();
        if (day === 0 || day === 1) {
          date = date.clone().subtract(3, "days");
        }
        const startDate = date
          .clone()
          .startOf("week")
          .subtract(1, "week")
          .add(2, "days")
          .format("YYYY-MM-DD");
        const endDate = date
          .clone()
          .endOf("week")
          .subtract(1, "week")
          .add(3, "days")
          .format("YYYY-MM-DD");
        onSave(startDate, endDate);
        break;
      }
      case "Saturday": {
        let date = currentDate.clone().day(6);
        const startDate = date.format("YYYY-MM-DD");
        const endDate = date.add(1, "days").format("YYYY-MM-DD");
        onSave(startDate, endDate);
        break;
      }
      case "Sat-Sun": {
        const date = currentDate.clone().day(6);
        const startDate = date.format("YYYY-MM-DD");
        const endDate = date.add(2, "days").format("YYYY-MM-DD");
        onSave(startDate, endDate);
        break;
      }
      default:
        break;
    }
  };

  const onSaveHandler = () => {
    if (isCatGridTemplate()) {
      const { updatedStartDate, updatedEndDate } =
        updatesDates(selectedStartDate);
      onSave(updatedStartDate, updatedEndDate);
    } else {
      onSave(selectedStartDate, selectedEndDate);
    }
  };

  const isBakersCalc = () => {
    if (!isEmpty(allTemplates)) {
      return (
        showSubpage?.templateId ===
        allTemplates.find((item) => item.template === "baker_calculator.jsx").id
      );
    }
  };

  return (
    <Modal
      {...rest}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Body className="custom-calender">
        <Calender {...{ setSelectedDates, calenderDates, showSubpage }} />
      </Modal.Body>
      <Modal.Footer style={{ border: "none" }}>
        <Button
          className="px-3 flex-grow-1"
          onClick={() => onHandleTimeFrame("today")}
        >
          Today
        </Button>
        <Button
          className="px-3 flex-grow-1"
          onClick={() => onHandleTimeFrame("tomorrow")}
        >
          Tomorrow
        </Button>
        <Button
          className="px-3 flex-grow-1"
          onClick={() => onHandleTimeFrame("yesterday")}
        >
          Yesterday
        </Button>
        <Button
          className="px-3 flex-grow-1"
          onClick={() => onHandleTimeFrame("thisWeek")}
          disabled={isBakersCalc()}
        >
          This Week
        </Button>
        <Button
          className="px-3 flex-grow-1"
          onClick={() => onHandleTimeFrame("lastWeek")}
          disabled={isBakersCalc()}
        >
          Last Week
        </Button>
        <Button
          className="px-3 flex-grow-1"
          onClick={() => onHandleTimeFrame("Saturday")}
        >
          Saturday
        </Button>
        <Button
          className="px-3 flex-grow-1"
          onClick={() => onHandleTimeFrame("Sat-Sun")}
        >
          Sat-Sun
        </Button>
        <Button
          className="px-3 flex-grow-1"
          onClick={() => onSaveHandler(selectedStartDate, selectedEndDate)}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CalenderModal;
