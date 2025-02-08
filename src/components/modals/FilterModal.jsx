import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import {
  commonFilterData,
  initialCommonFilterState,
} from "../../utils/filterData";
import { pageId } from "../../utils/StaticData";

const FilterModal = (props) => {
  const {
    currentFilters,
    setCurrentFilters,
    selectedPageID,
    searchParams,
    setSearchParams,
    ...rest
  } = props;

  const [checkBoxesfilters, setCheckBoxesFilters] = useState(currentFilters);

  useEffect(() => {
    setCheckBoxesFilters({ ..._.cloneDeep(currentFilters) });
  }, [currentFilters]);

  const handleOnCheckFilter = (e) => {
    const checkName = e.target.name;
    const checkId = e.target.id;
    const filterId = checkId.split("-")[1];
    setCheckBoxesFilters({
      ...checkBoxesfilters,
      [checkName]: +filterId,
    });
  };

  const getCheckedValue = (checkName, checkId) => {
    const filterId = checkId.split("-")[1];
    return checkBoxesfilters[checkName] === +filterId;
  };

  const handleOnFilter = () => {
    let tempObjForSearchParam = {};
    for (const [key, value] of searchParams.entries()) {
      tempObjForSearchParam = { ...tempObjForSearchParam, [key]: [value] };
    }
    Object.entries(checkBoxesfilters).forEach(([key, value]) => {
      tempObjForSearchParam = { ...tempObjForSearchParam, [key]: [value] };
    });
    setSearchParams({
      ...tempObjForSearchParam,
    });
    setCurrentFilters(checkBoxesfilters);
    props.onHide();
  };

  const handleClearFilterForSearchParam = () => {
    let tempObjForSearchParam = {};
    for (const [key, value] of searchParams.entries()) {
      if (checkBoxesfilters[key]) {
        tempObjForSearchParam = { ...tempObjForSearchParam, [key]: [0] };
      } else {
        tempObjForSearchParam = { ...tempObjForSearchParam, [key]: [value] };
      }
    }
    setSearchParams({ ...tempObjForSearchParam });
  };

  const handleOnClear = () => {
    setCurrentFilters(initialCommonFilterState);
    setCheckBoxesFilters(initialCommonFilterState);
    handleClearFilterForSearchParam();
    rest.onHide();
  };

  const handleFilterData = (filterData) => {
    if (selectedPageID !== pageId?.decorator) {
      return filterData.filter((data) => data.name !== "cakeAssembled");
    }
    return filterData;
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
        {handleFilterData(commonFilterData).map((filter) => (
          <div className={`${filter.name}-container`} key={filter.name}>
            {filter.checkboxes.map((checkbox) => (
              <Form.Group className="form-group" key={checkbox.id}>
                <Form.Check
                  label=""
                  type="radio"
                  onChange={handleOnCheckFilter}
                  checked={getCheckedValue(filter.name, checkbox.id)}
                  className="custom-input-box checkbox-24"
                  id={checkbox.id}
                  name={filter.name}
                />
                <Form.Label>{checkbox.displayName}</Form.Label>
              </Form.Group>
            ))}
          </div>
        ))}
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

export default FilterModal;
