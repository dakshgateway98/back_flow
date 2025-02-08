import React, { useState, useEffect } from "react";
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
import Layout from "../../components/common/layout";
import editIcon from "../../assets/icons/pencil.svg";
import resetIcon from "../../assets/icons/reset.svg";
import {
  displayErrorToast,
  displaySuccessToast,
} from "../../global/displayToast";
import { addPhasesApi, editPhasesApi, getPhasesApi } from "../../api/phases";
import { setToken } from "../../api";
import { getUpdatePhases } from "../../redux/actions/phaseAction";

const Phases = (props) => {
  const [loader, setLoader] = useState(false);
  const [onSubmitLoader, setOnSubmitLoader] = useState(false);

  const { token } = useSelector((state) => state.user);
  const { phasesList } = useSelector((state) => state.phases);

  const dispatch = useDispatch();

  const initialState = {
    name: "",
    description: "",
    sort: "",
    id: "",
    editId: "",
  };

  const [state, setState] = useState(initialState);

  const getPhasesData = async () => {
    setToken(token);
    setLoader(true);
    const res = await getPhasesApi();

    if (res && res.success === true) {
      dispatch(getUpdatePhases(res.data));
    }
    setLoader(false);
  };

  useEffect(() => {
    getPhasesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleSubmit = async () => {
    const { name, description, sort, id, editId } = state;

    if (name && description && sort) {
      const data = id
        ? {
            name: name.trim(),
            description: description.trim(),
            sort: parseInt(sort),
            id: parseInt(id),
          }
        : {
            name: name.trim(),
            description: description.trim(),
            sort: parseInt(sort),
          };
      setOnSubmitLoader(true);
      if (editId) {
        data.id = editId;
        const res = await editPhasesApi(data, id);
        if (res && res.success === true) {
          setState(initialState);
          const updatedPhases = phasesList.map((phase) => {
            if (phase.id === res.data.id) return res.data;
            return phase;
          });
          dispatch(getUpdatePhases(updatedPhases));
          displaySuccessToast(res.message);
        }
      } else {
        const res = await addPhasesApi(data);
        if (res && res.success === true) {
          setState(initialState);
          const updatedPhases = [...phasesList, res.data];
          dispatch(getUpdatePhases(updatedPhases));
          displaySuccessToast(res.message);
        }
      }
    } else {
      displayErrorToast("Please fill all fields", 3000);
    }
    setOnSubmitLoader(false);
  };

  const handleEdit = (phase) => {
    setState({
      name: phase.name,
      description: phase.description,
      sort: phase.sort.toString(),
      editId: phase.id,
      id: phase.id.toString(),
    });
  };

  const handleCancel = () => {
    setState(initialState);
  };

  const handleSort = (levelList) =>
    levelList.sort((a, b) => {
      if (a.sort !== b.sort) return a.sort - b.sort;
      else
        return a.name
          .replace(/\s/g, "")
          .localeCompare(b.name.replace(/\s/g, ""));
    });

  return (
    <Layout loader={loader}>
      <Container>
        <Row className="justify-content-center">
          <Col>
            <div className="mb-3">
              <h6 className="text-primary h3 border-bottom-primary borde-primary font-weight-bold mb-3 pb-2">
                Phases
              </h6>

              <Table responsive className="editable-table">
                <colgroup style={{ minWidth: "450px" }}>
                  <col width={190} />
                  <col style={{ minWidth: "160px" }} />
                  <col width={90} />
                  <col width={90} />
                  <col width={90} />
                  <col width={90} />
                </colgroup>
                <thead className="border-0">
                  <tr>
                    <th>Name</th>
                    <th>Discription</th>
                    <th>Sort</th>
                    <th>ID</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {phasesList &&
                    handleSort(phasesList).map((phase) => (
                      <tr key={phase.id}>
                        <td className="align-middle">{phase.name}</td>
                        <td>{phase.description}</td>
                        <td>{phase.sort}</td>

                        <td className="align-middle">{phase.id}</td>

                        <td
                          className="text-end"
                          onClick={() => handleEdit(phase)}
                        >
                          {" "}
                          <img
                            className="cursorPointer"
                            alt="edit"
                            src={editIcon}
                            width={30}
                          />
                        </td>
                      </tr>
                    ))}
                  <tr>
                    <td>
                      <Form.Control
                        type="text"
                        className="custom-input"
                        value={state.name}
                        onChange={(e) =>
                          setState({
                            ...state,
                            name: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        className="custom-input"
                        value={state.description}
                        onChange={(e) =>
                          setState({
                            ...state,
                            description: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        className="custom-input"
                        onChange={(e) =>
                          setState({
                            ...state,
                            sort: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        value={state.sort}
                      />
                    </td>
                    <td>
                      {state.editId ? (
                        <span>{state.editId}</span>
                      ) : (
                        <Form.Control
                          type="text"
                          className="custom-input"
                          onChange={(e) =>
                            setState({
                              ...state,
                              id: e.target.value.replace(/\D/gi, ""),
                            })
                          }
                          value={state.id}
                        />
                      )}
                    </td>
                    <td>
                      <div className="d-flex">
                        <div className="me-2 cursorPointer">
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

export default Phases;
