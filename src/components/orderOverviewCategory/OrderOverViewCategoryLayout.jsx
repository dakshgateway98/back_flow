import { isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { orderOverViewComponentData } from "../../utils/StaticData";
import CakeSpinner from "../common/CakeSpinner";
import Communication from "./Communication";
import Details from "./Details";
import FulFill from "./FulFill";
import Log from "./Log";
import Order from "./Order";

const OrderOverViewCategoryLayout = (props) => {
  const { type, orderData, orderInfoDetail, ...rest } = props;
  const { productCategories } = useSelector((state) => state.orders);

  const [orderCategoryObj, setOrderCategoryObj] = useState({});

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  useEffect(() => {
    if (!isEmpty(orderData)) {
      const tempFullOrderObj = orderData?.items.reduce((accumulator, item) => {
        let key;
        Object.entries(productCategories).forEach(
          ([categoryId, categoryDetails]) => {
            if (item?.product?.category === +categoryId) {
              key = categoryDetails?.name;
            }
          }
        );

        if (!accumulator[key]) {
          accumulator[key] = [];
        }
        accumulator[key].push(item);
        return accumulator;
      }, {});
      setOrderCategoryObj(tempFullOrderObj);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData]);

  const renderComponent = (type) => {
    const { fulFill, order, communication, details, log } =
      orderOverViewComponentData;
    switch (type) {
      case fulFill:
        return (
          <FulFill
            {...{
              orderCategoryObj,
              orderInfoDetail,
              orderData,
              ...rest,
            }}
          />
        );
      case order:
        return <Order {...{ orderCategoryObj, orderInfoDetail, orderData }} />;
      case communication:
        return <Communication {...{ orderData }} />;
      case details:
        return <Details {...{ orderData, orderCategoryObj, ...rest }} />;
      case log:
        return <Log {...{ orderData }} />;
      default:
        return;
    }
  };
  return (
    <>
      <h6 className="absolute text-primary h3 border-bottom-primary borde-primary font-weight-bold mb-3 pb-2">
        Order : {capitalizeFirstLetter(type)}
      </h6>
      <>
        {isEmpty(orderData) || isEmpty(orderInfoDetail) ? (
          <CakeSpinner />
        ) : (
          renderComponent(type)
        )}
      </>
    </>
  );
};

export default OrderOverViewCategoryLayout;
