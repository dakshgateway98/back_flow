import React from "react";
import { Table, Form } from "react-bootstrap";
import subDirectorySVG from "../../assets/icons/sub-directory.svg";

const ConfigureLevelTable = ({
  configLevelsState,
  setConfigLevelsState,
  pagesList,
  levelId,
}) => {
  const getAccessValue = (pageId) =>
    configLevelsState.find((item) => item.id === levelId)?.access?.[pageId];

  const handleChange = (e, pageId) => {
    const requiredLevel = [...configLevelsState].find(
      (item) => item.id === levelId
    );
    if (requiredLevel) {
      setConfigLevelsState((prev) =>
        prev.map((level) => {
          if (level.id === levelId) {
            return {
              ...level,
              access: { ...level.access, [pageId]: e.target.checked },
            };
          }
          return level;
        })
      );
    } else {
      setConfigLevelsState([
        ...configLevelsState,
        { id: levelId, access: { [pageId]: e.target.checked } },
      ]);
    }
  };

  return (
    <Table responsive className="editable-table">
      <colgroup>
        <col width={200} />
        <col style={{ minWidth: "100px" }} />
      </colgroup>
      <thead className="border-0">
        <tr>
          <th>Pages</th>
          <th>Access</th>
        </tr>
      </thead>

      <tbody>
        {pagesList &&
          pagesList.map((page) => (
            <React.Fragment key={page.id}>
              <tr className="pl-2">
                <td>{page.display_name}</td>
              </tr>
              <tr></tr>
              {page.children &&
                page.children.map((childPage) => (
                  <tr key={childPage.id}>
                    <td className="d-flex align-items-center ">
                      <img
                        src={subDirectorySVG}
                        className="p-1"
                        height={30}
                        width={30}
                        alt=""
                      />
                      {childPage.display_name}
                    </td>
                    <td>
                      <Form.Group className="position-relative">
                        <Form.Check
                          className="custom-input-box"
                          type="checkbox"
                          id={childPage.id}
                          style={{ marginBottom: "-5px" }}
                          label=""
                          checked={getAccessValue(childPage.id) || false}
                          onChange={(e) => handleChange(e, childPage.id)}
                        />
                      </Form.Group>
                    </td>
                  </tr>
                ))}
            </React.Fragment>
          ))}
      </tbody>
    </Table>
  );
};
export default ConfigureLevelTable;
