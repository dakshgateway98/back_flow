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
import { useDispatch, useSelector } from "react-redux";
import { addLevelApi, editLevelApi, getLevelsApi } from "../../api/level";
import Layout from "../../components/common/layout";
import {
  displayErrorToast,
  displaySuccessToast,
} from "../../global/displayToast";
import editIcon from "../../assets/icons/pencil.svg";
import resetIcon from "../../assets/icons/reset.svg";
import { routesConstant } from "../../routes/routeConstant";
import { useNavigate } from "react-router-dom";
import { setToken } from "../../api";
import { getUpdatedLevelList } from "../../redux/actions/userlevelsActions";

const CreateLevels = () => {
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const initialState = {
    name: "",
    editId: "",
    sort: "",
  };
  const [state, setState] = useState(initialState);
  const [onSubmitLoader, setOnSubmitLoader] = useState(false);

  const { token } = useSelector((state) => state.user);
  const { levelList } = useSelector((state) => state.userlevels);

  const dispatch = useDispatch();

  const getLevelsData = async () => {
    setToken(token);
    setLoader(true);
    const res = await getLevelsApi();

    if (res && res.success === true) {
      dispatch(getUpdatedLevelList(res.data));
    }
    setLoader(false);
  };

  useEffect(() => {
    getLevelsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (level) => {
    setState({
      name: level.name,
      editId: level.id,
      sort: level.sort,
    });
  };

  const handleSubmit = async () => {
    const { name, sort, editId } = state;
    if (name && sort) {
      const data = {
        name: name.trim(),
        sort: parseInt(sort),
      };
      setOnSubmitLoader(true);
      if (editId) {
        data.id = editId;
        const res = await editLevelApi(data, editId);
        if (res && res.success === true) {
          setState(initialState);

          const updatedLevelList = levelList.map((level) => {
            if (level.id === res.data.id) return res.data;
            return level;
          });
          dispatch(getUpdatedLevelList(updatedLevelList));
          displaySuccessToast(res.message);
        }
      } else {
        const res = await addLevelApi(data);
        if (res && res.success === true) {
          setState(initialState);
          const updatedLevelList = [...levelList, res.data];
          dispatch(getUpdatedLevelList(updatedLevelList));
          displaySuccessToast(res.message);
        }
      }
    } else {
      displayErrorToast("Please fill all fields", 3000);
    }
    setOnSubmitLoader(false);
  };

  const handleSort = (levelList) =>
    levelList.sort((a, b) => {
      if (a.sort !== b.sort) return a.sort - b.sort;
      else
        return a.name
          .replace(/\s/g, "")
          .localeCompare(b.name.replace(/\s/g, ""));
    });

  const handleCancel = () => {
    setState(initialState);
  };

  return (
    <Layout loader={loader}>
      <Container>
        <Row className="justify-content-left">
          <Col sm={12}>
            <div className="mb-3">
              <h6 className="text-primary h3 border-bottom-primary borde-primary font-weight-bold mb-3 pb-2">
                Create Levels
              </h6>
              <Table responsive className="editable-table">
                <colgroup>
                  <col width={160} />
                  <col width={40} />
                  <col width={40} />
                  <col width={40} />
                </colgroup>
                <thead className="border-0">
                  <tr>
                    <th>Name</th>
                    <th>Sort</th>
                    <th>Config</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {levelList &&
                    handleSort(levelList).map((level) => {
                      return (
                        <tr key={level.id}>
                          <td>{level.name}</td>
                          <td>{level.sort}</td>
                          <td>
                            <Button
                              variant="primary"
                              className="border-radius-10"
                              onClick={() =>
                                navigate(routesConstant.ConfigureLevel, {
                                  state: { levelId: level.id },
                                })
                              }
                            >
                              Config
                            </Button>
                          </td>
                          <td
                            className="text-end"
                            onClick={() => handleEdit(level)}
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
                          type="text"
                          value={state.name}
                          className="custom-input"
                          onChange={(e) =>
                            setState({
                              ...state,
                              name: e.target.value,
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
                              sort: e.target.value.replace(/\D/g, ""),
                            })
                          }
                        />
                      </Form.Group>
                    </td>
                    <td></td>
                    <td>
                      <div className="text-end">
                        <Button onClick={() => handleSubmit()} className="p-2">
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

export default CreateLevels;
