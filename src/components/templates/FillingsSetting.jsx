import { isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToken } from "../../api";
import {
  addCalcSettingsApi,
  deleteCalcSettingsApi,
  editCalcSettingsApi,
  getCalcSettingsApi,
} from "../../api/calcSettings";
import { getAppSettingByIDApi } from "../../api/settings";
import deleteIcon from "../../assets/icons/delete.svg";
import editIcon from "../../assets/icons/pencil.svg";
import resetIcon from "../../assets/icons/reset.svg";
import {
  displayErrorToast,
  displaySuccessToast,
} from "../../global/displayToast";
import { getBakerCalcSelection } from "../../redux/actions/bakerCalcSelectionActions";
import { getUpdatedCalcSetting } from "../../redux/actions/calcSettingsActions";
import { orderToken, setting } from "../../utils/StaticData";
import CakeSpinner from "../common/CakeSpinner";

const initialState = {
  flavor: "",
  large_cc_weekday_walkin: "",
  large_cc_weekend_walkin: "",
  large_cc_batch: "",
  mini_cc_weekday_walkin: "",
  mini_cc_weekend_walkin: "",
  mini_cc_batch: "",
  recipe_id: "",
  sort: "",
  id: "",
};

const FillingsSetting = (props) => {
  const { selectedPageID } = props;
  const [settingsLoader, setSettingsLoader] = useState(false);
  const [updateLoader, setUpdateLoader] = useState(false);
  const [state, setState] = useState(initialState);
  const [selectedID, setSelectedID] = useState("");

  const { calcSettingsList } = useSelector((state) => state.calcSettings);
  const { bakerCalcSelectionList } = useSelector(
    (state) => state.bakerCalcSelection
  );

  const dispatch = useDispatch();

  const handleCloseConfirmbox = () => setSelectedID("");

  const getCalcSettings = async () => {
    setToken(orderToken);
    setSettingsLoader(true);
    const res = await getCalcSettingsApi();
    if (res && res.success === true) {
      dispatch(getUpdatedCalcSetting(res?.data));
    }
    setSettingsLoader(false);
  };

  useEffect(() => {
    const getCategoryID = async () => {
      setToken(orderToken);
      setSettingsLoader(true);
      const res = await getAppSettingByIDApi(setting.bakers_calculator);
      if (res && res.success) {
        dispatch(getBakerCalcSelection(res?.data?.settings));
      }
      setSettingsLoader(false);
    };
    if (isEmpty(bakerCalcSelectionList)) {
      getCategoryID();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPageID, bakerCalcSelectionList]);

  useEffect(() => {
    if (isEmpty(calcSettingsList)) {
      getCalcSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calcSettingsList]);

  const handleSubmit = async () => {
    if (state.editId) {
      if (
        state.flavor &&
        state.large_cc_weekday_walkin &&
        state.large_cc_weekend_walkin &&
        state.large_cc_batch &&
        state.mini_cc_weekday_walkin &&
        state.mini_cc_weekend_walkin &&
        state.mini_cc_batch &&
        state.recipe_id &&
        state.sort
      ) {
        setUpdateLoader(true);
        const payloadData = {
          flavor: state.flavor,
          large_cc_weekday_walkin: +state.large_cc_weekday_walkin,
          large_cc_weekend_walkin: +state.large_cc_weekend_walkin,
          large_cc_batch: +state.large_cc_batch,
          mini_cc_weekday_walkin: +state.mini_cc_weekday_walkin,
          mini_cc_weekend_walkin: +state.mini_cc_weekend_walkin,
          mini_cc_batch: +state.mini_cc_batch,
          recipe_id: +state.recipe_id,
          sort: +state.sort,
        };

        const res = await editCalcSettingsApi(payloadData, state?.editId);
        if (res && res.success) {
          setState(initialState);
          const updatedCalcSetting = calcSettingsList.map((settingData) => {
            if (settingData.id === res.data.id) return res.data;
            return settingData;
          });
          dispatch(getUpdatedCalcSetting(updatedCalcSetting));
          displaySuccessToast(res.message);
        }
        setUpdateLoader(false);
      } else {
        displayErrorToast("Please fill all fields", 3000);
      }
    } else {
      if (
        state.flavor &&
        state.large_cc_weekday_walkin &&
        state.large_cc_weekend_walkin &&
        state.large_cc_batch &&
        state.mini_cc_weekday_walkin &&
        state.mini_cc_weekend_walkin &&
        state.mini_cc_batch &&
        state.sort
      ) {
        setUpdateLoader(true);
        const payloadData = {
          flavor: state.flavor,
          large_cc_weekday_walkin: +state.large_cc_weekday_walkin,
          large_cc_weekend_walkin: +state.large_cc_weekend_walkin,
          large_cc_batch: +state.large_cc_batch,
          mini_cc_weekday_walkin: +state.mini_cc_weekday_walkin,
          mini_cc_weekend_walkin: +state.mini_cc_weekend_walkin,
          mini_cc_batch: +state.mini_cc_batch,
          recipe_id: +state.recipe_id,
          sort: +state.sort,
        };
        const res = await addCalcSettingsApi(payloadData);
        setState(initialState);

        if (res && res.success) {
          const updatedCalcSetting = [...calcSettingsList, res.data];
          dispatch(getUpdatedCalcSetting(updatedCalcSetting));
        }
        displaySuccessToast(res.message);
        setUpdateLoader(false);
      }
    }
  };

  const handleEdit = (settingData) => {
    setState({
      flavor: settingData?.flavor,
      large_cc_weekday_walkin: settingData?.large_cc_weekday_walkin.toString(),
      large_cc_weekend_walkin: settingData?.large_cc_weekend_walkin.toString(),
      large_cc_batch: settingData?.large_cc_batch.toString(),
      mini_cc_weekday_walkin: settingData?.mini_cc_weekday_walkin.toString(),
      mini_cc_weekend_walkin: settingData?.mini_cc_weekend_walkin.toString(),
      mini_cc_batch: settingData?.mini_cc_batch.toString(),
      recipe_id: settingData?.recipe_id.toString(),
      sort: settingData?.sort ? settingData?.sort.toString() : "0",
      editId: settingData?.id,
    });
  };

  const handleDelete = async () => {
    const updatedCalcSetting = calcSettingsList.filter((settingData) => {
      return settingData.id !== +selectedID;
    });
    dispatch(getUpdatedCalcSetting(updatedCalcSetting));
    handleCloseConfirmbox();
    await deleteCalcSettingsApi(selectedID);
  };

  const handleSort = (flavoursData) => {
    flavoursData.sort((a, b) => {
      if (a.sort !== b.sort) return a.sort - b.sort;
      else
        return a.flavor
          .replace(/\s/g, "")
          .localeCompare(b.flavor.replace(/\s/g, ""));
    });
    return flavoursData;
  };

  const handleCancel = () => {
    setState(initialState);
  };

  return (
    <>
      {settingsLoader ? (
        <CakeSpinner />
      ) : (
        <>
          <h2 className="text-secondary h4 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2 ">
            Daily Bake Numbers
          </h2>
          <div className="d-flex justify-content-center text-center pb-5">
            <section className="overflow-auto">
              <table className="editable-table">
                <colgroup>
                  <col width={230} />
                  <col width={120} />
                  <col width={120} />
                  <col width={120} />
                  <col width={120} />
                  <col width={120} />
                  <col width={120} />
                  <col width={120} />
                  <col width={120} />
                  <col width={120} />
                </colgroup>
                <thead>
                  <tr className="text-center">
                    <th></th>
                    <td colSpan="3">
                      <div className="bottomBorder mx-2 p-1">
                        Large Cupcakes
                      </div>
                    </td>
                    <td colSpan="3">
                      <div className="bottomBorder mx-2 p-1 ">
                        Mini Cupcakes
                      </div>
                    </td>
                    <th></th>
                    <th></th>
                  </tr>
                  <tr>
                    <td className="text-start bottomBorder">Flavor</td>
                    <td className="bottomBorder">
                      <div>Weekday</div>
                      <div>Walk in</div>
                    </td>
                    <td className="bottomBorder">
                      <div>Weekend</div>
                      <div>Walk in</div>
                    </td>
                    <td className="bottomBorder">Batch</td>
                    <td className="bottomBorder">
                      <div>Weekday</div>
                      <div>Walk in</div>
                    </td>
                    <td className="bottomBorder">
                      <div>Weekend</div>
                      <div>Walk in</div>
                    </td>
                    <td className="bottomBorder">Batch</td>
                    <td className="bottomBorder">Recipe IDs</td>
                    <td className="bottomBorder">Sort</td>
                    <td className="bottomBorder"></td>
                  </tr>
                </thead>
                <tbody className="table-bordered table-light">
                  {calcSettingsList &&
                    handleSort(calcSettingsList).map((settingData) => (
                      <tr key={settingData?.id}>
                        <td className="text-start cellBorder">
                          {settingData?.flavor}
                        </td>
                        <td>{settingData?.large_cc_weekday_walkin}</td>
                        <td>{settingData?.large_cc_weekend_walkin}</td>
                        <td className="cellBorder">
                          {settingData?.large_cc_batch}
                        </td>
                        <td>{settingData?.mini_cc_weekday_walkin}</td>
                        <td>{settingData?.mini_cc_weekend_walkin}</td>
                        <td className="cellBorder">
                          {settingData?.mini_cc_batch}
                        </td>
                        <td className="cellBorder">{settingData?.recipe_id}</td>
                        <td>{settingData?.sort || "0"}</td>
                        <td>
                          <img
                            className="cursorPointer edit-icon me-2"
                            alt="edit"
                            src={editIcon}
                            width={20}
                            onClick={() => handleEdit(settingData)}
                          />
                          <img
                            className="cursorPointer edit-icon"
                            alt="edit"
                            src={deleteIcon}
                            width={20}
                            onClick={() =>
                              setSelectedID(settingData?.id.toString())
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  <tr className="text-center">
                    <td className="text-start cellBorder bottomBorder p-1">
                      <Form.Control
                        type="text"
                        className="custom-input w-75 cakeFillingInput text-center"
                        value={state.flavor}
                        onChange={(e) => {
                          setState({
                            ...state,
                            flavor: e.target.value,
                          });
                        }}
                      />
                    </td>
                    <td className="bottomBorder">
                      <Form.Control
                        type="text"
                        className="custom-input w-50 mx-auto cakeFillingInput text-center"
                        value={state.large_cc_weekday_walkin}
                        onChange={(e) => {
                          setState({
                            ...state,
                            large_cc_weekday_walkin: e.target.value.replace(
                              /\D/g,
                              ""
                            ),
                          });
                        }}
                      />
                    </td>
                    <td className="bottomBorder">
                      <Form.Control
                        type="text"
                        className="custom-input w-50 mx-auto cakeFillingInput text-center"
                        value={state.large_cc_weekend_walkin}
                        onChange={(e) => {
                          setState({
                            ...state,
                            large_cc_weekend_walkin: e.target.value.replace(
                              /\D/g,
                              ""
                            ),
                          });
                        }}
                      />
                    </td>
                    <td className="cellBorder bottomBorder ">
                      <Form.Control
                        type="text"
                        className="custom-input w-50 mx-auto cakeFillingInput text-center"
                        value={state.large_cc_batch}
                        onChange={(e) => {
                          setState({
                            ...state,
                            large_cc_batch: e.target.value.replace(/\D/g, ""),
                          });
                        }}
                      />
                    </td>
                    <td className="bottomBorder">
                      <Form.Control
                        type="text"
                        className="custom-input w-50 mx-auto cakeFillingInput text-center"
                        value={state.mini_cc_weekday_walkin}
                        onChange={(e) => {
                          setState({
                            ...state,
                            mini_cc_weekday_walkin: e.target.value.replace(
                              /\D/g,
                              ""
                            ),
                          });
                        }}
                      />
                    </td>
                    <td className="bottomBorder">
                      <Form.Control
                        type="text"
                        className="custom-input w-50 mx-auto cakeFillingInput text-center"
                        value={state.mini_cc_weekend_walkin}
                        onChange={(e) => {
                          setState({
                            ...state,
                            mini_cc_weekend_walkin: e.target.value.replace(
                              /\D/g,
                              ""
                            ),
                          });
                        }}
                      />
                    </td>
                    <td className="cellBorder bottomBorder">
                      <Form.Control
                        type="text"
                        className="custom-input w-50 mx-auto cakeFillingInput text-center"
                        value={state.mini_cc_batch}
                        onChange={(e) => {
                          setState({
                            ...state,
                            mini_cc_batch: e.target.value.replace(/\D/g, ""),
                          });
                        }}
                      />
                    </td>
                    <td className="cellBorder bottomBorder">
                      <Form.Control
                        type="text"
                        className="custom-input w-50 mx-auto cakeFillingInput text-center"
                        value={state.recipe_id}
                        onChange={(e) => {
                          setState({
                            ...state,
                            recipe_id: e.target.value.replace(/\D/g, ""),
                          });
                        }}
                      />
                    </td>
                    <td className="bottomBorder">
                      <Form.Control
                        type="text"
                        className="custom-input w-50 mx-auto cakeFillingInput text-center"
                        value={state.sort}
                        onChange={(e) => {
                          setState({
                            ...state,
                            sort: e.target.value.replace(/\D/g, ""),
                          });
                        }}
                      />
                    </td>
                    <td className="bottomBorder ">
                      <div className="d-flex justify-content-center">
                        <Button
                          onClick={() => handleSubmit()}
                          className="p-2 m-1 "
                        >
                          <div className="d-flex gap-2 align-items-center">
                            {state.editId ? "Update" : "Add"}
                            {updateLoader && (
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                        </Button>
                        {state.id && (
                          <span
                            className="cursorPointer "
                            onClick={() => handleCancel()}
                          >
                            <img src={resetIcon} width={30} alt="reset" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          <h2 className="text-secondary h4 border-bottom-secondary borde-primary font-weight-bold mb-3 pb-2 ">
            Category IDs
          </h2>
          <div className="editable-table">
            {bakerCalcSelectionList?.map((setting) => (
              <div className="m-2 row" key={setting?.id}>
                <div className="pe-5 col-3">{setting?.title}</div>
                <div className="border border-2 border-dark w-25 p-1 text-break col-3">
                  {setting?.content.toString()}
                </div>
              </div>
            ))}
          </div>

          <Modal show={!isEmpty(selectedID)} onHide={handleCloseConfirmbox}>
            <Modal.Header closeButton>
              <Modal.Title>Delete setting</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete this setting?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseConfirmbox}>
                Close
              </Button>
              <Button variant="primary" onClick={handleDelete}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
      {/* </Container> */}
      {/* </Layout> */}
    </>
  );
};

export default FillingsSetting;
