import { isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToken } from "../../api";
import { getTextMessagesApi } from "../../api/settings";
import { checkMessageApi, sendMessageApi } from "../../api/twilio";
import {
  displayErrorToast,
  displaySuccessToast,
} from "../../global/displayToast";
import { formatPhoneNumber } from "../../global/helpers";
import {
  getMessageHistory,
  updateSettingsMessage,
} from "../../redux/actions/settingsAction";
import { orderToken } from "../../utils/StaticData";
import CakeSpinner from "../common/CakeSpinner";

const Communication = (props) => {
  const { orderData } = props;
  const { settingsMessageList, messageHistory, messageHistoryFlag } =
    useSelector((state) => state.settings);
  const [settingsLoader, setSettingsLoader] = useState(false);
  const [historyLoader, setHistoryLoader] = useState(false);
  const [sendMessageLoader, setSendMessageLoader] = useState(null);

  const dispatch = useDispatch();

  function formatMessageDate(messageDate) {
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

  const getSettingsData = async () => {
    setSettingsLoader(true);
    const res = await getTextMessagesApi();
    if (res && res.success === true) {
      dispatch(updateSettingsMessage(res.data));
    }
    setSettingsLoader(false);
  };

  const getMessageData = async (orderId) => {
    setHistoryLoader(true);
    const res = await checkMessageApi(orderId);
    if (res && res.success === true) {
      dispatch(getMessageHistory(res.data, res.status));
    }
    setHistoryLoader(false);
  };

  useEffect(() => {
    if (messageHistoryFlag === 0) {
      getMessageData(orderData?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageHistoryFlag]);

  useEffect(() => {
    if (isEmpty(settingsMessageList)) {
      getSettingsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsMessageList]);

  const sendMessage = async (postData, textId) => {
    setToken(orderToken);
    setSendMessageLoader(textId);
    const res = await sendMessageApi(postData);
    if (res && res.success) {
      displaySuccessToast("Message sent successfully");
      getMessageData(orderData?.id);
    } else {
      displayErrorToast("error! Can not send message");
    }
    setSendMessageLoader(null);
  };

  const handleSave = async (messageData, textId) => {
    if (sendMessageLoader) {
      displayErrorToast("Wait until the first message is sent");
    } else {
      const checkedPrimaryNumber = document.getElementById(
        `primary-${textId}`
      ).checked;
      const ckeckedSecondaryNumber = document.getElementById(
        `secondary-${textId}`
      ).checked;

      const phone_number = [];
      if (checkedPrimaryNumber) {
        phone_number.push(orderData?.customer?.phone_number);
      }
      if (ckeckedSecondaryNumber) {
        if (orderData?.shopify_data) {
          phone_number.push(
            orderData?.dining_option === 2
              ? orderData?.shopify_data?.shipping?.phone.replace(/\D/g, "")
              : orderData?.shopify_data?.billing?.phone.replace(/\D/g, "")
          );
        }
      }

      if (!isEmpty(phone_number)) {
        const postData = {
          message: messageData || "",
          numbers: phone_number,
          order_id: orderData.id,
          text_id: textId,
        };
        await sendMessage(postData, textId);
      } else {
        displayErrorToast("Please check any of the contact");
      }
    }
  };

  return (
    <Row className="justify-content-left">
      <Col sm={12}>
        <div className="mb-3">
          <h6 className="text-secondary h4 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2">
            Send Messages
          </h6>
          {settingsLoader ? (
            <CakeSpinner />
          ) : (
            <Table responsive className="editable-table ">
              <colgroup>
                <col width={200} />
                <col width={100} />
                <col width={100} />
                <col width={60} />
              </colgroup>
              <thead className="border-0">
                <tr>
                  <th className="text-grey fw-bold">Send Text</th>
                  <th className="text-center">
                    <div className="mb-4">
                      <div className="text-grey fw-bold">Primary Contact</div>
                      <hr className="divider thick" />
                      <div className="text-grey fw-normal">{`${orderData.customer.first_name} ${orderData.customer.last_name}`}</div>
                      <div className="text-grey fw-normal">
                        {formatPhoneNumber(orderData.customer.phone_number)}
                      </div>
                    </div>
                    <div className="text-grey fw-bold">Primary</div>
                  </th>
                  <th className="text-center">
                    <div className="mb-4">
                      <div className="text-grey fw-bold">Secondary Contact</div>
                      <hr className="divider thick" />
                      <div className="text-grey fw-normal">
                        {orderData?.shopify_data
                          ? orderData?.dining_option === 2
                            ? orderData?.shopify_data?.shipping?.name
                            : orderData?.shopify_data?.billing?.name
                          : "N/A"}
                      </div>
                      <div className="text-grey fw-normal">
                        {orderData?.shopify_data
                          ? orderData?.dining_option === 2
                            ? formatPhoneNumber(
                                orderData?.shopify_data?.shipping?.phone
                              )
                            : formatPhoneNumber(
                                orderData?.shopify_data?.billing?.phone
                              )
                          : "N/A"}
                      </div>
                    </div>
                    <div className="text-grey fw-bold">Secondary</div>
                  </th>
                  <th className="text-center text-grey fw-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {settingsMessageList.map((data) => (
                  <tr key={data.id}>
                    <td className="py-4">
                      <div className="text-grey fw-bold">{data.title}</div>
                      <div className="text-grey fw-normal">{data.content}</div>
                    </td>
                    <td className="text-center py-4">
                      <Form.Group>
                        <Form.Check
                          label=""
                          id={`primary-${data.id}`}
                          type="checkbox"
                          className="custom-input-box checkbox-24"
                          name={"item1"}
                        />
                      </Form.Group>
                    </td>
                    <td className="text-center py-4">
                      <Form.Group>
                        <Form.Check
                          disabled={!orderData?.shopify_data}
                          label=""
                          id={`secondary-${data.id}`}
                          type="checkbox"
                          className="custom-input-box checkbox-24"
                          name={"item1"}
                        />
                      </Form.Group>
                    </td>

                    <td className="text-center py-4">
                      <Button
                        onClick={() => handleSave(data?.content, data?.id)}
                        className="px-4 py-0"
                      >
                        <span> Send </span>
                        {sendMessageLoader === data.id && (
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="mr-2"
                          />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          <section className="mt-4">
            <h2 className="text-secondary h4 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2">
              Communication History
            </h2>
            {historyLoader ? (
              <CakeSpinner />
            ) : (
              <Table responsive className="editable-table custom-table-striped">
                <colgroup>
                  <col width={300} />
                  <col width={120} />
                  <col width={120} />
                  <col width={195} />
                  <col width={60} />
                </colgroup>
                <thead className="border-0">
                  <tr>
                    <th>Message</th>
                    <th>Contact</th>
                    <th>Number</th>
                    <th className="text-center ">Date and time</th>
                    <th>type</th>
                  </tr>
                </thead>
                <tbody>
                  {!isEmpty(messageHistory) ? (
                    messageHistory.map((data) => {
                      return (
                        <React.Fragment key={data.text_id}>
                          {settingsMessageList.map(
                            (settingdata) =>
                              settingdata.id === data.text_id && (
                                <tr key={settingdata.id}>
                                  <td>{settingdata?.content}</td>
                                  <td>Primary</td>
                                  <td>{formatPhoneNumber(data.number)} </td>

                                  <td className="text-center">
                                    {formatMessageDate(data.date)}
                                  </td>
                                  <td>Auto</td>
                                </tr>
                              )
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <th colSpan={12} className="text-center">
                        No communication history available
                      </th>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </section>
        </div>
      </Col>
    </Row>
  );
};

export default Communication;
