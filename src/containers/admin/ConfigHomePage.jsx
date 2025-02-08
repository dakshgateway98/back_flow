import { isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToken } from "../../api";
import {
  addHomeConfigPagesApi,
  editHomeConfigPagesApi,
  getAllHomeConfigPagesApi,
  getAllHomeConfigSectionsApi,
} from "../../api/configHome";
import { getPagesApi } from "../../api/pages";
import editIcon from "../../assets/icons/pencil.svg";
import resetIcon from "../../assets/icons/reset.svg";
import subDirectorySVG from "../../assets/icons/sub-directory.svg";
import Layout from "../../components/common/layout";
import {
  displayErrorToast,
  displaySuccessToast,
} from "../../global/displayToast";
import { updatePages, updateHomePage } from "../../redux/actions/pageActions";

const initialState = {
  edit_id: "",
  page_id: "",
  section: "",
  display_name: "",
  sort: "",
};

const ConfigHomePage = (props) => {
  const { token } = useSelector((state) => state.user);
  const { homePages, pages } = useSelector((state) => state.pages);

  const [loader, setLoader] = useState(false);
  const [editState, setEditState] = useState(initialState);
  const [allSections, setAllSections] = useState([]);
  const [submitButtonLoader, setSubmitButtonLoader] = useState(false);

  const dispatch = useDispatch();

  const givePageName = (matchID) => {
    if (matchID) {
      const temp = pages.filter((temp) => temp.id === matchID);
      return temp.length > 0 ? temp[0]?.name : "";
    }
    return "";
  };

  const giveSectionName = (matchID) => {
    if (matchID) {
      const temp = allSections.filter((temp) => temp.id === matchID);
      return temp.length > 0 ? temp[0]?.display_name : "";
    }
    return "";
  };

  const handleEdit = (configPage) => {
    setEditState({
      ...configPage,
      edit_id: configPage?.id,
      page_id: configPage?.page_id || null,
      section: configPage?.section || null,
      display_name: configPage?.display_name,
      sort: configPage?.sort,
    });
  };

  const handleValidation = (display_name, sort, page_id, section) => {
    if (!display_name) {
      displayErrorToast("Please fill Display Name field", 3000);
      return false;
    }

    if (!sort) {
      displayErrorToast("Please fill sort field", 3000);
      return false;
    }
    // Commented code Reason: Without having page_id we can create children for section

    // if (!page_id && section) {
    //   displayErrorToast("Please select page", 3000);
    //   return false;
    // }

    if (!section && page_id) {
      displayErrorToast("Please select section", 3000);
      return false;
    }
    return true;
  };

  const handlePayload = (display_name, page_id, section, sort) => {
    if (page_id === "" || section === "") {
      return {
        display_name,
        page_id: null,
        section: null,
        sort,
      };
    } else {
      return {
        display_name,
        page_id,
        section,
        sort,
      };
    }
  };

  const handleSubmit = async () => {
    setSubmitButtonLoader(true);
    const { edit_id, display_name, page_id, section, sort } = editState;
    if (edit_id) {
      if (handleValidation(display_name, sort, page_id, section)) {
        const payLoadData = {
          display_name,
          page_id,
          section,
          sort,
        };

        const res = await editHomeConfigPagesApi(payLoadData, edit_id);
        if (res && res.success === true) {
          await getAllSections();
          await getAllHomeConfigPages();
          setEditState(initialState);
          // TODO : set state without API call
          displaySuccessToast(res.message);
        }
      }
    } else {
      if (handleValidation(display_name, sort, page_id, section)) {
        const payLoadData = handlePayload(display_name, page_id, section, sort);
        // const payLoadData = {
        //   display_name,
        //   page_id,
        //   section,
        //   sort,
        // };

        const res = await addHomeConfigPagesApi(payLoadData);
        if (res && res.success === true) {
          await getAllSections();
          await getAllHomeConfigPages();
          setEditState(initialState);

          // TODO : set state without API call

          displaySuccessToast(res.message);
        }
      }
    }
    setSubmitButtonLoader(false);
  };

  const handleDisabled = () => {
    // if (editState?.edit_id) {
    //   if (editState?.page_id === null && editState?.section === null) {
    //     return true;
    //   }
    // }
    // return false;

    if (editState.edit_id) {
      if (editState?.children) {
        return true;
      }
    }
    return false;
  };
  const handleCancel = () => {
    setEditState(initialState);
  };
  const getpages = async () => {
    setToken(token);
    const res = await getPagesApi();
    if (res && res.success === true) {
      if (res?.data) {
        dispatch(
          updatePages(
            res.data.sort((a, b) => {
              return a?.name.localeCompare(b?.name);
            })
          )
        );
      } else {
        dispatch(updatePages([]));
      }
    }
  };

  const getAllHomeConfigPages = async () => {
    setToken(token);
    const res = await getAllHomeConfigPagesApi();
    if (res && res.success === true) {
      // setAllHomeConfigPages(res.data);
      dispatch(updateHomePage(res.data));
    }
  };

  const getAllSections = async () => {
    setToken(token);
    const res = await getAllHomeConfigSectionsApi();
    if (res && res.success === true) {
      if (res?.data) {
        setAllSections(
          res.data.sort((a, b) => {
            return a?.display_name.localeCompare(b?.display_name);
          })
        );
      } else {
        setAllSections([]);
      }
    }
  };
  useEffect(() => {
    const defaultUseEffect = async () => {
      setLoader(true);
      if (isEmpty(homePages)) {
        await getAllHomeConfigPages();
      }
      await getAllSections();
      if (isEmpty(pages)) {
        await getpages();
      }

      setLoader(false);
    };
    defaultUseEffect();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Layout loader={loader}>
      <Container>
        <Row className="justify-content-center">
          <Col>
            <div className="mb-3">
              <h6 className="text-primary h3 border-bottom-primary borde-primary font-weight-bold mb-3 pb-2">
                Config Home Page
              </h6>

              <Table responsive className="editable-table">
                <colgroup style={{ minWidth: "450px" }}>
                  <col width={90} />
                  <col width={90} />
                  <col width={90} />
                  <col width={90} />
                  <col width={90} />
                </colgroup>
                <thead className="border-0">
                  <tr>
                    <th>DisplayName</th>
                    <th>Section</th>
                    <th>Pages</th>
                    <th>Sort</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {homePages &&
                    homePages.length > 0 &&
                    homePages.map((configPage) => {
                      return (
                        <React.Fragment key={configPage?.id}>
                          <tr>
                            <td className="align-middle">
                              {configPage?.display_name}
                            </td>
                            <td></td>
                            <td></td>

                            <td className="align-middle">{configPage?.sort}</td>

                            <td onClick={() => handleEdit(configPage)}>
                              {" "}
                              <img
                                className="cursorPointer"
                                alt="edit"
                                src={editIcon}
                                width={30}
                              />
                            </td>
                          </tr>
                          {configPage?.children &&
                            configPage?.children.length > 0 &&
                            configPage?.children.map((child) => {
                              return (
                                <tr key={child.id}>
                                  <td className="d-flex align-items-center align-middle">
                                    <img
                                      src={subDirectorySVG}
                                      className="p-1"
                                      height="30"
                                      width="30"
                                      alt=""
                                    />
                                    {child?.display_name}
                                  </td>
                                  <td> {giveSectionName(child?.section)}</td>
                                  <td> {givePageName(child?.page_id)}</td>

                                  <td className="align-middle">
                                    {child?.sort}
                                  </td>

                                  <td onClick={() => handleEdit(child)}>
                                    {" "}
                                    <img
                                      className="cursorPointer"
                                      alt="edit"
                                      src={editIcon}
                                      width={30}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                        </React.Fragment>
                      );
                    })}
                  <tr>
                    <td>
                      <Form.Control
                        type="text"
                        className="custom-input"
                        value={editState.display_name || ""}
                        onChange={(e) =>
                          setEditState((prev) => {
                            return {
                              ...prev,
                              display_name: e.target.value,
                            };
                          })
                        }
                      />
                    </td>
                    <td>
                      <Form.Select
                        disabled={handleDisabled()}
                        value={editState.section || ""}
                        className="custom-input"
                        onChange={(e) =>
                          setEditState((prev) => {
                            return {
                              ...prev,
                              section: e.target.value,
                            };
                          })
                        }
                      >
                        <option value="" hidden>
                          Please Select
                        </option>
                        <option value="">none</option>
                        {allSections &&
                          allSections.map((sections, i) => {
                            return (
                              <option
                                disabled={editState?.edit_id === sections?.id}
                                value={sections.id}
                                key={sections.id}
                              >
                                {sections?.display_name}
                              </option>
                            );
                          })}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Select
                        disabled={handleDisabled()}
                        value={editState.page_id || ""}
                        className="custom-input"
                        onChange={(e) =>
                          setEditState((prev) => {
                            return {
                              ...prev,
                              page_id: e.target.value,
                            };
                          })
                        }
                      >
                        <option value="" hidden>
                          Please Select
                        </option>
                        <option value="">none</option>
                        {pages &&
                          pages.map((page, i) => {
                            return (
                              <option value={page.id} key={page.id}>
                                {page?.name}
                              </option>
                            );
                          })}
                      </Form.Select>
                    </td>

                    <td>
                      <Form.Control
                        type="text"
                        className="custom-input"
                        value={editState.sort || ""}
                        onChange={(e) =>
                          setEditState((prev) => {
                            return {
                              ...prev,
                              sort: e.target.value.replace(/\D/g, ""),
                            };
                          })
                        }
                      />
                      {/* )} */}
                    </td>
                    <td>
                      <div className="d-flex">
                        <div className="me-2 cursorPointer">
                          <Button
                            onClick={() => handleSubmit()}
                            className="p-2"
                          >
                            <div className="d-flex gap-2 align-items-center">
                              <span
                                className={!submitButtonLoader ? "ms-2" : ""}
                              >
                                {editState.edit_id ? "Update" : "Add"}
                              </span>
                              <span>
                                {submitButtonLoader && (
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                  />
                                )}
                              </span>
                            </div>
                          </Button>
                        </div>
                        <span
                          className="cursorPointer"
                          onClick={() => handleCancel()}
                        >
                          <img src={resetIcon} width={30} alt="reset" />
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};
export default ConfigHomePage;
