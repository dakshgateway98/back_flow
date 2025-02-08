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
import { useSelector } from "react-redux";
import Layout from "../../components/common/layout";
import editIcon from "../../assets/icons/pencil.svg";
import { editTemplateApi, getTemplatesApi } from "../../api/templates";
import { getTemplatesConfigApi } from "../../api/configTemplates";
import resetIcon from "../../assets/icons/reset.svg";
import { displayErrorToast, displaySuccessToast } from "../../global/displayToast";
import { setToken } from "../../api";

const Templates = (props) => {
  const { token } = useSelector((state) => state.user);
  const initialState = {
    templateName: "",
    displayName: "",
    configOption: "",
    description: "",
    sort: "",
    editId: "",
  };

  const [allTemplates, setAllTemplates] = useState([]);
  const [templateState, setTemplateState] = useState(initialState);
  const [onSubmitLoader, setOnSubmitLoader] = useState(false);
  const [configTemplatesList, setConfigTemplatesList] = useState([]);
  const getAllTemplates = async () => {
    setLoader(true);
    setToken(token);
    const res = await getTemplatesApi();
    if (res && res.success === true) {
      setAllTemplates(res.data);
    }
    setLoader(false);
  };

  const onClickEdit = (temp) => {
    setTemplateState({
      templateName: temp?.template,
      displayName: temp?.name,
      configOption: temp?.config_id,
      description: temp?.description,
      sort: temp?.sort,
      editId: temp?.id,
    });
  };
  const [loader, setLoader] = useState(false);

  const handleReset = () => {
    setTemplateState(initialState);
  };

  const handleUpdate = async () => {
    const {
      editId,
      displayName,
      sort,
      description,
      templateName,
      configOption,
    } = templateState;
    if (!editId) {
      displayErrorToast("Please Select before edit");
      return;
    }
    setOnSubmitLoader(true);
    if (
      editId &&
      displayName &&
      sort &&
      description &&
      templateName &&
      configOption
    ) {
      const payLoad = {
        description: description,
        name: displayName,
        sort: sort,
        template: templateName,
        config_id: configOption,
      };
      const res = await editTemplateApi(payLoad, editId);
      if (res && res.success === true) {
        const { sort, description, name, template, id, config_id } = res.data;
        setTemplateState(initialState);
        const tempAllTemplates = [...allTemplates];
        const updatedTemplates = tempAllTemplates.map((temp) => {
          if (temp.id === res.data.id) {
            return {
              template,
              name,
              description,
              sort,
              id,
              config_id,
            };
          }
          return temp;
        });

        setAllTemplates([
          ...updatedTemplates.sort((a, b) => {
            return a.sort - b.sort || a.name.localeCompare(b.name);
          }),
        ]);
        displaySuccessToast(res.message);
      }
    } else {
      displayErrorToast("Please fill all fields", 3000);
    }
    setOnSubmitLoader(false);
  };

  const getConfigTemplateData = async () => {
    setToken(token);
    setLoader(true);
    const res = await getTemplatesConfigApi();

    if (res && res.success === true) {
      setConfigTemplatesList(res.data);
    }
    setLoader(false);
  };

  const giveConfigTemplateName = (matchID) => {
    if (matchID) {
      const temp = configTemplatesList.filter((temp) => temp.id === matchID);

      return temp.length > 0 ? temp[0]?.name : "";
    }
    return "";
  };

  useEffect(() => {
    getAllTemplates();
    getConfigTemplateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout loader={loader}>
      <Container>
        <Row className="justify-content-center">
          <Col>
            <div className="mb-3">
              <h6 className="text-primary h3 border-bottom-primary borde-primary font-weight-bold mb-3 pb-2">
                Templates
              </h6>

              <Table responsive className="editable-table">
                <colgroup>
                  <col width={140} />
                  <col width={140} />
                  <col width={140} />
                  <col width={250} />
                  <col width={80} />
                  <col width={80} />
                  <col width={80} />
                </colgroup>
                <thead className="border-0">
                  <tr>
                    <th>Template</th>
                    <th>Display Name</th>
                    <th>Config Option</th>
                    <th>Description</th>
                    <th>Sort</th>
                    <th>ID</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {allTemplates &&
                    allTemplates.length > 0 &&
                    allTemplates.map((temp) => {
                      return (
                        <tr key={temp?.id}>
                          <td
                            style={{ wordWrap: "break-word" }}
                            className="align-middle"
                          >
                            {temp?.template}
                          </td>
                          <td>
                            <td className="align-middle">{temp?.name}</td>
                          </td>
                          <td className="align-middle">
                            {giveConfigTemplateName(temp?.config_id)}
                            {/* <Form.Select className="custom-input">
                              <option value="" hidden>
                                Please Select
                              </option>
                            </Form.Select> */}
                          </td>
                          <td>
                            <td className="align-middle">
                              {temp?.description}
                            </td>
                          </td>

                          <td className="align-middle">{temp?.sort}</td>
                          <td className="align-middle">{temp?.id}</td>
                          <td>
                            {" "}
                            <img
                              className="cursorPointer"
                              onClick={() => {
                                onClickEdit(temp);
                              }}
                              alt="edit"
                              src={editIcon}
                              width={30}
                            />
                          </td>
                        </tr>
                      );
                    })}

                  <tr>
                    <td className="align-middle">
                      {templateState?.templateName || "-"}
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        className="custom-input"
                        value={templateState?.displayName || ""}
                        onChange={(e) => {
                          setTemplateState((prev) => {
                            return {
                              ...prev,
                              displayName: e.target.value,
                            };
                          });
                        }}
                      />
                    </td>
                    <td>
                      <Form.Select
                        // value={state.level}
                        value={templateState?.configOption || ""}
                        className="custom-input"
                        onChange={(e) =>
                          setTemplateState((prev) => {
                            return {
                              ...prev,
                              configOption: e.target.value,
                            };
                          })
                        }
                      >
                        <option value="" hidden>
                          Please Select
                        </option>

                        {configTemplatesList &&
                          configTemplatesList.length > 0 &&
                          configTemplatesList.map((configTemp, i) => {
                            return (
                              <option value={configTemp.id} key={configTemp.id}>
                                {configTemp?.name}
                              </option>
                            );
                          })}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        className="custom-input"
                        value={templateState?.description || ""}
                        onChange={(e) => {
                          setTemplateState((prev) => {
                            return {
                              ...prev,
                              description: e.target.value,
                            };
                          });
                        }}
                      />
                    </td>

                    <td className="align-middle">
                      <Form.Control
                        type="text"
                        className="custom-input"
                        value={templateState?.sort || ""}
                        onChange={(e) => {
                          setTemplateState((prev) => {
                            return {
                              ...prev,
                              sort: e.target.value.replace(/\D/g, ""),
                            };
                          });
                        }}
                      />
                    </td>
                    <td className="align-middle">{templateState?.editId}</td>
                    <td className="text-end">
                      {" "}
                      <div className="d-flex">
                        <div className="cursorPointer">
                          <Button
                            onClick={() => {
                              handleUpdate();
                            }}
                            className="p-2"
                          >
                            <div className="d-flex gap-2 align-items-center">
                              <span>Update</span>

                              {onSubmitLoader && (
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
                        </div>
                        <span
                          className="cursorPointer"
                          onClick={() => handleReset()}
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

export default Templates;
