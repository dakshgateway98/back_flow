import React from "react";
import { Form } from "react-bootstrap";
import resetIcon from "../../assets/icons/reset.svg";

const SearchInput = ({ onChangeHandler, removeSearch, searchText }) => {
  return (
    <Form className="search-input-container">
      <Form.Group className="d-flex justify-content-end gap-2 align-items-center">
        <Form.Label className="search-input-label">Search: </Form.Label>
        <div className="d-flex align-items-center">
          <Form.Control
            type="text"
            onChange={onChangeHandler}
            className="search-input"
            value={searchText}
          />
          <Form.Label
            className="search-input-label cursorPointer"
            style={{ height: "28px", borderBottom: "1px solid" }}
            onClick={removeSearch}
          >
            <img alt="remove" src={resetIcon} width={25} />
          </Form.Label>
        </div>
      </Form.Group>
    </Form>
  );
};

export default SearchInput;
