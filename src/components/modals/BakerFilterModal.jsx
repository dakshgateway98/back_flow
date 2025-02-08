import _, { isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import {
  bakedFilterData,
  cakesFlavorSizeForBakerData,
  initialBakedFilterState,
} from "../../utils/filterData";

const getintitalState = (filterDropdown, key) => {
  const firstOption = filterDropdown.find((data) => data.filter === key)
    ?.filterValue[0];
  return firstOption || "";
};
const BakerFilterModal = (props) => {
  const {
    bakerFilterDropDown,
    currentdropDownValueForBaker,
    setCurrentDropDownValueForBaker,
    bakerFilter,
    setBakerFilter,
    searchParams,
    setSearchParams,
    ...rest
  } = props;
  const [checkBoxesfilters, setCheckBoxesFilters] = useState(bakerFilter);
  const [dropDownFilter, setdropDownFilter] = useState(
    currentdropDownValueForBaker
  );
  useEffect(() => {
    if (isEmpty(currentdropDownValueForBaker)) {
      setdropDownFilter({
        flavorCakes: getintitalState(bakerFilterDropDown, "flavorCakes"),
        sizeCakes: getintitalState(bakerFilterDropDown, "sizeCakes"),
        shapeCakes: getintitalState(bakerFilterDropDown, "shapeCakes"),
      });
    }
  }, [bakerFilterDropDown, currentdropDownValueForBaker]);

  const handleOnCheckFilter = (e) => {
    const checkName = e.target.name;
    const checkId = e.target.id;
    const filterId = checkId.split("-")[1];
    setCheckBoxesFilters((prev) => ({
      ...prev,
      [checkName]: +filterId,
    }));
  };

  const getCheckedValue = (checkName, checkId) => {
    const filterId = checkId.split("-")[1];
    return checkBoxesfilters[checkName] === +filterId;
  };

  const handleUpdateSearchObject = (
    searchParamObj,
    dropDownFilterObj,
    checkBoxesfilters
  ) => {
    if (checkBoxesfilters.flavorCakes === cakesFlavorSizeForBakerData.other) {
      searchParamObj = {
        ...searchParamObj,
        flavorCakes:
          dropDownFilterObj.flavorCakes !== "0"
            ? dropDownFilterObj.flavorCakes
            : getintitalState(bakerFilterDropDown, "flavorCakes"),
      };
    }
    if (checkBoxesfilters.sizeCakes === cakesFlavorSizeForBakerData.other) {
      searchParamObj = {
        ...searchParamObj,
        sizeCakes:
          dropDownFilterObj.sizeCakes !== "0"
            ? dropDownFilterObj.sizeCakes
            : getintitalState(bakerFilterDropDown, "sizeCakes"),
      };
    }
    if (checkBoxesfilters.shapeCakes === cakesFlavorSizeForBakerData.other) {
      searchParamObj = {
        ...searchParamObj,
        shapeCakes:
          dropDownFilterObj.shapeCakes !== "0"
            ? dropDownFilterObj.shapeCakes
            : getintitalState(bakerFilterDropDown, "shapeCakes"),
      };
    }
    return searchParamObj;
  };

  const handleOnFilter = () => {
    setBakerFilter(checkBoxesfilters);
    // set params in URL
    let tempObjForSearchParam = {};
    for (const [key, value] of searchParams.entries()) {
      tempObjForSearchParam = { ...tempObjForSearchParam, [key]: [value] };
    }
    Object.entries(checkBoxesfilters).forEach(([key, value]) => {
      tempObjForSearchParam = { ...tempObjForSearchParam, [key]: [value] };
    });
    if (
      checkBoxesfilters.flavorCakes === cakesFlavorSizeForBakerData.other ||
      checkBoxesfilters.sizeCakes === cakesFlavorSizeForBakerData.other ||
      checkBoxesfilters.shapeCakes === cakesFlavorSizeForBakerData.other
    ) {
      const filterObj = _.cloneDeep(dropDownFilter);
      tempObjForSearchParam = handleUpdateSearchObject(
        tempObjForSearchParam,
        filterObj,
        checkBoxesfilters
      );
      setCurrentDropDownValueForBaker(filterObj);
    }

    setSearchParams({
      ...tempObjForSearchParam,
    });

    props.onHide();
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
    setBakerFilter(initialBakedFilterState);
    setCheckBoxesFilters(initialBakedFilterState);
    handleClearFilterForSearchParam();
    rest.onHide();
  };

  const handleOnChangeDropDown = (e, filterName) => {
    setdropDownFilter((prev) => ({
      ...prev,
      [filterName]: e.target.value,
    }));
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
        {bakedFilterData.map((ele) => (
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
                  <div className="w-50 d-flex mx-2">
                    <Form.Select
                      style={{
                        width: "90%",
                        color: "#e14984",
                      }}
                      disabled={!getCheckedValue(ele.name, checkbox.id)}
                      id={checkbox.id}
                      onChange={(e) => handleOnChangeDropDown(e, ele.name)}
                      value={dropDownFilter[ele.name]}
                      className="pb-0 pt-0 mb-2 custom-border-secondary"
                    >
                      {bakerFilterDropDown
                        .find((data) => data.filter === ele.name)
                        .filterValue.map((data) => (
                          <option value={data} key={data}>
                            {data}
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

export default BakerFilterModal;
