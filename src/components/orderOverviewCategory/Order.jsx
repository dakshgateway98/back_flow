import { isEmpty } from "lodash";
import React from "react";
import { Col, Row, Table } from "react-bootstrap";
import { getBalDueClassName } from "../../global/helpers";
const Order = (props) => {
  const { orderCategoryObj, orderInfoDetail, orderData } = props;

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

  const renderItem = (item) => {
    return (
      <React.Fragment key={item.id}>
        <tr>
          <td className="ps-5">{`${item?.quantity} x ${item?.product?.name}`}</td>
        </tr>
        {!isEmpty(item?.modifieritems) &&
          item?.modifieritems.map((modiItem) => (
            <tr key={modiItem.id}>
              <td
                style={{ paddingLeft: "80px" }}
              >{`${modiItem?.qty} x ${modiItem?.modifier?.name}`}</td>
            </tr>
          ))}
      </React.Fragment>
    );
  };

  return (
    <>
      <div className="modal-table fullOrder ">
        <Table responsive className="grid-table-striped">
          <thead className="border-0">
            <tr>
              <th className="fw-bold">Items:</th>
            </tr>
          </thead>
          <tbody className="order-overview-category-table-body">
            {Object.entries(orderCategoryObj).map(([itemName, items]) => (
              <React.Fragment key={itemName}>
                <tr>
                  {!isEmpty(items[0]) ? (
                    items[0]?.cake_items ? (
                      <td className="fw-bold">
                        {items[0].product.name} - {calulateTotalQuantity(items)}
                      </td>
                    ) : (
                      <td className="fw-bold">
                        {itemName} - {calulateTotalQuantity(items)}
                      </td>
                    )
                  ) : (
                    <td className="fw-bold">
                      {itemName} - {calulateTotalQuantity(items)}
                    </td>
                  )}
                </tr>
                {!isEmpty(items) &&
                  items.map((item) =>
                    item?.cake_items
                      ? item?.cake_items.map((cakeItem) => renderItem(cakeItem))
                      : renderItem(item)
                  )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="bottom-section">
        <hr />
        <Row>
          <Col lg={3}>
            <div className="fw-600 p-2">
              Total Item(s) : {totalItemQuantity()}
            </div>
            <div className="p-2">
              <span className="fw-600">Fulfill status : </span>
              {orderInfoDetail?.fulfilled ? "fulfilled" : "unfulfilled"}
            </div>
          </Col>
          <Col lg={3}>
            <div className=" p-2">
              <span className="fw-600">Order Balance :</span>{" "}
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
            <div className="p-2">
              <span className="fw-600">Order Total:</span>{" "}
              <span className="ms-1">{`$${orderData?.final_total}`}</span>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Order;
