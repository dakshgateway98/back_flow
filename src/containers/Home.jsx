import { isEmpty } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { useMemo } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { setToken } from "../api";
import { getAllHomeConfigPagesApi } from "../api/configHome";
import { getConfigLevelsApi } from "../api/configureLevel";
import { getAllPagesApi, getPagesApi } from "../api/pages";
import CakeSpinner from "../components/common/CakeSpinner";
import Layout from "../components/common/layout";
import { convertToSlug } from "../global/helpers";
import {
  updatePages,
  updateHomePage,
  updateAllPages,
} from "../redux/actions/pageActions";
import { getUpdatedConfigLevels } from "../redux/actions/userlevelsActions";
import { adminPages } from "../utils/HomePageData";
import {
  homePageSectionIds,
  levelListIds,
  page_Order_Prep_ID,
} from "../utils/StaticData";

const Home = () => {
  const [loader, setLoader] = useState(false);
  const [homePageLoader, setHomePageLoader] = useState(false);

  const { pages, allPages } = useSelector((state) => state.pages);
  const { configLevels } = useSelector((state) => state.userlevels);
  const { token, data: userData } = useSelector((state) => state.user);
  const { homePages } = useSelector((state) => state.pages);

  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useDispatch();

  const getAllHomeConfigPages = async () => {
    setToken(token);
    setLoader(true);
    setHomePageLoader(true);
    const res = await getAllHomeConfigPagesApi();
    if (res && res.success === true) {
      dispatch(updateHomePage(res.data));
    }
    setLoader(false);
    setHomePageLoader(false);
  };

  useEffect(() => {
    if (isEmpty(homePages)) {
      getAllHomeConfigPages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homePages]);

  const getPages = async () => {
    const res = await getPagesApi();
    if (res && res.success === true) {
      dispatch(updatePages(res.data));
    }
  };

  const getAllPages = async () => {
    const res = await getAllPagesApi();
    if (res && res.success === true) {
      dispatch(updateAllPages(res.data));
    }
  };

  const getConfigLevels = async () => {
    const res = await getConfigLevelsApi();
    if (res && res.success === true) {
      dispatch(getUpdatedConfigLevels(res.data));
    }
  };

  const callProductPagesAPIs = async () => {
    setLoader(true);
    setToken(token);

    if (isEmpty(pages)) {
      await getPages();
    }
    if (isEmpty(allPages)) {
      await getAllPages();
    }
    if (isEmpty(configLevels)) {
      await getConfigLevels();
    }
    setLoader(false);
  };

  useEffect(() => {
    callProductPagesAPIs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleParams = (clickedPage) => {
    const selectedPage = pages.find((page) => page.id === clickedPage.page_id);
    const parent = selectedPage.sub_page
      ? pages.find((page) => page.id === selectedPage.sub_page)
      : selectedPage;
    const child = selectedPage.sub_page
      ? selectedPage
      : pages.find((page) => page.sub_page === selectedPage.id);

    const parentSlug = convertToSlug(parent.display_name);
    const childSlug = child ? `/${convertToSlug(child.display_name)}` : "";

    const url =
      parent?.id === page_Order_Prep_ID
        ? `/reports/${parentSlug}${childSlug}`
        : child
        ? `/product/${parentSlug}${childSlug}`
        : `/${parentSlug}`;

    navigate(`${url}${location?.search}`);
  };

  const handleFilteredChildren = useCallback(
    (homePagesChildren, currentAccessLevel) => {
      return homePagesChildren.filter((homePage) => {
        const requiredSubPagePage = pages.find(
          (page) => page.id === homePage.page_id
        );
        if (requiredSubPagePage?.sub_page && currentAccessLevel) {
          return currentAccessLevel[requiredSubPagePage?.id];
        } else if (!requiredSubPagePage?.sub_page && currentAccessLevel) {
          const requiredpage = allPages.find(
            (page) => page.id === homePage.page_id
          );
          if (requiredpage) {
            return requiredpage?.children.some((childPage) =>
              Object.entries(currentAccessLevel).some(
                ([accessPageId, accessValue]) =>
                  +accessPageId === +childPage?.id && accessValue
              )
            );
          }
        }
        return false;
      });
    },
    [allPages, pages]
  );

  const displayHomePages = useMemo(() => {
    if (
      !isEmpty(homePages) &&
      !isEmpty(userData) &&
      !isEmpty(configLevels) &&
      !isEmpty(allPages)
    ) {
      const currentLevelId = userData?.level;
      const currentConfigLevel = configLevels.find(
        (configLevel) => configLevel.id === currentLevelId
      );
      const currentAccessLevel = currentConfigLevel
        ? currentConfigLevel?.access
        : null;
      return homePages.map((homePage) => {
        if (
          homePage.id === homePageSectionIds.product ||
          homePage.id === homePageSectionIds.reports
        ) {
          return {
            ...homePage,
            children: handleFilteredChildren(
              homePage.children,
              currentAccessLevel
            ),
          };
        }
        return homePage;
      });
    }
  }, [homePages, userData, configLevels, allPages, handleFilteredChildren]);

  return (
    <Layout {...{ loader }}>
      <Container className="px-3">
        <Row className="justify-content-center">
          <Col xl={8} lg={10}>
            <h1 className="text-primary h2 mb-3 font-weight-bold">HOME</h1>
            {(userData?.level === levelListIds?.admin ||
              userData?.level === levelListIds?.admin) && (
              <>
                <h6 className="text-primary h4 border-bottom-primary borde-primary text-center font-weight-bold mb-3 pb-2">
                  Admin
                </h6>
                <Row>
                  {adminPages &&
                    adminPages.map((page, j) => (
                      <Col key={j} md={4} className="col-6">
                        <Link to={page.route}>
                          <Button
                            variant="primary"
                            className="mb-3  border-radius-10  p-3 w-100"
                          >
                            {page.pagename}
                          </Button>
                        </Link>
                      </Col>
                    ))}
                </Row>
              </>
            )}
            {
              <Row>
                {homePageLoader ? (
                  <CakeSpinner className="my-4" />
                ) : (
                  displayHomePages &&
                  displayHomePages.length > 0 &&
                  displayHomePages.map((homePage, index) => {
                    return (
                      <React.Fragment key={index}>
                        {homePage?.children &&
                          homePage?.children.length > 0 && (
                            <>
                              <h6 className="text-primary h4 border-bottom-primary borde-primary text-center font-weight-bold mb-3 pb-2">
                                {homePage?.display_name}
                              </h6>
                              {homePage?.children &&
                                homePage?.children.length > 0 &&
                                homePage?.children.map((page) => (
                                  <Col key={page.id} md={4} className="col-6">
                                    <Button
                                      variant="primary"
                                      className="mb-3  border-radius-10  p-3 w-100"
                                      onClick={() => handleParams(page)}
                                    >
                                      {page?.display_name}
                                    </Button>
                                  </Col>
                                ))}
                            </>
                          )}
                      </React.Fragment>
                    );
                  })
                )}
              </Row>
            }
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default Home;
