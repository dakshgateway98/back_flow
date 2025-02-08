import { isEmpty, isFunction } from "lodash";
import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { setToken } from "../../api";
import { getItemsInfoByOrderApi } from "../../api/iteminfo";
import { editOrderInfoApi } from "../../api/orders";
import {
  displayErrorToast,
  displaySuccessToast,
} from "../../global/displayToast";
import { getBalDueClassName } from "../../global/helpers";
import {
  addOrderItemsInfoDetail,
  addSingleOrderInfoDetail,
} from "../../redux/actions/orderActions";
import { orderToken, phasesId } from "../../utils/StaticData";
import CakeSpinner from "../common/CakeSpinner";

const FulFill = (props) => {
  const {
    orderCategoryObj,
    orderInfoDetail,
    handleChangeOrderInfo,
    onHide,
    orderData,
  } = props;

  const [isBalanceDue, setIsBalanceDue] = useState(
    orderInfoDetail?.balance_collected || false
  );

  const [fullFilledObj, setFullFilledObj] = useState({});
  const [isFullFilled, setIsFullFilled] = useState(orderInfoDetail?.fulfilled);
  const [OnfullFilledLoader, setOnFullFilledLoader] = useState(false);
  const [itemStateLoader, setItemStateLoader] = useState(false);
  const { orderItemsInfo, orderItemsInfoFlag } = useSelector(
    (state) => state.orders
  );

  const params = useParams();
  const { orderId } = params;
  const dispatch = useDispatch();

  const getItemsInfoByOrder = async (itemsIds) => {
    setToken(orderToken);
    setItemStateLoader(true);
    const res = await getItemsInfoByOrderApi(itemsIds);
    if (res && res.success === true) {
      dispatch(addOrderItemsInfoDetail(res.data, res.status));
    } else {
      displayErrorToast(res.message);
    }
    setItemStateLoader(false);
  };

  useEffect(() => {
    if (!isEmpty(orderData) && orderItemsInfoFlag === 0) {
      const tempItemsIds = orderData?.items.map((item) => item.id);
      getItemsInfoByOrder(tempItemsIds);
    }
    // eslint-disable-next-line
  }, [orderData, orderItemsInfoFlag]);

  const handleFullFilledInitialValue = () => {
    const tempOrderCategory = Object.entries(orderCategoryObj).map(
      ([itemName, items]) => {
        const updatedItems = items.map((item) => {
          if (item?.cake_items) {
            const updatedCakeItems = item.cake_items.map((cakeItem) => ({
              ...cakeItem,
              fullFilledChecked: orderInfoDetail.fulfilled,
            }));
            return {
              ...item,
              cake_items: updatedCakeItems,
            };
          } else {
            return {
              ...item,
              fullFilledChecked: orderInfoDetail.fulfilled,
            };
          }
        });
        return [
          itemName,
          {
            parentFullFilledChecked: orderInfoDetail.fulfilled,
            items: updatedItems,
          },
        ];
      }
    );
    setFullFilledObj(Object.fromEntries(tempOrderCategory));
  };

  useEffect(() => {
    if (!isEmpty(orderInfoDetail) && orderInfoDetail?.balance_collected) {
      setIsBalanceDue(orderInfoDetail?.balance_collected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderInfoDetail?.balance_collected]);

  useEffect(() => {
    if (!isEmpty(orderInfoDetail) && orderInfoDetail?.fulfilled) {
      setIsFullFilled(orderInfoDetail?.fulfilled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderInfoDetail?.fulfilled]);

  useEffect(() => {
    if (!isEmpty(orderCategoryObj)) {
      handleFullFilledInitialValue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCategoryObj, orderInfoDetail.fulfilled]);

  const calulateTotalQuantity = (items) => {
    return items.reduce((acc, item) => {
      acc = acc + item?.quantity;
      return acc;
    }, 0);
  };

  const totalItemQuantity = () => {
    if (!isEmpty(orderCategoryObj)) {
      let sum = 0;
      Object.entries(orderCategoryObj).forEach(([itemName, items]) => {
        sum += calulateTotalQuantity(items);
      });
      return sum;
    }
    return 0;
  };

  const handleOnChangeBalanceDue = async (e) => {
    let { id } = orderInfoDetail;
    setIsBalanceDue(e.target.checked);

    const payload = {
      // ...orderInfoData,
      balance_collected: e.target.checked,
    };

    setToken(orderToken);
    if (!id) {
      id = orderId;
    }
    const res = await editOrderInfoApi(payload, id);
    if (res && res.success === true) {
      dispatch(
        addSingleOrderInfoDetail({
          id,
          ...res.data,
        })
      );
      if (isFunction(handleChangeOrderInfo)) {
        handleChangeOrderInfo(id, res?.data);
      }
    }
  };

  useEffect(() => {
    if (!isEmpty(fullFilledObj)) {
      const checkIsFullFilled = Object.entries(fullFilledObj).every(
        ([itemName, itemData]) => itemData.parentFullFilledChecked
      );
      setIsFullFilled(checkIsFullFilled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullFilledObj]);

  const handleChildrenCheck = (e, selectedItemName, itemId) => {
    const tempFullOrderObj = Object.entries(fullFilledObj).map(
      ([itemName, itemData]) => {
        if (itemName === selectedItemName) {
          let updatedItemDataObj = {};
          const updatedItems = itemData.items.map((item) => {
            if (item?.cake_items) {
              const updatedCakeItems = item.cake_items.map((cakeItem) => {
                if (cakeItem.id === itemId) {
                  return {
                    ...cakeItem,
                    fullFilledChecked: e.target.checked,
                  };
                } else return cakeItem;
              });
              return {
                ...item,
                cake_items: updatedCakeItems,
              };
            } else {
              if (item.id === itemId) {
                return {
                  ...item,
                  fullFilledChecked: e.target.checked,
                };
              } else return item;
            }
          });
          if (
            updatedItems.every((item) =>
              item?.cake_items
                ? item?.cake_items.every(
                    (cakeItem) => cakeItem.fullFilledChecked
                  )
                : item.fullFilledChecked
            )
          ) {
            updatedItemDataObj = {
              parentFullFilledChecked: true,
              items: updatedItems,
            };
          } else {
            updatedItemDataObj = {
              parentFullFilledChecked: false,
              items: updatedItems,
            };
          }
          return [itemName, updatedItemDataObj];
        } else return [itemName, itemData];
      }
    );

    setFullFilledObj(Object.fromEntries(tempFullOrderObj));
  };

  const handleParentChecks = (e, selectedItemName) => {
    const tempFullOrderObj = Object.entries(fullFilledObj).map(
      ([itemName, itemData]) => {
        if (itemName === selectedItemName) {
          const updatedItems = itemData.items.map((item) => {
            if (item?.cake_items) {
              const updatedCakeItems = item.cake_items.map((cakeItem) => ({
                ...cakeItem,
                fullFilledChecked: e.target.checked,
              }));
              return {
                ...item,
                cake_items: updatedCakeItems,
              };
            } else {
              return {
                ...item,
                fullFilledChecked: e.target.checked,
              };
            }
          });
          return [
            itemName,
            { parentFullFilledChecked: e.target.checked, items: updatedItems },
          ];
        } else return [itemName, itemData];
      }
    );
    setFullFilledObj(Object.fromEntries(tempFullOrderObj));
  };

  const handleFullFilled = async () => {
    setOnFullFilledLoader(true);
    let { id } = orderInfoDetail;

    const payload = {
      // ...orderInfoData,
      fulfilled: isFullFilled,
    };

    if (!id) {
      id = orderId;
    }
    const res = await editOrderInfoApi(payload, id);
    if (res && res.success === true) {
      dispatch(
        addSingleOrderInfoDetail({
          id,
          ...res.data,
        })
      );
      if (isFunction(handleChangeOrderInfo)) {
        handleChangeOrderInfo(id, res?.data);
      }
      if (isFunction(onHide)) {
        onHide();
      }
      displaySuccessToast(res?.message);
    }
    setOnFullFilledLoader(false);
  };

  const checkItemStatus = (itemId) => {
    if (orderItemsInfo?.item_phase) {
      return orderItemsInfo.item_phase >= phasesId.completed;
    } else {
      const haveItem = orderItemsInfo && orderItemsInfo[itemId];
      return (
        haveItem && orderItemsInfo[itemId].item_phase >= phasesId.completed
      );
    }
  };

  const renderItem = (item, itemName) => {
    return (
      <React.Fragment key={item.id}>
        <tr>
          <td className="ps-4">
            <div className="d-flex ">
              <Form.Group className="me-3">
                <Form.Check
                  label=""
                  type="checkbox"
                  checked={item?.fullFilledChecked || false}
                  id={`${itemName}-${item.id}`}
                  onChange={(e) => handleChildrenCheck(e, itemName, item.id)}
                  className="custom-input-box checkbox-24"
                  name="item-checkbox"
                />
              </Form.Group>
              {item?.quantity} X {item?.product?.name}
            </div>
          </td>
          <td>
            <span
              className={`badge  p-2   ${
                checkItemStatus(item.id)
                  ? "badge-success"
                  : "badge-outline-secondary"
              } `}
            >
              {checkItemStatus(item.id) ? "Completed" : "pending"}
            </span>
          </td>
          <td>5/22 at 4:22pm</td>
          <td>Neveah</td>
        </tr>
      </React.Fragment>
    );
  };

  return (
    <>
      <div className="modal-table fullfill">
        {itemStateLoader ? (
          <CakeSpinner />
        ) : (
          <Table responsive className="grid-table-striped">
            <colgroup>
              <col style={{ minWidth: "250px" }} />
              <col width={150} />
              <col width={180} />
              <col width={130} />
            </colgroup>
            <thead className="border-0">
              <tr>
                <th>Items</th>
                <th>Status</th>
                <th>Completed at</th>
                <th>Completed by</th>
              </tr>
            </thead>
            <tbody className="order-overview-category-table-body">
              {Object.entries(fullFilledObj).map(
                ([itemName, { parentFullFilledChecked, items }]) => (
                  <React.Fragment key={itemName}>
                    <tr>
                      <td className="d-flex">
                        <Form.Group className="me-3">
                          <Form.Check
                            label=""
                            type="checkbox"
                            id={itemName}
                            checked={parentFullFilledChecked || false}
                            onChange={(e) => handleParentChecks(e, itemName)}
                            className="custom-input-box checkbox-24"
                            name="item-category-checkbox"
                          />
                        </Form.Group>
                        {!isEmpty(items[0]) ? (
                          items[0]?.cake_items ? (
                            <div className="fw-bold text-grey">
                              {items[0].product.name} -
                              {calulateTotalQuantity(items)}
                            </div>
                          ) : (
                            <div className="fw-bold text-grey">
                              {itemName} - {calulateTotalQuantity(items)}
                            </div>
                          )
                        ) : (
                          <div className="fw-bold text-grey">
                            {itemName} - {calulateTotalQuantity(items)}
                          </div>
                        )}
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    {!isEmpty(items) &&
                      items.map((item) =>
                        item?.cake_items
                          ? item?.cake_items.map((cakeItem) =>
                              renderItem(cakeItem, itemName)
                            )
                          : renderItem(item, itemName)
                      )}
                  </React.Fragment>
                )
              )}
            </tbody>
          </Table>
        )}
      </div>
      <div className="bottom-section">
        <hr />
        <Row>
          <Col lg={3}>
            <div className="mb-1">
              <span className="fw-600">
                Total Item(s): {totalItemQuantity()}{" "}
              </span>
            </div>
            <div className="mb-1">
              <span className="fw-600">Fulfill Status:</span>{" "}
              {orderInfoDetail?.fulfilled ? "fulfilled" : "unfulfilled"}
            </div>
          </Col>
          <Col lg={3}>
            <div className="mb-1">
              <span className="fw-600">Order Balance:</span>{" "}
              <span
                className={`py-1 px-2 ${getBalDueClassName(
                  orderData?.remaining_due
                )}`}
              >
                {orderData?.remaining_due === 0
                  ? "Paid"
                  : `$${orderData?.remaining_due}`}
              </span>
            </div>
            <div
              className={
                orderData?.remaining_due === 0 ? "d-none" : "d-flex mb-0"
              }
            >
              <span className="fw-600 me-2">Collect Balance Due:</span>{" "}
              <Form.Group>
                <Form.Check
                  label=""
                  type="checkbox"
                  checked={isBalanceDue}
                  id={`bal_due-${orderInfoDetail?.id}`}
                  onChange={(e) => handleOnChangeBalanceDue(e)}
                  className="custom-input-box checkbox-24"
                  name="balance_due"
                />
              </Form.Group>
            </div>
            <div className="mb-1">
              <span className="fw-600">Order Total:</span>
              <span className="ms-1">{`$${Number(
                orderData?.final_total
              ).toFixed(2)}`}</span>
            </div>
          </Col>
          <Col
            lg={6}
            className="d-flex align-items-center justify-content-center"
          >
            <Button
              className="py-3 px-5 w-50 btn-success"
              disabled={
                !(
                  (orderData?.remaining_due === 0 || isBalanceDue) &&
                  isFullFilled
                )
              }
              onClick={() => handleFullFilled()}
            >
              {OnfullFilledLoader && (
                <Spinner
                  className="me-2"
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              )}
              Fulfill Order
            </Button>
          </Col>
        </Row>
        <hr />
        <div className="mb-0">Confirm that all items are being handed out.</div>
      </div>
    </>
  );
};

export default FulFill;
