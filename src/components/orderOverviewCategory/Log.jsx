import React from "react";
import { Table } from "react-bootstrap";

const Log = () => {
  return (
    <Table responsive className="grid-table-striped">
      <thead>
        <tr>
          <th className="fw-bold">Date/Time:</th>
          <th className="fw-bold">User</th>
          <th className="fw-bold">Action</th>
        </tr>
      </thead>
      <tbody className="order-overview-category-table-body">
        <tr>
          <td>Sat,April 22,2022 at 12:53pm</td>
          <td>Paulina</td>
          <td>Order Fulfilled</td>
        </tr>
        <tr>
          <td>Sat,April 22,2022 at 12:53pm</td>
          <td>Paulina</td>
          <td>Order Fulfilled</td>
        </tr>
        <tr>
          <td>Sat,April 22,2022 at 12:53pm</td>
          <td>Paulina</td>
          <td>Order Fulfilled</td>
        </tr>
        <tr>
          <td>Sat,April 22,2022 at 12:53pm</td>
          <td>Paulina</td>
          <td>Order Fulfilled</td>
        </tr>
      </tbody>
    </Table>
  );
};

export default Log;
