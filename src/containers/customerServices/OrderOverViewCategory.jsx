import { isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { setToken } from "../../api";
import {
  getProductsCategoriesIdApi,
  getSingleOrderByAPI,
  getSingleOrderInfoApi,
} from "../../api/orders";
import Layout from "../../components/common/layout";
import OrderOverViewCategoryLayout from "../../components/orderOverviewCategory/OrderOverViewCategoryLayout";
import { displayErrorToast } from "../../global/displayToast";
import {
  addProductCategories,
  addSingleOrderDetail,
  addSingleOrderInfoDetail,
} from "../../redux/actions/orderActions";
import { orderToken } from "../../utils/StaticData";

const OrderOverViewCategory = () => {
  const params = useParams();
  const { categoryType, orderId } = params;

  const [showOrderViewCategory, setShowOrderViewCategory] =
    useState(categoryType);
  const [loader, setLoader] = useState(false);

  const { productCategories, orderDetail, orderInfoDetail } = useSelector(
    (state) => state.orders
  );

  const dispatch = useDispatch();

  const getProductCategoriesById = async (date) => {
    setToken(orderToken);
    const res = await getProductsCategoriesIdApi(date);
    if (res && res.success === true) {
      dispatch(addProductCategories(res.data));
    } else {
      displayErrorToast(res.message);
    }
  };

  const getOrderById = async (orderId) => {
    const res = await getSingleOrderByAPI(orderId);
    if (res && res.success === true) {
      dispatch(addSingleOrderDetail(res.data));
    }
  };

  const getOrderInfoById = async (orderId) => {
    const res = await getSingleOrderInfoApi(+orderId);
    dispatch(addSingleOrderInfoDetail(res.data));
  };

  useEffect(() => {
    const defaultUseEffect = async () => {
      setLoader(true);
      if (isEmpty(productCategories)) {
        await getProductCategoriesById();
      }
    };
    defaultUseEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callOrdersAPI = async () => {
    if (isEmpty(orderDetail)) {
      await getOrderById(orderId);
    }
    if (isEmpty(orderInfoDetail)) {
      await getOrderInfoById(orderId);
    }
  };

  useEffect(() => {
    if (!isEmpty(productCategories)) {
      callOrdersAPI();
    }
    setLoader(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productCategories]);

  return (
    <Layout {...{ loader, setShowOrderViewCategory }}>
      <Container>
        <OrderOverViewCategoryLayout
          type={showOrderViewCategory}
          orderData={orderDetail}
          orderInfoDetail={orderInfoDetail}
        />
      </Container>
    </Layout>
  );
};

export default OrderOverViewCategory;
