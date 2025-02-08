import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import {
  getConfigLevelsApi,
  editConfigLevelApi,
  addConfigLevelApi,
} from "../../api/configureLevel";
import { getAllPagesApi } from "../../api/pages";
import { useDispatch, useSelector } from "react-redux";
import { getLevelsApi } from "../../api/level";
import Layout from "../../components/common/layout";
import ConfigureLevelTable from "../../components/ConfigureLevels/ConfigureLevelTable";
import { displaySuccessToast } from "../../global/displayToast";
import { setToken } from "../../api";
import {
  getUpdatedLevelList,
  getUpdatedConfigLevels,
} from "../../redux/actions/userlevelsActions";
import { isEmpty } from "lodash";
import { updateAllPages } from "../../redux/actions/pageActions";

const ConfigureLevels = () => {
  const [levelId, setLevelId] = useState("");
  const [loader, setLoader] = useState(false);
  const [configLevelsState, setConfigLevelsState] = useState([]);
  const [onSaveLoader, setOnSaveLoader] = useState(false);

  const location = useLocation();
  const initialLevelId = location.state?.levelId;

  const { token } = useSelector((state) => state.user);
  const { levelList, configLevels } = useSelector((state) => state.userlevels);
  const { allPages } = useSelector((state) => state.pages);

  const dispatch = useDispatch();

  useEffect(() => {
    setConfigLevelsState(configLevels);
  }, [configLevels]);

  useEffect(() => {
    if (initialLevelId) {
      setLevelId(initialLevelId);
    } else if (!isEmpty(levelList)) {
      setLevelId(levelList[0].id);
    }
  }, [initialLevelId, levelList]);

  const getLevelsData = async () => {
    setToken(token);
    setLoader(true);
    const res = await getLevelsApi();

    if (res && res.success === true) {
      dispatch(getUpdatedLevelList(res.data));
    }
    setLoader(false);
  };

  const getConfigLevels = async () => {
    setToken(token);
    setLoader(true);
    const res = await getConfigLevelsApi();

    if (res && res.success === true) {
      dispatch(getUpdatedConfigLevels(res.data));
    }
    setLoader(false);
  };

  const getAllPages = async () => {
    setToken(token);
    setLoader(true);
    const res = await getAllPagesApi();

    if (res && res.success === true) {
      dispatch(updateAllPages(res.data));
    }
    setLoader(false);
  };

  useEffect(() => {
    if (isEmpty(levelList)) {
      getLevelsData();
    }
    if (isEmpty(configLevels)) {
      getConfigLevels();
    }
    if (isEmpty(allPages)) {
      getAllPages();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelList, configLevels, allPages]);

  const onHandleSave = async () => {
    const payload = configLevelsState.find((level) => level.id === levelId);
    const isLevelIdAvailable = configLevels.some(
      (level) => level.id === levelId
    );

    setOnSaveLoader(true);
    if (isLevelIdAvailable) {
      const res = await editConfigLevelApi(
        { access: { ...payload.access } },
        levelId
      );
      if (res && res.success === true) {
        const updatedConfigLevels = configLevels.map((level) => {
          if (level.id === res.data.id) return res.data;
          return level;
        });
        dispatch(getUpdatedConfigLevels(updatedConfigLevels));
        displaySuccessToast(res.message);
      }
    } else {
      const res = await addConfigLevelApi(payload);
      if (res && res.success === true) {
        const updatedConfigLevels = [...configLevels, res.data];
        dispatch(getUpdatedConfigLevels(updatedConfigLevels));
        displaySuccessToast(res.message);
      }
    }
    setOnSaveLoader(false);
  };
  return (
    <Layout loader={loader}>
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-3 border-bottom-primary borde-primary font-weight-bold mb-3 pb-2">
          <h6 className="text-primary h3 ">Configure Levels</h6>
          <Button
            size="sm"
            type="button"
            className="m-2"
            onClick={onHandleSave}
          >
            <span className={onSaveLoader ? "me-2" : ""}>Save</span>
            <span>
              {onSaveLoader && (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              )}
            </span>
          </Button>
        </div>
        <Row>
          <Col sm={12}>
            <div className="d-flex align-items-center mb-2">
              <span className="fw-bold me-2"> Configure level For :</span>
              <Form.Select
                className="w-auto"
                size="sm"
                value={levelId}
                onChange={(e) => {
                  setLevelId(+e.target.value);
                }}
              >
                {levelList.map((level) => {
                  return (
                    <option key={level?.id} value={level?.id}>
                      {level?.name}
                    </option>
                  );
                })}
              </Form.Select>
            </div>
            <ConfigureLevelTable
              {...{
                configLevelsState,
                setConfigLevelsState,
              }}
              pagesList={allPages}
              levelId={levelId || initialLevelId}
            />
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};
export default ConfigureLevels;
