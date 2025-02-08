import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Table,
  Modal,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getAllPagesApi } from "../../api/pages";
import {
  addSubPageConfigApi,
  addSubPageDiningConfigApi,
  deleteSubPageConfigApi,
  editSubPageConfigApi,
  editSubPageDiningConfigApi,
  getAllSubPagesConfigApi,
  getAllSubPagesDiningConfigApi,
} from "../../api/configCategory";

import { getTemplatesApi } from "../../api/templates";
import { setToken } from "../../api";
import editIcon from "../../assets/icons/pencil.svg";
import deleteIcon from "../../assets/icons/delete.svg";
import resetIcon from "../../assets/icons/reset.svg";
import Layout from "../../components/common/layout";
import {
  displayErrorToast,
  displaySuccessToast,
} from "../../global/displayToast";

import { updateAllSubPageConfig } from "../../redux/actions/subPageConfigActions";
import { updateAllTemplates } from "../../redux/actions/templateActions";
import { updateMultiplier } from "../../redux/actions/multiplierActions";
import { CONFIG_ID, dinningOptionData, setting } from "../../utils/StaticData";
import { isEmpty } from "lodash";
import { getAllModifierAPI } from "../../api/multiplier";

const ConfigCategoryPage = (props) => {
  const { token } = useSelector((state) => state.user);
  const { allSubPagesConfig } = useSelector((state) => state.subPageConfig);
  const { allTemplates } = useSelector((state) => state.templates);
  const { multiplierList } = useSelector((state) => state.multiplier);
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);
  const [allPages, setAllPages] = useState([]);
  const [submitButtonLoader, setSubmitButtonLoader] = useState(false);
  const [selectParentPage, setSelectParentPage] = useState("");
  const [childrenPages, setChildrenPages] = useState([]);
  const [allDiningType, setAllDiningType] = useState([]);
  const [saveDiningTypeLoader, setSaveDiningTypeLoader] = useState(false);
  const [selectedChildIdForLoader, setSelectedChildIdForLoader] = useState(0);
  const [selectedChildIdForDiningLoader, setSelectedChildIdForDiningLoader] =
    useState(0);
  const [showModal, setShowModal] = useState(false);
  const [deleteSubConfigID, setDeleteSubConfigID] = useState(null);
  const [deleteButtonLoader, setDeleteButtonLoader] = useState(false);

  const handleEditSubPage = (sub_page) => {
    let updatedChildren = [...childrenPages];

    updatedChildren = updatedChildren.map((child) => {
      if (sub_page?.page_id === child.id) {
        return {
          ...child,
          edit_id: sub_page.id,
          page_id: sub_page.page_id,
          sub_name: sub_page?.name || "",
          revel_ids: sub_page?.revel_ids || [],
          recipe: sub_page?.recipe || false,
          recipe_id: sub_page?.recipe_id.toString() || "",
          multiplier: sub_page?.multiplier || "",
          multiplier_2: sub_page?.multiplier_2 || "",
          batch: sub_page?.batch,
          sort: sub_page?.sort,
        };
      } else {
        return { ...child };
      }
    });

    setChildrenPages(updatedChildren);
  };

  const handleValidation = (name, sort, revel_ids, batch) => {
    if (!name) {
      displayErrorToast("Please fill Name field", 3000);
      return false;
    }
    if (!(revel_ids && revel_ids.length > 0)) {
      displayErrorToast("Please fill RevelIds field", 3000);
      return false;
    }
    if (!sort) {
      displayErrorToast("Please fill sort field", 3000);
      return false;
    }

    if (!parseInt(batch)) {
      displayErrorToast(
        "Please fill a batch field, if no value, enter a 1",
        3000
      );
      return false;
    }

    return true;
  };

  const handleFillChildren = (id) => {
    if (id) {
      const parent = allPages.filter((page) => page.id === parseInt(id));

      if (parent[0].children) {
        const childrensArray = [...parent[0]?.children];

        const finalChildArray = childrensArray.map((child) => {
          let selectedDiningType = allDiningType.find(
            (DiningType) => DiningType.page_id === child?.id
          );
          let subPageOptions = dinningOptionData.reduce(
            (a, v) => ({ ...a, [v.name]: false }),
            {}
          );
          if (!isEmpty(selectedDiningType)) {
            const { page_id, ...apisubPageOptions } = selectedDiningType;
            subPageOptions = { ...subPageOptions, ...apisubPageOptions };
          }
          return {
            ...child,
            edit_id: "",
            page_id: child?.id,
            sub_name: "",
            revel_ids: [],
            recipe: false,
            recipe_id: "",
            multiplier: "",
            multiplier_2: "",
            batch: "",
            sort: "",
            subPageOptionsData: { ...subPageOptions },
          };
        });
        setChildrenPages([...finalChildArray]);
      } else {
        setChildrenPages([]);
      }
    } else {
      setChildrenPages([]);
    }
  };

  const handleDisabledPages = (page) => {
    const selectedTemplatesForGivenConfig = allTemplates.filter(
      (temp) => temp?.config_id === CONFIG_ID.config_page
    );
    const allIDForTemplates = selectedTemplatesForGivenConfig.map((temp) => {
      return temp?.id;
    });

    return !allIDForTemplates.includes(page?.template_id);
  };

  const giveTemplateName = (matchID) => {
    if (matchID) {
      const temp = allTemplates.filter((temp) => temp.id === matchID);

      return temp.length > 0 ? temp[0]?.name : "";
    }
    return "";
  };

  const handleResetInputChildPageState = (child_id) => {
    let updateChildren = [...childrenPages];
    updateChildren = updateChildren.map((child) => {
      if (child_id === child.id) {
        return {
          ...child,
          edit_id: "",
          page_id: child?.id,
          sub_name: "",
          revel_ids: [],
          recipe: false,
          recipe_id: "",
          multiplier: "",
          multiplier_2: "",
          batch: "",
          sort: "",
        };
      } else {
        return { ...child };
      }
    });

    setChildrenPages(updateChildren);
  };

  const handleOnChange = (e, id) => {
    let childrenValue;
    const childrenName = e.target.name;
    if (childrenName === "recipe") {
      childrenValue = e.target.checked;
    } else if (childrenName === "sort" || childrenName === "batch") {
      childrenValue = +e.target.value.replace(/\D/g, "");
    } else if (
      childrenName === "multiplier" ||
      childrenName === "multiplier_2"
    ) {
      let selectedMul = multiplierList.find(
        (item) => item.name === e.target.value
      );

      childrenValue = selectedMul ? selectedMul?.id.toString() : "";
    } else {
      childrenValue = e.target.value;
    }
    const updatedChildren = childrenPages.map((child) => {
      if (child.id === id) {
        return {
          ...child,
          [childrenName]: childrenValue,
        };
      }
      return child;
    });

    setChildrenPages(updatedChildren);
  };

  const handleSubPageOptionsChange = (e, id) => {
    const childrenName = e.target.name;
    let childrenValue = e.target.checked;
    if (childrenName === "notes" || childrenName === "private_notes") {
      childrenValue = e.target.value;
    }
    const updatedChildren = childrenPages.map((child) => {
      if (child.id === id) {
        return {
          ...child,
          subPageOptionsData: {
            ...child.subPageOptionsData,
            [childrenName]: childrenValue,
          },
        };
      }
      return child;
    });
    setChildrenPages(updatedChildren);
  };

  const handleSubmit = async (child_id) => {
    setSubmitButtonLoader(true);
    setSelectedChildIdForLoader(child_id);
    const selectedChild = childrenPages.filter((ch) => ch.id === child_id);
    const {
      edit_id,
      sub_name,
      revel_ids,
      multiplier,
      batch,
      sort,
      page_id,
      recipe,
      recipe_id,
      multiplier_2,
    } = selectedChild[0];
    const payLoadData = {
      page_id,
      name: sub_name,
      revel_ids,
      multiplier,
      batch,
      sort,
      recipe,
      recipe_id: +recipe_id,
      multiplier_2,
    };
    if (edit_id) {
      if (handleValidation(sub_name, sort, revel_ids, batch)) {
        const res = await editSubPageConfigApi(payLoadData, edit_id);
        if (res && res.success === true) {
          const tempAllSubPages = [...allSubPagesConfig];
          const updatedAllSubPages = tempAllSubPages.map((subPage) => {
            if (subPage.id === res.data.id) {
              return res.data;
            }
            return subPage;
          });
          dispatch(updateAllSubPageConfig(updatedAllSubPages));

          handleResetInputChildPageState(child_id);
          displaySuccessToast(res.message);
        }
      }
    } else {
      if (handleValidation(sub_name, sort, revel_ids, batch)) {
        const res = await addSubPageConfigApi(payLoadData);
        if (res && res.success === true) {
          const updatedAllSubPages = [...allSubPagesConfig, res.data];
          dispatch(updateAllSubPageConfig(updatedAllSubPages));

          handleResetInputChildPageState(child_id);
          displaySuccessToast(res.message);
        }
      }
    }
    setSubmitButtonLoader(false);
    setSelectedChildIdForLoader(0);
  };

  const handleSaveDiningType = async (child) => {
    setSaveDiningTypeLoader(true);
    setSelectedChildIdForDiningLoader(child?.id);
    const { id, subPageOptionsData } = child;
    const data = allDiningType.filter((DnType) => DnType.page_id === id);
    if (data && data.length > 0) {
      const payLoadData = subPageOptionsData;

      const res = await editSubPageDiningConfigApi(payLoadData, id);

      if (res && res.success === true) {
        await getAllDiningTypes();
        displaySuccessToast(res.message);
      }
    } else {
      const payLoadData = {
        page_id: id,
        ...subPageOptionsData,
      };

      const res = await addSubPageDiningConfigApi(payLoadData);

      if (res && res.success === true) {
        await getAllDiningTypes();
        displaySuccessToast(res.message);
      }
    }
    setSelectedChildIdForDiningLoader(0);
    setSaveDiningTypeLoader(false);
  };

  const getAllPages = async () => {
    setToken(token);
    const res = await getAllPagesApi();
    if (res && res.success === true) {
      setAllPages(res.data);
    }
  };

  const getAllTemplate = async () => {
    setToken(token);
    const res = await getTemplatesApi();
    if (res && res.success === true) {
      // setAllTemplates(res.data);
      dispatch(updateAllTemplates(res.data));
    }
  };

  const getAllSubPages = async () => {
    setToken(token);
    const res = await getAllSubPagesConfigApi();
    if (res && res.success === true) {
      // setAllSubPages(res.data);
      dispatch(updateAllSubPageConfig(res.data));
    }
  };

  const getAllDiningTypes = async () => {
    setToken(token);
    const res = await getAllSubPagesDiningConfigApi();
    if (res && res.success === true) {
      setAllDiningType(res.data);
    }
  };

  const giveMultiplierDisplayName = (id) => {
    if (id) {
      return multiplierList.find((mul) => mul.id === +id)?.display_name;
    }
    return "";
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDeleteSubConfigID(null);
  };

  const handleDeleteSubPageConfig = async () => {
    setDeleteButtonLoader(true);
    setToken(token);
    if (deleteSubConfigID) {
      const res = await deleteSubPageConfigApi(deleteSubConfigID);
      if (res && res.success === true) {
        await getAllSubPages();
        handleCloseModal();
        displaySuccessToast(res.message);
      }
    } else {
      displayErrorToast("Please click on the delete icon again");
    }
    setDeleteButtonLoader(false);
  };

  const handleDeleteSubPageConfigToOpenModal = async (subpageConfigId) => {
    setShowModal(true);
    setDeleteSubConfigID(subpageConfigId);
  };

  const getAllMultiplierData = async () => {
    setToken(token);
    const res = await getAllModifierAPI();
    if (res && res.success === true) {
      const data =
        res.data.find((val) => val?.id === setting.multiplier_ID)?.settings ||
        [];
      dispatch(updateMultiplier([...data]));
    }
  };

  useEffect(() => {
    const defaultUseEffect = async () => {
      setLoader(true);
      if (isEmpty(allSubPagesConfig)) {
        await getAllSubPages();
      }
      if (isEmpty(allTemplates)) {
        await getAllTemplate();
      }

      await getAllPages();
      await getAllDiningTypes();
      if (!multiplierList || multiplierList.length === 0) {
        await getAllMultiplierData();
      }
      setLoader(false);
    };
    defaultUseEffect();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMultiplierValue = (id) => {
    if (id) {
      const multiplier_name = multiplierList.find(
        (item) => item.id === +id
      ).name;
      return multiplier_name;
    }
    return "";
  };

  return (
    <Layout loader={loader}>
      <Container>
        <Row className="justify-content-center">
          <Col>
            <div className="mb-3">
              <h1 className="text-primary h3 border-bottom-primary borde-primary font-weight-bold mb-3 pb-2">
                Config Category Page
              </h1>
              <h2 className="text-secondary h4 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2">
                Main Elements
              </h2>
              <div className="d-flex align-items-center justify-content-between">
                <h3 className="h6 d-inline-flex align-items-center">
                  <span className="me-2">Configure</span>
                  <Form.Select
                    value={selectParentPage}
                    onChange={(e) => {
                      setSelectParentPage(e.target.value);
                      handleFillChildren(e.target.value);
                    }}
                    className="custom-input mb-0"
                  >
                    <option value="" hidden>
                      Please Select
                    </option>
                    <option value="">none</option>
                    {allPages &&
                      allPages.length > 0 &&
                      allPages.map((page, i) => {
                        return (
                          <option
                            disabled={handleDisabledPages(page)}
                            value={page.id}
                            key={`dropdown-${page.id}`}
                          >
                            {page?.display_name}
                          </option>
                        );
                      })}
                  </Form.Select>
                </h3>
              </div>
              <Table responsive className="editable-table mb-4">
                <colgroup style={{ minWidth: "450px" }}>
                  <col width={200} />
                  <col style={{ minWidth: 200 }} />
                </colgroup>
                <thead className="border-0">
                  <tr>
                    <th>Sub Page</th>
                    <th>Templates</th>
                  </tr>
                </thead>
                <tbody>
                  {childrenPages &&
                    childrenPages.length > 0 &&
                    childrenPages.map((child) => {
                      return (
                        <tr key={`child-list-${child?.id}`}>
                          <td className="align-middle">
                            {child?.display_name}
                          </td>
                          <td>{giveTemplateName(child?.template_id)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </Table>
              <h2 className="text-secondary h3 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2">
                Sub Pages
              </h2>

              {childrenPages &&
                childrenPages.length > 0 &&
                childrenPages.map((child) => {
                  return (
                    <React.Fragment key={`display-subpage-${child?.id}`}>
                      <div className="mt-2">
                        <p
                          style={{
                            color: "#e14984",
                          }}
                          className="h4 d-inline-flex align-items-center"
                        >
                          Sub Page : {child?.display_name}
                        </p>
                        <Table responsive className="editable-table">
                          <colgroup style={{ minWidth: "450px" }}>
                            <col width={160} />
                            <col style={{ minWidth: 280 }} />
                            <col width={90} />
                            <col width={90} />
                            <col width={160} />
                            <col width={160} />
                            <col width={90} />
                            <col width={90} />
                            <col width={120} />
                          </colgroup>
                          <thead className="border-0">
                            <tr>
                              <th>Name</th>
                              <th>Revel IDs</th>
                              <th>Use Recipe ID</th>
                              <th>Recipe ID</th>
                              <th>Multiplier 1</th>
                              <th>Multiplier 2</th>
                              <th>Batch</th>
                              <th>Sort</th>
                              <th></th>
                              {/* <th></th> */}
                            </tr>
                          </thead>
                          <tbody>
                            {allSubPagesConfig &&
                              allSubPagesConfig.length > 0 &&
                              allSubPagesConfig.map((subpage) => {
                                return (
                                  <React.Fragment
                                    key={`subpage-${subpage?.id}-${child?.id} `}
                                  >
                                    {subpage?.page_id === child?.id && (
                                      <tr>
                                        <td>{subpage?.name}</td>
                                        <td className="text-break">
                                          {subpage?.revel_ids &&
                                            subpage?.revel_ids.join(",")}
                                        </td>
                                        <td>
                                          <Form.Group className="position-relative">
                                            <Form.Check
                                              className="custom-input-box"
                                              type="checkbox"
                                              id={subpage.id}
                                              style={{ height: "35px" }}
                                              label=""
                                              disabled
                                              checked={subpage?.recipe}
                                            />
                                          </Form.Group>
                                        </td>
                                        <td>{subpage?.recipe_id}</td>
                                        <td>
                                          {giveMultiplierDisplayName(
                                            subpage?.multiplier
                                          )}
                                        </td>
                                        <td>
                                          {giveMultiplierDisplayName(
                                            subpage?.multiplier_2
                                          )}
                                        </td>
                                        <td>{subpage?.batch}</td>
                                        <td>{subpage?.sort}</td>
                                        <td className="text-end">
                                          <img
                                            onClick={() =>
                                              handleEditSubPage(subpage)
                                            }
                                            className="cursorPointer"
                                            alt="edit"
                                            src={editIcon}
                                            width={30}
                                          />

                                          <img
                                            onClick={() => {
                                              handleDeleteSubPageConfigToOpenModal(
                                                subpage?.id
                                              );
                                            }}
                                            style={{ marginLeft: "10px" }}
                                            className="cursorPointer"
                                            alt="dele"
                                            src={deleteIcon}
                                            width={30}
                                          />
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })}

                            <tr>
                              <td>
                                <Form.Control
                                  type="text"
                                  className="custom-input"
                                  name="sub_name"
                                  value={child.sub_name || ""}
                                  onChange={(e) => {
                                    handleOnChange(e, child.id);
                                  }}
                                />
                              </td>
                              <td>
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  type="text"
                                  name="revel_ids"
                                  className="custom-input"
                                  value={child?.revel_ids.join(",") || ""}
                                  onChange={(e) => {
                                    var regex = /^[0-9.,\b]+$/;
                                    if (
                                      regex.test(e.target.value) ||
                                      e.target.value === ""
                                    ) {
                                      var tempChildren = [...childrenPages];
                                      const updatedChildren = tempChildren.map(
                                        (c) => {
                                          if (c.id === child.id) {
                                            c.revel_ids =
                                              e.target.value.split(",");
                                          }
                                          return c;
                                        }
                                      );
                                      setChildrenPages([...updatedChildren]);
                                    }
                                  }}
                                />
                              </td>

                              <td>
                                <Form.Group>
                                  <Form.Check
                                    label=""
                                    type="checkbox"
                                    className="custom-input-box"
                                    name="recipe"
                                    id={child.id}
                                    checked={child?.recipe || false}
                                    onChange={(e) => {
                                      handleOnChange(e, child.id);
                                    }}
                                  />
                                </Form.Group>
                              </td>

                              <td>
                                <Form.Control
                                  type="text"
                                  className="custom-input"
                                  name="recipe_id"
                                  value={child?.recipe_id || ""}
                                  onChange={(e) => {
                                    handleOnChange(e, child.id);
                                  }}
                                />
                              </td>
                              <td>
                                <Form.Select
                                  className="custom-input"
                                  name="multiplier"
                                  value={getMultiplierValue(
                                    child.multiplier || ""
                                  )}
                                  onChange={(e) => {
                                    handleOnChange(e, child.id);
                                  }}
                                >
                                  <option value="" hidden>
                                    Please Select
                                  </option>

                                  <option value="">none</option>
                                  {multiplierList &&
                                    multiplierList.map((mul) => {
                                      return (
                                        <option
                                          value={mul.name}
                                          key={`multiplier-${mul.id}`}
                                        >
                                          {mul?.display_name}
                                        </option>
                                      );
                                    })}
                                </Form.Select>
                              </td>
                              <td>
                                <Form.Select
                                  className="custom-input"
                                  name="multiplier_2"
                                  value={getMultiplierValue(
                                    child.multiplier_2 || ""
                                  )}
                                  onChange={(e) => {
                                    handleOnChange(e, child.id);
                                  }}
                                >
                                  <option value="" hidden>
                                    Please Select
                                  </option>

                                  <option value="">none</option>
                                  {multiplierList &&
                                    multiplierList.map((mul) => {
                                      return (
                                        <option
                                          value={mul.name}
                                          key={`multiplier-${mul.id}`}
                                        >
                                          {mul?.display_name}
                                        </option>
                                      );
                                    })}
                                </Form.Select>
                              </td>

                              <td>
                                <Form.Control
                                  type="text"
                                  className="custom-input"
                                  value={child.batch || ""}
                                  name="batch"
                                  onChange={(e) => {
                                    handleOnChange(e, child.id);
                                  }}
                                />
                              </td>
                              <td>
                                <Form.Control
                                  type="text"
                                  className="custom-input"
                                  value={child.sort || ""}
                                  name="sort"
                                  onChange={(e) => {
                                    handleOnChange(e, child.id);
                                  }}
                                />
                              </td>

                              <td>
                                <div className="d-flex">
                                  <div className="me-2 cursorPointer">
                                    <Button
                                      onClick={() => handleSubmit(child?.id)}
                                      className="p-2"
                                    >
                                      <div className="d-flex gap-2 align-items-center">
                                        <span
                                          className={
                                            !submitButtonLoader ? "ms-2" : ""
                                          }
                                        >
                                          {child?.edit_id ? "Update" : "Add"}
                                        </span>
                                        <span>
                                          {submitButtonLoader &&
                                            selectedChildIdForLoader ===
                                              child?.id && (
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
                                    onClick={() =>
                                      handleResetInputChildPageState(child?.id)
                                    }
                                  >
                                    <img
                                      src={resetIcon}
                                      width={30}
                                      alt="reset"
                                    />
                                  </span>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </Table>
                        <p className="h6 d-inline-flex align-items-center">
                          Choose Dining Types
                        </p>
                        <div className="d-flex justify-content-between ">
                          <div className="d-flex align-items-center flex-wrap">
                            {dinningOptionData.map((option) => (
                              <div
                                className="d-flex align-items-center me-4 my-2"
                                key={option.id}
                              >
                                <Form.Group>
                                  <Form.Check
                                    className="custom-input-box mb-0"
                                    type="checkbox"
                                    name={option.name}
                                    checked={
                                      child.subPageOptionsData?.[option.name] ||
                                      false
                                    }
                                    onChange={(e) =>
                                      handleSubPageOptionsChange(e, child.id)
                                    }
                                    label=""
                                    id={`${option.name}-${child?.id}`}
                                  />
                                </Form.Group>
                                <span className="mb-2 ms-2">
                                  {" "}
                                  {option.display_name}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="d-flex">
                            <div className="me-2 cursorPointer">
                              <Button
                                onClick={() => handleSaveDiningType(child)}
                                className="p-2"
                              >
                                <div className="d-flex gap-2 align-items-center">
                                  <span
                                    className={
                                      saveDiningTypeLoader &&
                                      selectedChildIdForDiningLoader ===
                                        child?.id
                                        ? ""
                                        : "ms-2"
                                    }
                                  >
                                    Save
                                  </span>
                                  <span>
                                    {saveDiningTypeLoader &&
                                      selectedChildIdForDiningLoader ===
                                        child?.id && (
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
                          </div>
                        </div>

                        <p className="h6 d-inline-flex align-items-center">
                          Internal Notes
                        </p>
                        <div className="d-flex justify-content-between editable-table">
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="private_notes"
                            value={
                              child?.subPageOptionsData?.private_notes || ""
                            }
                            className="custom-input"
                            onChange={(e) =>
                              handleSubPageOptionsChange(e, child.id)
                            }
                          />
                        </div>
                        <p className="h6 d-inline-flex align-items-center">
                          Public Notes
                        </p>
                        <div className="d-flex justify-content-between editable-table">
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="notes"
                            value={child?.subPageOptionsData?.notes || ""}
                            className="custom-input"
                            onChange={(e) =>
                              handleSubPageOptionsChange(e, child.id)
                            }
                          />
                        </div>
                        <hr
                          className="mb-5"
                          style={{
                            background: "#e14984",
                            color: "#e14984",
                            borderColor: "#e14984",
                            height: "3px",
                            opacity: 0.5,
                          }}
                        />
                      </div>
                    </React.Fragment>
                  );
                })}
            </div>
          </Col>
        </Row>
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Delete SubConfig Item</Modal.Title>
          </Modal.Header>
          <Modal.Body closeButton>
            Are you sure you want to delete the item ?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleDeleteSubPageConfig}>
              <div className="d-flex gap-2 align-items-center">
                <span className={!deleteButtonLoader ? "ms-2" : ""}>Yes</span>
                <span>
                  {deleteButtonLoader && (
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
            <Button variant="secondary" onClick={handleCloseModal}>
              No
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  );
};
export default ConfigCategoryPage;
