import _, { isEmpty } from "lodash";
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
  addAppSettingApi,
  addTextMessageslApi,
  editAppSettingApi,
  editTextMessagesApi,
  getAppSettingApi,
  getPrintSettingApi,
  getTextMessagesApi,
} from "../../api/settings";
import editIcon from "../../assets/icons/pencil.svg";
import resetIcon from "../../assets/icons/reset.svg";
import CakeSpinner from "../../components/common/CakeSpinner";
import Layout from "../../components/common/layout";
import {
  displayErrorToast,
  displaySuccessToast,
} from "../../global/displayToast";
import {
  updateBakersCalculator,
  updateBoardSizes,
  updateCurrentPrintSetting,
  updateSettingsMessage,
} from "../../redux/actions/settingsAction";
import { setting } from "../../utils/StaticData";

const ids = [
  setting.bakers_calculator,
  setting.printer_setting_ID,
  setting.multiplier_ID,
];
const Settings = (props) => {
  const { token } = useSelector((state) => state.user);
  const { settingsMessageList, currentPrintSetting, bakerCalcSetting } =
    useSelector((state) => state.settings);
  const [loader, setLoader] = useState(false);
  const [onSubmitLoader, setOnSubmitLoader] = useState(false);
  const [onBakerCalcSubmitLoader, setOnBakerCalcSubmitLoader] = useState(false);
  const [onSettingSubmitLoader, setOnSettingSubmitLoader] = useState(false);

  const [printSettingsOptions, setPrintSettingsOptions] = useState([]);
  const [checkJsonDataForSetting, setCheckJsonDataForSetting] = useState(false);

  const [printSelectionValue, setPrintSelectionValue] = useState("");
  const [printSelectionLoader, setPrintSelectionLoader] = useState(false);

  const [allAppSettings, setAllAppSettings] = useState([]);
  const [allAppSettingsLoader, setAllAppSettingsLoader] = useState(false);

  const [allSectionLoader, setAllSectionLoader] = useState(null);
  const [allJsonCheck, setAllJsonCheck] = useState(null);

  useEffect(() => {
    if (currentPrintSetting) {
      setPrintSelectionValue(currentPrintSetting?.id);
    }
  }, [currentPrintSetting]);

  const initialState = {
    title: "",
    content: "",
    sort: "",
    editId: "",
  };

  const bakerInitialState = {
    title: "",
    content: [],
    description: "",
    editId: "",
  };

  const settingInitialState = {
    title: "",
    settings: "",
    description: "",
  };

  const [state, setState] = useState(initialState);
  const [bakersCalcState, setBakersCalcState] = useState(bakerInitialState);
  const [settingState, setSettingState] = useState(settingInitialState);

  const dispatch = useDispatch();

  const getSettingsData = async () => {
    const res = await getTextMessagesApi();

    if (res && res.success === true) {
      dispatch(updateSettingsMessage(res.data));
    }
  };

  useEffect(() => {
    if (!isEmpty(printSettingsOptions)) {
      getAppSetting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printSettingsOptions]);

  const getPrintSettings = async () => {
    const res = await getPrintSettingApi();

    if (res && res.success === true) {
      setPrintSettingsOptions(res.data);
    }
  };

  const getAppSetting = async () => {
    setAllAppSettingsLoader(true);
    const res = await getAppSettingApi();

    if (res && res.success === true) {
      setAllAppSettings(() =>
        res.data.map((obj) => {
          return {
            ...obj,
            settings: JSON.stringify(obj.settings, undefined, 4),
          };
        })
      );

      const boardSizesData =
        res.data.find((val) => val?.id === setting.board_sizes_ID)?.settings ||
        {};
      dispatch(updateBoardSizes({ ...boardSizesData }));

      const bakersClac =
        res.data.find((val) => val?.id === setting.bakers_calculator)
          ?.settings || [];
      dispatch(updateBakersCalculator(bakersClac));

      if (!isEmpty(printSettingsOptions)) {
        const printerSetting =
          res.data.find((val) => val?.id === setting.printer_setting_ID)
            ?.settings?.id || "";
        const printData = printSettingsOptions.find(
          (val) => val.id === +printerSetting
        );
        dispatch(updateCurrentPrintSetting(printData));
      }
    }

    setAllAppSettingsLoader(false);
  };
  const defaultUseEffect = async () => {
    setToken(token);
    setLoader(true);
    if (isEmpty(settingsMessageList)) await getSettingsData();
    await getPrintSettings();
    setLoader(false);
  };

  useEffect(() => {
    defaultUseEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (data) => {
    setState({
      title: data.title,
      content: data.content,
      sort: data.sort.toString(),
      editId: data.id,
    });
  };

  const handleBakersCalcEdit = (data) => {
    setBakersCalcState({
      title: data.title,
      content: data.content,
      description: data.description,
      editId: data.id,
    });
  };

  const handleSubmit = async () => {
    const { title, content, sort, editId } = state;
    if (title && content && sort) {
      const data = {
        title: title.trim(),
        content: content.trim(),
        sort,
      };
      setOnSubmitLoader(true);
      if (editId) {
        const res = await editTextMessagesApi(data, editId);
        if (res && res.success === true) {
          setState(initialState);
          const updatedSettings = settingsMessageList.map((message) => {
            if (message.id === res.data.id) return res.data;
            return message;
          });
          dispatch(updateSettingsMessage(updatedSettings));
          displaySuccessToast(res.message);
        }
      } else {
        const res = await addTextMessageslApi(data);
        if (res && res.success === true) {
          setState(initialState);
          const updatedSettings = [...settingsMessageList, res.data];
          dispatch(updateSettingsMessage(updatedSettings));
          displaySuccessToast(res.message);
        }
      }
    } else {
      displayErrorToast("Please fill all fields", 3000);
    }
    setOnSubmitLoader(false);
  };

  const handleCancel = () => {
    setState(initialState);
  };

  const handleBakerCalcCancle = () => {
    setBakersCalcState(bakerInitialState);
  };

  const handleSort = (levelList) =>
    levelList.sort((a, b) => {
      if (a.sort !== b.sort) return a.sort - b.sort;
      else
        return a.title
          .replace(/\s/g, "")
          .localeCompare(b.title.replace(/\s/g, ""));
    });

  const editAppSetting = async (postData, id) => {
    const res = await editAppSettingApi(postData, id);
    if (res && res.success) {
      displaySuccessToast(res.message);
      if (id === setting.board_sizes_ID) {
        dispatch(updateBoardSizes(res.data.settings));
      } else if (id === setting.printer_setting_ID) {
        const printData = printSettingsOptions.find(
          (val) => val.id === +res?.data?.settings?.id
        );
        dispatch(updateCurrentPrintSetting(printData));
      } else if (id === setting.bakers_calculator) {
        dispatch(updateBakersCalculator(res.data.settings));
      }
    } else {
      displayErrorToast(res.message);
    }
    setPrintSelectionLoader(false);
  };

  const handleBakerCalcSubmit = async () => {
    const { title, content, description, editId } = bakersCalcState;
    if (title && !isEmpty(content) && description) {
      setOnBakerCalcSubmitLoader(true);
      if (editId) {
        const data = {
          title: title.trim(),
          content: content,
          description: description.trim(),
          id: editId,
        };
        const updatedBakerCalcSettings = bakerCalcSetting.map((bakerData) => {
          if (bakerData.id === editId) return data;
          return bakerData;
        });
        setBakersCalcState(bakerInitialState);
        const postData = { settings: updatedBakerCalcSettings };
        await editAppSetting(postData, setting.bakers_calculator);
      } else {
        const ids = bakerCalcSetting.map((bakerData) => bakerData.id);
        const maxId = Math.max(...ids);
        const data = {
          title: title.trim(),
          content: content,
          description: description.trim(),
          id: maxId + 1,
        };
        const updatedBakerCalcSettings = [...bakerCalcSetting, data];
        setBakersCalcState(bakerInitialState);
        const postData = { settings: updatedBakerCalcSettings };
        await editAppSetting(postData, setting.bakers_calculator);
      }
    } else {
      displayErrorToast("Please fill all fields", 3000);
    }
    setOnBakerCalcSubmitLoader(false);
  };

  const handlePrinterSubmit = async () => {
    const postData = { settings: { id: printSelectionValue } };
    setPrintSelectionLoader(true);
    await editAppSetting(postData, setting.printer_setting_ID);
  };

  const handleSettingSubmit = async () => {
    const { title, settings, description } = settingState;
    setOnSettingSubmitLoader(true);
    if (title && settings && description) {
      if (settingState?.editId) {
        const postData = {
          name: title,
          settings: settings,
          description: description,
          id: settingState?.editId,
        };
        let tempSettingArr = _.clone(allAppSettings);
        tempSettingArr = tempSettingArr.map((s) => {
          if (s.id === settingState?.editId) {
            return postData;
          } else {
            return s;
          }
        });
        setAllAppSettings([...tempSettingArr]);
        const res = await editAppSettingApi(
          { ...postData, settings: JSON.parse(postData.settings) },
          +settingState?.editId
        );
        if (res && res.success === true) {
          displaySuccessToast(res?.message);
        }
      } else {
        const ids = allAppSettings.map((setting) => setting.id);
        const maxId = Math.max(...ids);
        const postData = {
          name: title,
          settings: settings,
          description: description,
          id: maxId + 1,
        };
        setAllAppSettings([...allAppSettings, postData]);
        const res = await addAppSettingApi({
          ...postData,
          settings: JSON.parse(postData.settings),
        });
        if (res && res.success === true) {
          displaySuccessToast(res?.message);
        }
      }
      setSettingState(settingInitialState);
    } else {
      displayErrorToast("Please fill all fields", 3000);
    }
    setOnSettingSubmitLoader(false);
  };

  const handleSettingCancle = () => {
    setSettingState(settingInitialState);
  };

  const bakerCalcSection = (sectionId) => {
    return (
      <section className="my-4" key={sectionId}>
        <h6 className="text-secondary h4 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2">
          Bakers Calculator Selection
        </h6>
        <Table responsive className="editable-table">
          <colgroup>
            <col width={200} />
            <col width={400} />
            <col width={300} />
            <col width={100} />
          </colgroup>
          <thead className="border-0">
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Id</th>
            </tr>
          </thead>
          <tbody>
            {!isEmpty(bakerCalcSetting) &&
              bakerCalcSetting.map((bakersClacData, i) => {
                return (
                  <tr key={i}>
                    <td>{bakersClacData.title}</td>
                    <td>{bakersClacData.description}</td>
                    <td className="text-break">
                      {bakersClacData.content &&
                        bakersClacData.content.join(",")}
                    </td>
                    <td
                      className="text-end"
                      onClick={() => handleBakersCalcEdit(bakersClacData)}
                    >
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
            <tr>
              <td>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={bakersCalcState.title}
                    className="custom-input"
                    onChange={(e) =>
                      setBakersCalcState({
                        ...bakersCalcState,
                        title: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </td>
              <td>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={bakersCalcState.description}
                    className="custom-input"
                    onChange={(e) =>
                      setBakersCalcState({
                        ...bakersCalcState,
                        description: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </td>
              <td>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    value={bakersCalcState.content.join(",") || ""}
                    className="custom-input"
                    onChange={(e) => {
                      var regex = /^[0-9.,\b]+$/;
                      if (regex.test(e.target.value) || e.target.value === "") {
                        setBakersCalcState({
                          ...bakersCalcState,
                          content: e.target.value.split(","),
                        });
                      }
                    }}
                  />
                </Form.Group>
              </td>
              <td>
                <div className="d-flex justify-content-end">
                  <div className="text-end">
                    <Button
                      onClick={() => handleBakerCalcSubmit()}
                      className="p-2"
                    >
                      <div className="d-flex gap-2 align-items-center">
                        <span
                          className={!onBakerCalcSubmitLoader ? "ms-2" : ""}
                        >
                          {bakersCalcState?.editId ? "Update" : "Add"}
                        </span>
                        <span>
                          {onBakerCalcSubmitLoader && (
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
                    onClick={() => handleBakerCalcCancle()}
                  >
                    <img src={resetIcon} width={30} alt="reset" />
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </Table>
      </section>
    );
  };

  const handleJsonForSetting = (text) => {
    setSettingState((prev) => ({
      ...prev,
      settings: text,
    }));
    if (typeof text !== "string") {
      setCheckJsonDataForSetting(false);
    }
    try {
      if (JSON.parse(text) && !isEmpty(JSON.parse(text)))
        setCheckJsonDataForSetting(true);
    } catch (error) {
      setCheckJsonDataForSetting(false);
    }
  };

  const handleSingleSettingUpdate = async (settingSection) => {
    setAllSectionLoader(settingSection?.id);
    const postData = { settings: JSON.parse(settingSection.settings) };
    await editAppSetting(postData, settingSection?.id);
    setAllSectionLoader(null);
  };

  const handleEditMainSetting = (setting) => {
    const tempSetting = {
      editId: setting?.id,
      title: setting?.name || "",
      description: setting?.description || "",
      settings: setting?.settings || "",
    };
    setSettingState({ ...tempSetting });
    setCheckJsonDataForSetting(true);
  };

  const handleAllJsonValue = (settingSection, text) => {
    setAllAppSettings((previous) =>
      previous.map((obj) => {
        if (obj?.id === settingSection?.id) {
          return { ...obj, settings: text };
        }
        return obj;
      })
    );
    if (typeof text !== "string") {
      setAllJsonCheck(null);
    }
    try {
      if (JSON.parse(text) && !isEmpty(JSON.parse(text)))
        setAllJsonCheck(settingSection?.id);
    } catch (error) {
      setAllJsonCheck(null);
    }
  };

  const printSection = (sectionID) => {
    return (
      <section className="mt-4" key={sectionID}>
        <h6 className="text-secondary h4 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2">
          Printer Selection
        </h6>
        <p className="text-content-muted">
          Choose which printer the orders should print to.
        </p>
        <div>
          <Form.Select
            value={printSelectionValue}
            onChange={(e) => setPrintSelectionValue(e.target.value)}
            className="custom-input mb-0 w-25"
          >
            <option value="" hidden>
              Printer name (id)
            </option>
            <option value="">none</option>
            {!isEmpty(printSettingsOptions) &&
              printSettingsOptions.map((print, i) => {
                return (
                  <option value={print.id} key={`dropdown-${print.id}`}>
                    {`${print?.name} - (${print.id})`}
                  </option>
                );
              })}
          </Form.Select>
          <div className="text-end">
            <Button
              disabled={isEmpty(printSelectionValue)}
              onClick={() => handlePrinterSubmit()}
              className="p-2"
            >
              <div
                className="d-flex gap-2 align-items-center"
                style={{ maxHeight: "10px" }}
              >
                <span className={!printSelectionLoader ? "ms-2" : ""}>
                  Save
                </span>
                <span>
                  {printSelectionLoader && (
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
      </section>
    );
  };

  const handleSection = (setting, sectionId) => {
    return (
      <section className="mt-4" key={sectionId}>
        <h6 className="text-secondary h4 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2 d-flex justify-content-between">
          {setting?.name}{" "}
          <img
            onClick={() => handleEditMainSetting(setting)}
            className="cursorPointer"
            alt="edit"
            src={editIcon}
            width={30}
          />
        </h6>
        <p className="text-content-muted">{setting?.description}</p>
        <div>
          <textarea
            className="w-100 p-2"
            placeholder="{JSON}"
            value={setting?.settings || ""}
            onChange={(e) => handleAllJsonValue(setting, e.target.value)}
          />
          <div className="text-end">
            <Button
              disabled={allJsonCheck === setting?.id ? false : true}
              onClick={() => handleSingleSettingUpdate(setting)}
              className="p-2"
            >
              <div
                className="d-flex gap-2 align-items-center"
                style={{ maxHeight: "10px" }}
              >
                <span
                  className={!allSectionLoader === setting?.id ? "ms-2" : ""}
                >
                  Save
                </span>
                <span>
                  {allSectionLoader === setting?.id && (
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
      </section>
    );
  };

  return (
    <Layout loader={loader}>
      <Container>
        <Row className="justify-content-left">
          <Col sm={12}>
            <h6 className="text-primary h3 border-bottom-primary borde-primary font-weight-bold mb-3 pb-2">
              Settings
            </h6>
            <div className="mb-3">
              {/* Text Messages */}
              <section>
                {/* <h6 className="text-primary h3 border-bottom-primary borde-primary font-weight-bold mb-3 pb-2">
                  Settings
                </h6> */}
                <h6 className="text-secondary h4 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2">
                  Text Messages
                </h6>

                <Table responsive className="editable-table">
                  <colgroup>
                    <col width={140} />
                    <col width={300} />
                    <col width={60} />
                    <col width={60} />
                    <col width={80} />
                  </colgroup>
                  <thead className="border-0">
                    <tr>
                      <th>title</th>
                      <th>content</th>
                      <th>sort</th>
                      <th>id</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settingsMessageList &&
                      handleSort(settingsMessageList).map((text, i) => {
                        return (
                          <tr key={i}>
                            <td>{text.title}</td>
                            <td>{text.content}</td>
                            <td>{text.sort}</td>
                            <td>{text.id}</td>
                            <td
                              className="text-end"
                              onClick={() => handleEdit(text)}
                            >
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
                    <tr>
                      <td>
                        <Form.Group>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={state.title}
                            className="custom-input"
                            onChange={(e) =>
                              setState({
                                ...state,
                                title: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                      </td>
                      <td>
                        <Form.Group>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={state.content}
                            className="custom-input"
                            onChange={(e) =>
                              setState({
                                ...state,
                                content: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                      </td>
                      <td>
                        <Form.Group>
                          <Form.Control
                            type="text"
                            value={state.sort}
                            className="custom-input"
                            onChange={(e) =>
                              setState({
                                ...state,
                                sort: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                      </td>
                      <td>{state.editId}</td>
                      <td>
                        <div className="d-flex justify-content-end">
                          <div className="text-end">
                            {/* Please make these below span as buttons such that disable funtionality we can provide */}
                            <Button
                              onClick={() => handleSubmit()}
                              className="p-2"
                            >
                              <div className="d-flex gap-2 align-items-center">
                                <span className={!onSubmitLoader ? "ms-2" : ""}>
                                  {state.editId ? "Update" : "Add"}
                                </span>
                                <span>
                                  {onSubmitLoader && (
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
              </section>
              {/* Clear Cachae  */}
              <section className="my-4">
                <h2 className="text-secondary h4 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2">
                  Clear Cache
                </h2>
                <div className="row my-3">
                  <div className="col-3 mx-2">
                    <Button className="w-100">Product Cache</Button>
                  </div>
                  <div className="col-3 mx-2">
                    <Button className="w-100">Recipe Cache</Button>
                  </div>
                  <div className="col-3 mx-2">
                    <Button className="w-100">Modifier Cache</Button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-3 mx-2">
                    <Button className="w-100">Modifier Recipe Cache</Button>
                  </div>
                  <div className="col-3 mx-2">
                    <Button className="w-100">Ingredients Cache</Button>
                  </div>
                  <div className="col-3 mx-2">
                    <Button className="w-100">(one More)</Button>
                  </div>
                </div>
              </section>
              {allAppSettingsLoader ? (
                <CakeSpinner />
              ) : (
                !isEmpty(allAppSettings) &&
                allAppSettings.map((settingSection) => {
                  if (ids.includes(settingSection?.id)) {
                    switch (settingSection?.id) {
                      case setting.bakers_calculator:
                        return bakerCalcSection(settingSection?.id);
                      case setting.printer_setting_ID:
                        return printSection(settingSection?.id);
                      default:
                        return (
                          <React.Fragment
                            key={settingSection?.id}
                          ></React.Fragment>
                        );
                    }
                  } else {
                    return handleSection(settingSection, settingSection?.id);
                  }
                })
              )}
              <hr className="border border-2 border-dark mt-4" />
              {/* Add setting section  */}
              <div className="d-flex w-100">
                <div className="w-25 pe-4">
                  <p className="text-content-muted">Title</p>
                  <textarea
                    className=" w-100 p-2 border-dark"
                    value={settingState.title}
                    onChange={(e) =>
                      setSettingState((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="w-75">
                  <p className="text-content-muted">Description</p>
                  <textarea
                    className=" w-100 p-2 border-dark"
                    value={settingState.description}
                    onChange={(e) =>
                      setSettingState((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <p className="text-content-muted">Content</p>
                <textarea
                  className=" w-100 p-2 border-dark"
                  value={settingState.settings}
                  onChange={(e) => handleJsonForSetting(e.target.value)}
                />
                <div className="d-flex justify-content-end">
                  <div className="text-end">
                    <Button
                      disabled={!checkJsonDataForSetting}
                      onClick={() => handleSettingSubmit()}
                      className="p-2"
                    >
                      <div className="d-flex gap-2 align-items-center">
                        <span className={!onSettingSubmitLoader ? "ms-2" : ""}>
                          {settingState?.editId ? "Update" : "Add"}
                        </span>
                        <span>
                          {onSettingSubmitLoader && (
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
                    onClick={() => handleSettingCancle()}
                  >
                    <img src={resetIcon} width={30} alt="reset" />
                  </span>
                </div>
              </div>

              {/* Dev Mode */}
              <section>
                <h2 className="text-secondary h4 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2">
                  Dev Mode
                </h2>
                <p className="text-content-muted">
                  Dev mode will enable troubleshooting data to appear throughout
                  the site for admin's only.
                </p>
                <div className="d-flex">
                  <span className="text-content-muted">On</span>
                  <Form.Group>
                    <Form.Check
                      className="custom-switch  mx-2"
                      type="checkbox"
                      checked={state.active || ""}
                      id="d"
                      label=""
                      onChange={(e) =>
                        setState({
                          ...state,
                          active: e.target.checked,
                        })
                      }
                    />
                  </Form.Group>
                  <span className="text-content-muted">Off</span>
                </div>
              </section>
            </div>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default Settings;
