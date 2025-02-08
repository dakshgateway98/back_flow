import React, { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { displayErrorToast } from "../../global/displayToast";
import { getDiffOfDate } from "../../global/helpers";
import Layout from "../common/layout";
import CalenderModal from "../modals/CalenderModal";

const OrderLayout = (props) => {
  const {
    children,
    calenderDates,
    setCalenderDates,
    handleRenderingFilterModals,

    ...layoutProps
  } = props;

  const [calenderModalShow, setCalenderModalShow] = useState(false);

  const onHandleSave = (selectedStartDate, selectedEndDate) => {
    const diff = getDiffOfDate(selectedStartDate, selectedEndDate);
    if (diff) {
      if (diff < 8) {
        setCalenderDates({
          startDate: selectedStartDate,
          endDate: selectedEndDate,
          days: getDiffOfDate(selectedStartDate, selectedEndDate),
        });
        setCalenderModalShow(false);
      } else {
        displayErrorToast("Please select number of dates less than 8", 3000);
      }
    } else {
      displayErrorToast("Please select dates", 3000);
    }
  };

  return (
    <Layout
      {...{
        calenderDates,
        setCalenderModalShow,
        ...layoutProps,
      }}
    >
      <Container>
        {handleRenderingFilterModals && handleRenderingFilterModals()}
        <CalenderModal
          show={calenderModalShow}
          onHide={() => setCalenderModalShow()}
          onSave={onHandleSave}
          calenderDates={calenderDates}
          showSubpage={layoutProps.showSubpage}
        />
        <Row className="justify-content-center">
          <Col>{children(onHandleSave)}</Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default OrderLayout;
