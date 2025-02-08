import { isEmpty, isFunction } from "lodash";
import moment from "moment";
import React, { useEffect } from "react";
import { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToken } from "../../api";
import { editOrderInfoApi } from "../../api/orders";
import {
  getbarcodeApi,
  getPdfApi,
  getPrintDetailsApi,
  postPrintOrderApi,
} from "../../api/print";
import { getAppSettingByIDApi, getPrintSettingApi } from "../../api/settings";
import {
  displayErrorToast,
  displaySuccessToast,
} from "../../global/displayToast";
import { getDinningType } from "../../global/helpers";
import { addSingleOrderInfoDetail } from "../../redux/actions/orderActions";
import { updateCurrentPrintSetting } from "../../redux/actions/settingsAction";
import {
  orderOverViewFilterData,
  orderToken,
  orderTypeData,
  setting,
} from "../../utils/StaticData";
import CakeSpinner from "../common/CakeSpinner";
import { htmlOrder } from "../orderOverviewCategory/HTML_template/htmlOrder";

const displayDateTimeFormat = "ddd. MMMM MM, YYYY [at] h:mma";

const Details = (props) => {
  const { orderData, orderCategoryObj, handleChangeOrderInfo } = props;
  const user = useSelector((state) => state.user);
  const [printLoader, setPrintLoader] = useState(false);
  const [printDetails, setPrintDetails] = useState([]);
  const [returnLoader, setReturnLoader] = useState(false);

  const { currentPrintSetting } = useSelector((state) => state.settings);

  const [printDateLoader, setPrintDateLoader] = useState(false);

  const dispatch = useDispatch();

  let userFullName = "";
  if (user && user.data) {
    const { first_name, last_name } = user.data;
    userFullName = first_name + " " + last_name;
  }

  const getPrintSetting = async () => {
    const PrintOptionRes = await getPrintSettingApi();
    if (PrintOptionRes) {
      const res = await getAppSettingByIDApi(setting.printer_setting_ID);
      const printData = PrintOptionRes.data.find(
        (val) => val.id === +res?.data?.settings?.id
      );
      dispatch(updateCurrentPrintSetting(printData));
    }
  };

  useEffect(() => {
    if (isEmpty(currentPrintSetting)) {
      getPrintSetting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrintSetting]);

  const getBarcode = async (postData) => {
    setToken(orderToken);
    const res = await getbarcodeApi(postData);
    if (res && res.status === 200) {
      const barcode = res.url;
      const htmlPageWithBarCode = htmlOrder(
        orderData,
        barcode,
        orderCategoryObj
      );
      return htmlPageWithBarCode;
    } else {
      displayErrorToast("API getting failed for barcode");
    }
  };

  const getPdf = async (postData) => {
    setToken(orderToken);
    const res = await getPdfApi(postData);
    if (res && res.status === 200) {
      return res.url;
    } else {
      displayErrorToast("API getting failed for pdf");
    }
  };

  const sendPrintOrder = async (postData) => {
    setToken(orderToken);
    const res = await postPrintOrderApi(postData);
    if (res) {
      displaySuccessToast(res);
      getPrintOrderDetails();
    } else {
      displayErrorToast("Print error! See admin");
    }
  };

  const handlePrint = async () => {
    setPrintLoader(true);
    var postData = {
      name: "barcode.png",
      value: orderData?.local_id,
      type: "Code128",
      async: false,
    };
    const htmlPagewithBarCode = await getBarcode(postData);
    if (!isEmpty(htmlPagewithBarCode)) {
      var postHtmlData = {
        html: htmlPagewithBarCode,
        name: "bakeflow-print-order/id",
        margins: "30px 10px 30px 10px",
        paperSize: "Letter",
        orientation: "Portrait",
        printBackground: true,
        header: "",
        footer: "",
        mediaType: "print",
        async: false,
        encrypt: false,
      };
      const pdfURL = await getPdf(postHtmlData);
      if (!isEmpty(pdfURL)) {
        var postDataToPrinter = {
          data: pdfURL,
          copies: currentPrintSetting.copies,
          id: orderData?.local_id,
          printer_setting: currentPrintSetting.id,
        };
        await sendPrintOrder(postDataToPrinter);
      }
    }
    setPrintLoader(false);
  };

  const getPrintOrderDetails = async () => {
    setToken(orderToken);
    setPrintDateLoader(true);
    const res = await getPrintDetailsApi(orderData?.local_id);
    if (res && res.success) {
      setPrintDetails(res?.data);
    } else {
      displayErrorToast("Print error! See admin");
      setPrintDetails([]);
    }
    setPrintDateLoader(false);
  };

  useEffect(() => {
    getPrintOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function formatPrintDate(messageDate) {
    const date = new Date(messageDate);
    const day = date.toLocaleDateString("en-us", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    return `${day} at ${time}`;
  }

  const returnOrder = async () => {
    setReturnLoader(true);

    const payload = {
      // ...orderInfoDetail,
      fulfilled: false,
      returned: true,
    };

    const res = await editOrderInfoApi(payload, orderData?.id);

    if (res && res.success === true) {
      dispatch(
        addSingleOrderInfoDetail({
          id: orderData?.id,
          ...res.data,
        })
      );
      if (isFunction(handleChangeOrderInfo)) {
        handleChangeOrderInfo(orderData?.id, res?.data);
      }
      displaySuccessToast(res?.message);
    }
    setReturnLoader(false);
  };

  return (
    <div>
      <section className="my-4">
        <h2 className="text-secondary h4 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2">
          Order Details
        </h2>
        <div className="d-flex gap-5">
          <div className="text-grey fw-normal pb-4 border-0">
            <div>Order #: {orderData?.local_id}</div>
            <div> Revel Order #: {orderData?.id}</div>
            <div>
              Type:{" "}
              {orderData?.dining_option === 4 ||
              orderData?.order_totals?.event_type ===
                orderOverViewFilterData.largeEvent
                ? "Delivery"
                : "Pickup"}
            </div>
            <div>Dining type: {getDinningType(orderData?.dining_option)}</div>
            <div>
              Order Type:{" "}
              {orderData?.is_invoice
                ? orderTypeData.order
                : orderTypeData.invoice}
            </div>
          </div>
          <div className="text-grey fw-normal py-4 border-0 flex-grow-1">
            <div>
              Placed:{" "}
              {moment(orderData?.created_date).format(displayDateTimeFormat)}
            </div>
            <div>
              Last Modified:{" "}
              {moment(orderData?.updated_date).format(displayDateTimeFormat)}
            </div>
            <div>Order Fullfilled: Sat. April 22, 2022 at 12:53pm</div>
            <div>Fullfilled by: {userFullName}</div>
          </div>
        </div>
      </section>
      <section className="my-4">
        <h2 className="text-secondary h4 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2">
          Print Order
        </h2>
        <div className="d-flex gap-4">
          <div className="pb-4 ">
            <Button className="px-4 py-0" onClick={handlePrint}>
              {printLoader && (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="mr-2"
                />
              )}
              <span> Print </span>
            </Button>
          </div>
          {printDateLoader ? (
            <CakeSpinner className="m-2" height="40px" />
          ) : !isEmpty(printDetails) ? (
            <div className="pb-4 flex-grow-1">
              {printDetails.map((printData) => (
                <div>
                  Printed:&nbsp; {formatPrintDate(printData?.date)}
                  {" , "}
                  <span>State:&nbsp; {printData?.state} </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="pb-4 flex-grow-1">
              Printed : This order has not been printed
            </div>
          )}
        </div>
      </section>

      <section className="my-4">
        <h2 className="text-secondary h4 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2">
          Change Order Date
        </h2>
        <div className="pb-4 d-flex gap-4 order-date">
          <Form.Group>
            <Form.Control type="date" placeholder=""></Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Control type="time"></Form.Control>
          </Form.Group>
          <Button className="px-4 py-0">Send</Button>
        </div>
      </section>

      <section className="my-4">
        <h2 className="text-secondary h4 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2">
          Return Order
        </h2>
        <p>
          If a delivery is unsuccessful and returned to the store, mark it as
          returned
        </p>
        <Button className="px-4 py-0" onClick={() => returnOrder()}>
          {returnLoader && (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="mr-2"
            />
          )}
          <span> Return </span>
        </Button>
      </section>
    </div>
  );
};

export default Details;
