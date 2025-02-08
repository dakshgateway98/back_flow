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
import { getLevelsApi } from "../../api/level";
import {
  addUserApi,
  editUserApi,
  getActiveUsersApi,
  getInActiveUsersApi,
} from "../../api/configureUser";
import Layout from "../../components/common/layout";
import {
  displayErrorToast,
  displaySuccessToast,
} from "../../global/displayToast";
import editIcon from "../../assets/icons/pencil.svg";
import resetIcon from "../../assets/icons/reset.svg";
import sortIcon from "../../assets/icons/sort.svg";
import { useSelector } from "react-redux";
import { setToken } from "../../api";

const initialState = {
  first_name: "",
  last_name: "",
  username: "",
  pass: "",
  level: "",
  active: false,
  id: "",
  color: "#ffffff",
};

let order = false;

const ConfigureUser = () => {
  const { token } = useSelector((state) => state.user);
  const [userList, setUserList] = useState([initialState]);
  const [levelList, setLevelList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [isActive, setisActive] = useState(true);
  const [onSubmitLoader, setOnSubmitLoader] = useState(false);

  const [state, setState] = useState(initialState);

  const getActiveUsersData = async () => {
    setLoader(true);
    setToken(token);
    const res = await getActiveUsersApi();
    if (res && res.success === true) {
      setUserList(res.data);
    }
    setLoader(false);
  };

  const getInactiveUsersData = async () => {
    setLoader(true);
    setToken(token);
    const res = await getInActiveUsersApi();

    if (res && res.success === true) {
      setUserList(res.data);
    }
    setLoader(false);
  };

  const getLevelsData = async () => {
    setLoader(true);
    setToken(token);
    const res = await getLevelsApi();

    if (res && res.success === true) {
      setLevelList(res.data);
    }
    setLoader(false);
  };

  useEffect(() => {
    if (isActive) {
      getActiveUsersData();
    } else {
      getInactiveUsersData();
    }
    getLevelsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const handleEdit = (user) => {
    setState({
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      pass: user.pass,
      level: user.level,
      editId: user.id,
      active: user.active,
      color: user.color,
    });
  };

  const handleSubmit = async () => {
    const {
      first_name,
      last_name,
      username,
      pass,
      level,
      editId,
      active,
      color,
    } = state;
    setOnSubmitLoader(true);
    if (editId) {
      if (first_name && last_name && username && level) {
        const payloadData = pass
          ? {
              first_name,
              last_name,
              username,
              active,
              level,
              color,
              password: pass,
            }
          : {
              first_name,
              last_name,
              username,
              level,
              color,
              active,
            };

        const res = await editUserApi(payloadData, editId);
        if (res && res.success === true) {
          const {
            active: resActive,
            password,
            level,
            username,
            id,
            color,
          } = res.data;
          setState(initialState);
          if (isActive === resActive) {
            setUserList((prev) =>
              prev.map((user) => {
                if (user.id === res.data.id) {
                  return {
                    first_name,
                    last_name,
                    username,
                    pass: password,
                    id,
                    level,
                    active: resActive,
                    color,
                  };
                }
                return user;
              })
            );
          } else {
            const tempUserList = [...userList].filter(
              (user) => user.id !== res.data.id
            );
            setUserList(tempUserList);
          }
          displaySuccessToast(res.message);
        }
      } else {
        displayErrorToast("Please fill all fields", 3000);
      }
    } else {
      if (first_name && last_name && username && level && pass) {
        const payLoadData = {
          first_name,
          last_name,
          username,
          level,
          active,
          password: pass,
          color,
        };
        const res = await addUserApi(payLoadData);
        if (res && res.success === true) {
          const {
            first_name,
            last_name,
            active: resActive,
            password,
            level,
            username,
            id,
          } = res.data;

          setState(initialState);
          if (isActive === resActive) {
            setUserList((prev) => [
              ...prev,
              {
                first_name,
                last_name,
                pass: password,
                username,
                id,
                level,
                active: resActive,
                color,
              },
            ]);
          }
          displaySuccessToast(res.message);
        }
      } else {
        displayErrorToast("Please fill all fields", 3000);
      }
    }
    setOnSubmitLoader(false);
  };

  const handleCancel = () => {
    setState(initialState);
  };

  const handleSort = (sortField) => {
    if (sortField) {
      order = !order;
      const sortedList = [...userList].sort((a, b) => {
        if (a[sortField] === undefined || null) return 1;
        if (b[sortField] === undefined || null) return -1;
        if (
          a[sortField] === undefined ||
          (null && b[sortField] === undefined) ||
          null
        )
          return 0;

        return (
          a[sortField].toString().localeCompare(b[sortField].toString(), "en", {
            numeric: true,
          }) * (order ? 1 : -1)
        );
      });
      setUserList(sortedList);
    }
  };

  const onHandleActiveUser = () => {
    setisActive(true);
  };

  const onHandleInActiveUser = () => {
    setisActive(false);
  };

  const getUserLevel = (userlevelId) => {
    const userLevel = levelList.find((level) => level.id === userlevelId);
    return userLevel?.name || "-";
  };

  return (
    <Layout {...{ loader, onHandleActiveUser, onHandleInActiveUser }}>
      <Container>
        <Row className="justify-content-center">
          <Col>
            <div className="mb-3">
              <h6 className="text-primary h3 border-bottom-primary borde-primary font-weight-bold mb-3 pb-2">
                Users : {isActive ? "Active" : "Inactive"}
              </h6>

              <Table responsive className="editable-table">
                <colgroup>
                  <col width={160} />
                  <col width={160} />
                  <col width={160} />
                  <col width={140} />
                  <col width={80} />
                  <col width={80} />
                  <col width={160} />
                  <col width={60} />
                  <col width={140} />
                </colgroup>
                <thead className="border-0">
                  <tr>
                    <th>
                      <span>First Name</span>
                      <span
                        className="mx-1"
                        onClick={() => handleSort("first_name")}
                      >
                        <img
                          src={sortIcon}
                          alt="sort-icon"
                          className="height-20  cursorPointer"
                        ></img>
                      </span>
                    </th>
                    <th>
                      <span>Last Name</span>
                      <span
                        className="mx-1"
                        onClick={() => handleSort("last_name")}
                      >
                        <img
                          src={sortIcon}
                          alt="sort-icon"
                          className="height-20  cursorPointer"
                        ></img>
                      </span>
                    </th>
                    <th>
                      <span>User Name</span>
                      <span
                        className="mx-1"
                        onClick={() => handleSort("username")}
                      >
                        <img
                          src={sortIcon}
                          alt="sort-icon"
                          className="height-20  cursorPointer"
                        ></img>
                      </span>
                    </th>
                    <th>Password</th>
                    <th>Active</th>
                    <th>ID#</th>
                    <th>Level</th>
                    <th>Color</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {userList &&
                    userList.map((user, i) => {
                      const {
                        first_name,
                        last_name,
                        username,
                        active,
                        id,
                        level,
                        pass,
                        color,
                      } = user;
                      return (
                        <tr key={i}>
                          <td>{first_name || "-"}</td>
                          <td>{last_name || "-"}</td>
                          <td>{username || "-"}</td>
                          <td>{pass || "-"}</td>
                          <td>
                            <Form.Group>
                              <Form.Check
                                disabled
                                label=""
                                type="checkbox"
                                className="custom-input-box"
                                name={"user" + i}
                                checked={active}
                              />
                            </Form.Group>
                          </td>
                          <td>{id}</td>
                          <td>{getUserLevel(level)}</td>
                          <td>
                            <input
                              disabled
                              className="custom-input-box"
                              type="color"
                              value={color || "#FFFFFF"}
                              id="color"
                              label=""
                            />
                          </td>
                          <td
                            className="text-end"
                            onClick={() => handleEdit(user)}
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
                          className="custom-input"
                          value={state?.first_name || ""}
                          onChange={(e) =>
                            setState({
                              ...state,
                              first_name: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </td>
                    <td>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          value={state?.last_name || ""}
                          className="custom-input"
                          onChange={(e) =>
                            setState({
                              ...state,
                              last_name: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </td>
                    <td>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          value={state?.username || ""}
                          className="custom-input"
                          onChange={(e) =>
                            setState({
                              ...state,
                              username: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </td>
                    <td>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          value={state?.pass || ""}
                          className="custom-input"
                          onChange={(e) =>
                            setState({
                              ...state,
                              pass: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </td>
                    <td>
                      <Form.Group className="position-relative">
                        <Form.Check
                          className="custom-input-box"
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
                    </td>
                    <td>{state.editId}</td>
                    <td>
                      <Form.Select
                        value={state.level || ""}
                        className="custom-input"
                        onChange={(e) =>
                          setState({
                            ...state,
                            level: e.target.value,
                          })
                        }
                      >
                        <option value="" hidden>
                          Please Select
                        </option>
                        {levelList &&
                          levelList.map((level, i) => {
                            return (
                              <option value={level.id} key={level.id}>
                                {level?.name}
                              </option>
                            );
                          })}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Group className="position-relative">
                        <input
                          className="custom-input-box"
                          type="color"
                          value={state.color || "#FFFFFF"}
                          id="color"
                          label=""
                          onChange={(e) =>
                            setState({
                              ...state,
                              color: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </td>
                    <td>
                      <div className="d-flex justify-content-end">
                        <div className="me-2 cursorPointer">
                          {/* {state.editId ? (
                            <img src={updateIcon} width={30} alt="update" />
                          ) : (
                            <img src={addIcon} width={30} alt="add" />
                          )} */}
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
            </div>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default ConfigureUser;
