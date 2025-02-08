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
import { useSelector } from "react-redux";
import Layout from "../../components/common/layout";
import { displayErrorToast, displaySuccessToast } from "../../global/displayToast";
import editIcon from "../../assets/icons/pencil.svg";
import resetIcon from "../../assets/icons/reset.svg";
import {
  addTemplatesConfigApi,
  editTemplateConfigApi,
  getTemplatesConfigApi,
} from "../../api/configTemplates";
import { setToken } from "../../api";

const initialState = {
  name: "",
  description: "",
  sort: "",
  id: "",
  editId: "",
};

const ConfigTemplateOption = (props) => {
  const { token } = useSelector((state) => state.user);
  const [configTemplatesList, setConfigTemplatesList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [onSubmitLoader, setOnSubmitLoader] = useState(false);

  const [state, setState] = useState(initialState);

  const getConfigTemplateData = async () => {
    setToken(token);
    setLoader(true);
    const res = await getTemplatesConfigApi();

    if (res && res.success === true) {
      setConfigTemplatesList(res.data);
    }
    setLoader(false);
  };

  useEffect(() => {
    getConfigTemplateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    const { name, description, sort, editId } = state;

    if (name && description && sort) {
      const data = {
        name: name.trim(),
        description: description.trim(),
        sort: parseInt(sort),
      };

      setOnSubmitLoader(true);
      if (editId) {
        data.id = editId;
        const res = await editTemplateConfigApi(data, editId);
        if (res && res.success === true) {
          setState(initialState);
          setConfigTemplatesList((prev) =>
            prev.map((p) => {
              if (p.id === res.data.id) return res.data;
              return p;
            })
          );
          displaySuccessToast(res.message);
        }
      } else {
        const res = await addTemplatesConfigApi(data);
        if (res && res.success === true) {
          setState(initialState);
          setConfigTemplatesList((prev) => [...prev, res.data]);
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
                Config Template Option
              </h6>

              <Table responsive className="editable-table">
                <colgroup style={{ minWidth: "450px" }}>
                  <col width={190} />
                  <col style={{ minWidth: "160px" }} />
                  <col width={80} />
                  <col width={80} />
                  <col width={100} />
                </colgroup>
                <thead className="border-0">
                  <tr>
                    <th>Name</th>
                    <th>description</th>
                    <th>Sort</th>
                    <th>ID</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {configTemplatesList &&
                    handleSort(configTemplatesList).map((configTemplate) => (
                      <tr key={configTemplate.id}>
                        <td className="align-middle">{configTemplate.name}</td>
                        <td>{configTemplate.description}</td>
                        <td>{configTemplate.sort}</td>
                        <td className="align-middle">{configTemplate.id}</td>
                        <td
                          className="text-end"
                          onClick={() => handleEdit(configTemplate)}
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
                        value={state.sort}
                        onChange={(e) =>
                          setState({
                            ...state,
                            sort: e.target.value.replace(/\D/g, ""),
                          })
                        }
                      />
                    </td>

                    <td className="align-middle">{state.id}</td>
                    <td>
                      <div className="d-flex justify-content-end">
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

export default ConfigTemplateOption;
