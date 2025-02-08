import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Container,
  Table,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import Layout from "../../components/common/layout";
import resetIcon from "../../assets/icons/reset.svg";
import editIcon from "../../assets/icons/pencil.svg";
import subDirectorySVG from "../../assets/icons/sub-directory.svg";
import { addPagesApi, editPagesApi, getAllPagesApi } from "../../api/pages";
import { getTemplatesApi } from "../../api/templates";
import { getPhasesApi } from "../../api/phases";
import {
  displayErrorToast,
  displaySuccessToast,
} from "../../global/displayToast";
import { useDispatch, useSelector } from "react-redux";
import { setToken } from "../../api";
import { updateAllTemplates } from "../../redux/actions/templateActions";
import { isEmpty } from "lodash";
import { updateAllPages, updatePages } from "../../redux/actions/pageActions";

const initialState = {
  display_name: "",
  edit_id: "",
  name: "",
  phase_in_id: "",
  phase_out_id: "",
  sort: "",
  sub_page: "",
  template_id: "",
};

const Pages = (props) => {
  const { token } = useSelector((state) => state.user);
  const [loader, setLoader] = useState(false);
  const [allPages, setAllPages] = useState([]);
  const [allPhases, setAllPhases] = useState([]);
  // const [allTemplates, setAllTemplates] = useState([]);

  const [editState, setEditState] = useState(initialState);
  const [submitButtonLoader, setSubmitButtonLoader] = useState(false);

  const { allTemplates } = useSelector((state) => state.templates);
  const { pages } = useSelector((state) => state.pages);

  const dispatch = useDispatch();

  const giveTemplateName = (matchID) => {
    if (matchID) {
      const temp = allTemplates.filter((temp) => temp.id === matchID);

      return temp.length > 0 ? temp[0]?.name : "";
    }
    return "";
  };

  const givePhasesName = (matchID) => {
    if (matchID) {
      const temp = allPhases.filter((temp) => temp.id === matchID);

      return temp.length > 0 ? temp[0]?.name : "";
    }
    return "";
  };

  const handleCancel = () => {
    setEditState(initialState);
  };

  const handleEdit = (page) => {
    setEditState({
      ...page,
      display_name: page?.display_name,
      edit_id: page?.id,
      name: page?.name,
      phase_in_id: page?.phase_in_id || "",
      phase_out_id: page?.phase_out_id || "",
      sort: page?.sort,
      sub_page: page?.sub_page || "",
      template_id: page?.template_id || "",
    });
  };

  // TODO: set state without API call

  // const handleNewStateAfterAPICall = (isEdit, response) => {
  //   const {
  //     id: editedId,
  //     // name,
  //     // display_name,
  //     // template_id,
  //     // phase_in_id,
  //     // phase_out_id,
  //     // sort,
  //     sub_page,
  //   } = response;
  //   const tempPages = [...allPages];
  //   if (sub_page) {
  //     const updatedPages = tempPages.map((page) => {
  //       if (page?.id === sub_page) {
  //         var tempChildren = [...page?.children];
  //         if (isEdit) {
  //           tempChildren = tempChildren.map((chilePages) => {
  //             if (chilePages.id === editedId) {
  //               return {
  //                 ...response,
  //               };
  //             }
  //             return chilePages;
  //           });
  //         } else {
  //           tempChildren = [...tempChildren, { ...response }];
  //         }

  //         return {
  //           ...page,
  //           children: [
  //             ...tempChildren.sort((a, b) => {
  //               return a.sort - b.sort || a.name.localeCompare(b.name);
  //             }),
  //           ],
  //         };
  //       } else {
  //         return page;
  //       }
  //     });

  //     setAllPages(updatedPages);
  //   } else {
  //     var updatedPages = [...tempPages];
  //     if (isEdit) {
  //       updatedPages = updatedPages.map((pages) => {
  //         if (pages.id === editedId) {
  //           return {
  //             ...response,
  //           };
  //         } else {
  //           return pages;
  //         }
  //       });
  //     } else {
  //       updatedPages = [...updatedPages, { ...response }];
  //     }

  //     setAllPages([
  //       ...updatedPages.sort((a, b) => {
  //         return a.sort - b.sort || a.name.localeCompare(b.name);
  //       }),
  //     ]);
  //     // displaySuccessToast(res.message);
  //   }
  // };

  const handleValidation = (display_name, name, sort) => {
    if (!display_name) {
      displayErrorToast("Please fill Display Name field", 3000);
      return false;
    }
    if (!name) {
      displayErrorToast("Please fill Name field", 3000);
      return false;
    }
    if (!sort) {
      displayErrorToast("Please fill sort field", 3000);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setSubmitButtonLoader(true);

    const {
      edit_id,
      display_name,
      name,
      phase_in_id,
      phase_out_id,
      sort,
      sub_page,
      template_id,
    } = editState;
    if (edit_id) {
      if (handleValidation(display_name, name, sort)) {
        const payLoadData = {
          name,
          display_name,
          template_id,
          phase_in_id,
          phase_out_id,
          sort,
          sub_page,
        };

        const res = await editPagesApi(payLoadData, edit_id);
        if (res && res.success === true) {
          dispatch(
            updatePages(
              pages?.map((p) => (p?.id === res?.data?.id ? res?.data : p))
            )
          );
          await getAllPages();
          setEditState(initialState);
          // TODO : set state without API call
          // handleNewStateAfterAPICall(true, { ...res.data });
          displaySuccessToast(res.message);
        }
      }
    } else {
      if (handleValidation(display_name, name, sort)) {
        const payLoadData = {
          name,
          display_name,
          template_id,
          phase_in_id,
          phase_out_id,
          sort,
          sub_page,
        };

        const res = await addPagesApi(payLoadData);
        if (res && res.success === true) {
          dispatch(
            updatePages(
              pages?.map((p) => (p?.id === res?.data?.id ? res?.data : p))
            )
          );
          await getAllPages();
          setEditState(initialState);
          // TODO : set state without API call
          // handleNewStateAfterAPICall(false, { ...res.data });
          displaySuccessToast(res.message);
        }
      }
    }
    setSubmitButtonLoader(false);
  };

  const getAllPages = async () => {
    setToken(token);
    const res = await getAllPagesApi();
    if (res && res.success === true) {
      setAllPages(res.data);
      dispatch(updateAllPages(res.data));
    }
  };

  const getAllPhase = async () => {
    setToken(token);

    const res = await getPhasesApi();

    if (res && res.success === true) {
      setAllPhases(res.data);
    }
  };

  const getAllTemplate = async () => {
    setToken(token);
    const res = await getTemplatesApi();
    if (res && res.success === true) {
      dispatch(updateAllTemplates(res.data));
      // setAllTemplates(res.data);
    }
  };

  const handleDisabledPageList = () => {
    if (editState.edit_id) {
      if (editState?.children) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const defaultUseEffect = async () => {
      setLoader(true);
      await getAllPages();
      await getAllPhase();

      if (isEmpty(allTemplates)) {
        await getAllTemplate();
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
                Pages
              </h6>

              <Table responsive className="editable-table">
                <colgroup>
                  <col width={155} />
                  <col width={155} />
                  <col width={155} />
                  <col width={155} />
                  <col width={155} />
                  <col width={80} />
                  <col width={155} />
                  <col width={80} />
                  <col width={100} />
                </colgroup>
                <thead className="border-0">
                  <tr>
                    <th>Name</th>
                    <th>Display Name</th>
                    <th>Template</th>
                    <th>Phase In</th>
                    <th>Phase Out</th>
                    <th>Sort</th>
                    <th>Sub Page of</th>
                    <th>ID#</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {allPages &&
                    allPages.length > 0 &&
                    allPages.map((page) => {
                      return (
                        <React.Fragment key={page.id}>
                          <tr>
                            <td className="align-middle">{page?.name}</td>
                            <td>{page?.display_name}</td>
                            <td>{giveTemplateName(page?.template_id)}</td>
                            <td>{givePhasesName(page?.phase_in_id)}</td>

                            <td>{givePhasesName(page?.phase_out_id)}</td>

                            <td className="align-middle"> {page?.sort}</td>

                            <td>{page?.sub_page}</td>
                            <td className="align-middle">{page?.id}</td>
                            <td>
                              {" "}
                              <img
                                onClick={() => handleEdit(page)}
                                className="cursorPointer"
                                alt="edit"
                                src={editIcon}
                                width={30}
                              />
                            </td>
                          </tr>
                          {page?.children &&
                            page?.children.length > 0 &&
                            page?.children.map((child) => {
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
                                    {child?.name}
                                  </td>

                                  <td>{child?.display_name}</td>
                                  <td>
                                    {giveTemplateName(child?.template_id)}
                                  </td>
                                  <td>{givePhasesName(child?.phase_in_id)}</td>

                                  <td>{givePhasesName(child?.phase_out_id)}</td>

                                  <td className="align-middle">
                                    {child?.sort}
                                  </td>

                                  <td>{page?.name}</td>
                                  <td className="align-middle">{child?.id}</td>
                                  <td>
                                    {" "}
                                    <img
                                      onClick={() => handleEdit(child)}
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
                        value={editState.name || ""}
                        onChange={(e) =>
                          setEditState((prev) => {
                            return {
                              ...prev,
                              name: e.target.value,
                            };
                          })
                        }
                      />
                    </td>
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
                        value={editState.template_id || ""}
                        className="custom-input"
                        onChange={(e) =>
                          setEditState((prev) => {
                            return {
                              ...prev,
                              template_id: e.target.value,
                            };
                          })
                        }
                      >
                        <option value="" hidden>
                          Please Select
                        </option>
                        {allTemplates &&
                          allTemplates.map((temp, i) => {
                            return (
                              <option value={temp.id} key={temp.id}>
                                {temp?.name}
                              </option>
                            );
                          })}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Select
                        value={editState.phase_in_id || ""}
                        className="custom-input"
                        onChange={(e) =>
                          setEditState((prev) => {
                            return {
                              ...prev,
                              phase_in_id: e.target.value,
                            };
                          })
                        }
                      >
                        <option value="" hidden>
                          Please Select
                        </option>
                        {allPhases &&
                          allPhases.map((phase, i) => {
                            return (
                              <option value={phase.id} key={phase.id}>
                                {phase?.name}
                              </option>
                            );
                          })}
                      </Form.Select>
                    </td>

                    <td>
                      <Form.Select
                        value={editState.phase_out_id || ""}
                        className="custom-input"
                        onChange={(e) =>
                          setEditState((prev) => {
                            return {
                              ...prev,
                              phase_out_id: e.target.value,
                            };
                          })
                        }
                      >
                        <option value="" hidden>
                          Please Select
                        </option>
                        {allPhases &&
                          allPhases.map((phase, i) => {
                            return (
                              <option value={phase.id} key={phase.id}>
                                {phase?.name}
                              </option>
                            );
                          })}
                      </Form.Select>
                    </td>

                    <td className="align-middle">
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
                    </td>

                    <td>
                      <Form.Select
                        value={editState.sub_page || ""}
                        disabled={handleDisabledPageList()}
                        className="custom-input"
                        onChange={(e) =>
                          setEditState((prev) => {
                            return {
                              ...prev,
                              sub_page: e.target.value,
                            };
                          })
                        }
                      >
                        <option value="" hidden>
                          Please Select
                        </option>
                        <option value="">none</option>
                        {allPages &&
                          allPages.map((page, i) => {
                            return (
                              <option
                                disabled={editState?.edit_id === page?.id}
                                value={page.id}
                                key={page.id}
                              >
                                {page?.name}
                              </option>
                            );
                          })}
                      </Form.Select>
                    </td>
                    <td className="align-middle">{editState?.edit_id}</td>

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

export default Pages;
