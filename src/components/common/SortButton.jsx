import React from "react";
import { Button } from "react-bootstrap";
import sortActiveIcon from "../../assets/icons/sort-active.svg";
import sortIcon from "../../assets/icons/sort.svg";

const SortButton = (props) => {
  const { activeSortingField, btnName, onClickSort, btnLabel } = props;
  return (
    <Button onClick={() => onClickSort(btnName)}>
      <div className="d-flex justify-content-between mx-2 align-items-center">
        <span
          className={`${
            activeSortingField === btnName ? "text-secondary" : ""
          }`}
        >
          {btnName === "customer_info" || btnName === "delivery_info" ? (
            <>
              <div> {btnLabel}</div>
              <div className="d-flex justify-content-between mx-2">
                <div>First Name</div>
                <div>Last Name</div>
              </div>
            </>
          ) : (
            btnLabel
          )}
        </span>
        <img
          src={activeSortingField === btnName ? sortActiveIcon : sortIcon}
          alt="sort-icon"
          className="height-20 cursorPointer"
        ></img>
      </div>
    </Button>
  );
};

export default SortButton;
