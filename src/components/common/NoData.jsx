import React from "react";
import noDataImage from "../../assets/images/noData.png";

const NoData = () => {
  return (
    <div className="d-flex flex-column my-4 justify-content-center align-items-center">
      <img src={noDataImage} alt="No Data" />
      <div className="h6 px-2">No orders found</div>
    </div>
  );
};

export default NoData;
