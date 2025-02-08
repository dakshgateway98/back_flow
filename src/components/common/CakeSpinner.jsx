import React from "react";
import { Spinner } from "react-bootstrap";
import spinner from "../../assets/images/cake.gif";

const CakeSpinner = (props) => {
  return (
    <div
      className={`d-flex justify-content-center align-items-center h-100 ${props.className}`}
    >
      <Spinner
        children={<img src={spinner} height={props.height} alt="" />}
        variant="danger"
      ></Spinner>
    </div>
  );
};

CakeSpinner.defaultProps = {
  height: "",
};

export default CakeSpinner;
