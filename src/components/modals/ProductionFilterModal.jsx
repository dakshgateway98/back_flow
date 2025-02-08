import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Table } from "react-bootstrap";
import { isEmpty } from "lodash";
import {
  fillingsAndIcedData,
  initialProductionFilterState,
  productionFiltersData,
} from "../../utils/filterData";

const getintitalState = (filterDropdown, key) => {
  const firstOption = filterDropdown.find((data) => data.filter === key)
    ?.filterValue[0];
  return firstOption ? firstOption?.value : "";
};

const ProductionFilterModal = (props) => {
  const {
    setProductionFilters,
    productionFilters,
    filterDropdown,
    setCurrentDropDownValue,
    currentdropDownValue,
    searchParams,
    setSearchParams,
    ...rest
  } = props;
  const [checkBoxesfilters, setCheckBoxesFilters] = useState(productionFilters);
  const [dropDownFilter, setdropDownFilter] = useState(currentdropDownValue);

  useEffect(() => {
    if (isEmpty(currentdropDownValue)) {
      setdropDownFilter({
        fillings: getintitalState(filterDropdown, "fillings"),
        iced: getintitalState(filterDropdown, "iced"),
      });
    }
  }, [filterDropdown, currentdropDownValue]);

  const handleOnCheckFilter = (e) => {
    const checkName = e.target.name;
    const checkId = e.target.id;
    const filterId = checkId.split("-")[1];

    setCheckBoxesFilters({
      ...checkBoxesfilters,
      [checkName]: +filterId,
    });
  };

  const handleUpdateSearchObject = (
    searchParamObj,
    dropDownFilterObj,
    checkBoxesfilters
  ) => {
    if (checkBoxesfilters.fillings === fillingsAndIcedData.other) {
      searchParamObj = {
        ...searchParamObj,
        fillings:
          dropDownFilterObj.fillings !== "0"
            ? dropDownFilterObj.fillings
            : getintitalState(filterDropdown, "fillings"),
      };
    }
    if (checkBoxesfilters.iced === fillingsAndIcedData.other) {
      searchParamObj = {
        ...searchParamObj,
        iced:
          dropDownFilterObj.iced !== "0"
            ? dropDownFilterObj.iced
            : getintitalState(filterDropdown, "iced"),
      };
    }
    return searchParamObj;
  };

  const handleOnFilter = () => {
    let tempObjForSearchParam = {};
    for (const [key, value] of searchParams.entries()) {
      tempObjForSearchParam = { ...tempObjForSearchParam, [key]: [value] };
    }
    Object.entries(checkBoxesfilters).forEach(([key, value]) => {
      tempObjForSearchParam = { ...tempObjForSearchParam, [key]: [value] };
    });

    setProductionFilters(checkBoxesfilters);
    if (
      checkBoxesfilters.fillings === fillingsAndIcedData.other ||
      checkBoxesfilters.iced === fillingsAndIcedData.other
    ) {
      setCurrentDropDownValue({ ...dropDownFilter });
      tempObjForSearchParam = handleUpdateSearchObject(
        tempObjForSearchParam,
        dropDownFilter,
        checkBoxesfilters
      );
    }
    setSearchParams({
      ...tempObjForSearchParam,
    });

    rest.onHide();
  };

  const getCheckedValue = (checkName, checkId) => {
    const filterId = checkId.split("-")[1];
    return checkBoxesfilters[checkName] === +filterId;
  };

  const handleOnChangeDropDown = (e, filterName) => {
    setdropDownFilter({
      ...dropDownFilter,
      [filterName]: e.target.value,
    });
  };

  const handleClearFilterForSearchParam = () => {
    let tempObjForSearchParam = {};
    for (const [key, value] of searchParams.entries()) {
      if (key === "startDate" || key === "days") {
        tempObjForSearchParam = { ...tempObjForSearchParam, [key]: [value] };
      } else {
        tempObjForSearchParam = { ...tempObjForSearchParam, [key]: [0] };
      }
    }
    setSearchParams({ ...tempObjForSearchParam });
  };

  const handleOnClear = () => {
    setProductionFilters(initialProductionFilterState);
    setCheckBoxesFilters(initialProductionFilterState);
    handleClearFilterForSearchParam();
    rest.onHide();
  };

  return (
    <Modal
      {...rest}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="filter-modal"
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">Filters</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table>
          <colgroup>
            <col width={160} style={{ minWidth: "210px" }} />
            <col width={160} style={{ minWidth: "210px" }} />
            <col width={160} style={{ minWidth: "210px" }} />
          </colgroup>

          <tbody className="border-0">
            <tr className="border-0">
              {productionFiltersData.map((filter) => (
                <td key={filter.column}>
                  <div>
                    {filter.data.map((ele) => (
                      <div className="boxed-container" key={ele.name}>
                        {ele.checkboxes.map((checkbox) => (
                          <Form.Group className="form-group" key={checkbox.id}>
                            <Form.Check
                              label=""
                              type="radio"
                              onChange={handleOnCheckFilter}
                              checked={getCheckedValue(ele.name, checkbox.id)}
                              className="custom-input-box checkbox-24"
                              id={checkbox.id}
                              name={ele.name}
                            />
                            {checkbox?.dropdownValues ? (
                              <div className="w-100 d-flex justify-content-end">
                                <Form.Select
                                  style={{
                                    width: "90%",
                                    color: "#e14984",
                                  }}
                                  disabled={
                                    !getCheckedValue(ele.name, checkbox.id)
                                  }
                                  id={checkbox.id}
                                  onChange={(e) =>
                                    handleOnChangeDropDown(e, ele.name)
                                  }
                                  value={dropDownFilter[ele.name]}
                                  className="pb-0 pt-0 mb-2 ml-2 custom-border-secondary"
                                >
                                  {filterDropdown
                                    .find((data) => data.filter === ele.name)
                                    .filterValue.map((ele) => (
                                      <option value={ele.value} key={ele.value}>
                                        {ele.name}
                                      </option>
                                    ))}
                                </Form.Select>
                              </div>
                            ) : (
                              <Form.Label>{checkbox.displayName}</Form.Label>
                            )}
                          </Form.Group>
                        ))}
                      </div>
                    ))}
                  </div>
                </td>
              ))}
              {/* 
              <td>
                <div className="">
                  <div className="boxed-container">
                    <Form.Group className="form-group">
                      <Form.Check
                        disabled
                        label=""
                        type="checkbox"
                        className="custom-input-box checkbox-24"
                        name={"item1"}
                      />
                      <Form.Label>Show All Fillings</Form.Label>
                    </Form.Group>
                    <Form.Group className="form-group">
                      <Form.Check
                        disabled
                        label=""
                        type="checkbox"
                        className="custom-input-box checkbox-24 mr-2"
                        name={"item1"}
                      />
                      <div className="w-100 d-flex justify-content-end">
                        <Form.Select
                          style={{
                            width: "90%",
                            color: "#e14984",
                          }}
                          className="pb-0 pt-0 mb-2 ml-2 custom-border-secondary"
                        >
                          <option value="">1</option>
                          <option value="">1</option>
                          <option value="">1</option>
                        </Form.Select>
                      </div>
                    </Form.Group>
                  </div>
                  <div className="boxed-container">
                    <Form.Group className="form-group">
                      <Form.Check
                        disabled
                        label=""
                        type="checkbox"
                        className="custom-input-box checkbox-24"
                        name={"item1"}
                      />
                      <Form.Label>Show Iced All</Form.Label>
                    </Form.Group>
                    <Form.Group className="form-group">
                      <Form.Check
                        disabled
                        label=""
                        type="checkbox"
                        className="custom-input-box checkbox-24"
                        name={"item1"}
                      />

                      <div className="w-100 d-flex justify-content-end">
                        <Form.Select
                          style={{
                            width: "90%",
                            color: "#e14984",
                          }}
                          className="pb-0 pt-0 mb-2 ml-2 custom-border-secondary"
                        >
                          <option value="">1</option>
                          <option value="">1</option>
                          <option value="">1</option>
                        </Form.Select>
                      </div>
                    </Form.Group>
                  </div>
                </div>
              </td> */}
            </tr>
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button
          style={{
            border: "1px solid #e14984",
          }}
          className="secondary-btn"
          onClick={handleOnClear}
        >
          Clear
        </Button>
        <Button onClick={handleOnFilter}>Filter</Button>
      </Modal.Footer>
    </Modal>
  );
};
export default ProductionFilterModal;
