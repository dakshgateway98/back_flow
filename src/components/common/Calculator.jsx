import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { isEmpty } from "lodash";

const Calculator = (props) => {
  const { selectedFlavour, handleAddCalcResult } = props;
  const [calcInput, setCalcInput] = useState("");

  const enterNumber = (e) => {
    setCalcInput((oldvalue) => {
      if (!oldvalue && e.target.value === "0") {
        return oldvalue;
      }
      return oldvalue + e.target.value;
    });
  };

  const clearAll = () => {
    setCalcInput("");
  };

  const backSpace = () => {
    setCalcInput((oldvalue) => {
      return oldvalue.slice(0, -1);
    });
  };

  const defaultCalcInput = (e) => {
    setCalcInput((oldvalue) => {
      if (calcInput && oldvalue) {
        return (parseInt(oldvalue) + parseInt(e.target.value)).toString();
      }
      return e.target.value;
    });
  };

  const calcResult = async (e) => {
    if (calcInput) {
      setTimeout(function () {
        document.getElementById("calc-response").innerHTML = "(response)";
      }, 5000);
      const response = !isEmpty(selectedFlavour)
        ? e.target.value + calcInput + " " + selectedFlavour.flavor
        : "Select flavor";
      document.getElementById("calc-response").innerHTML = response;

      handleAddCalcResult(parseInt(e.target.value + calcInput));
      setCalcInput("");
    }
  };

  return (
    <>
      <Container className="calc">
        <Row>
          <Col className="p-1 col-12">
            <label
              className="calc_label square border text-center"
              id="calc-response"
            >
              (response)
            </label>
          </Col>
        </Row>
        <Row>
          <Col className="p-1  col-4">
            <label className=" calc_label square border border-2 text-center overflow-auto">
              {calcInput ? calcInput : "0"}
            </label>
          </Col>
          <Col className="p-1 col-8">
            <label
              className={` ${
                !isEmpty(selectedFlavour)
                  ? "flavour w-100 p-3"
                  : "  calc_label  border border-2 "
              }   square  text-center`}
            >
              {!isEmpty(selectedFlavour)
                ? props?.selectedFlavour.flavor
                : "Select flavor"}
            </label>
          </Col>
        </Row>
        <Row className="p-2">
          <hr />
        </Row>
        <Row>
          <Col className="p-1 col-4">
            <button
              className="calc_btn custom square border"
              onClick={defaultCalcInput}
              value="24"
            >
              24
            </button>
          </Col>
          <Col className="p-1 col-4">
            <button
              className="calc_btn custom square border"
              onClick={defaultCalcInput}
              value="12"
            >
              12
            </button>
          </Col>
          <Col className="p-1 col-4">
            <button
              className="calc_btn custom square border"
              onClick={defaultCalcInput}
              value="10"
            >
              10
            </button>
          </Col>
        </Row>
        <Row className="p-2">
          <hr />
        </Row>
        <Row>
          <Col className="p-1 col-4">
            <button
              className="calc_btn square border"
              onClick={enterNumber}
              value="1"
            >
              1
            </button>
          </Col>
          <Col className="p-1 col-4">
            <button
              className="calc_btn square border"
              onClick={enterNumber}
              value="2"
            >
              2
            </button>
          </Col>
          <Col className="p-1 col-4">
            <button
              className="calc_btn square border"
              onClick={enterNumber}
              value="3"
            >
              3
            </button>
          </Col>
        </Row>
        <Row>
          <Col className="p-1 col-4">
            <button
              className="calc_btn square border"
              onClick={enterNumber}
              value="4"
            >
              4
            </button>
          </Col>
          <Col className="p-1 col-4">
            <button
              className="calc_btn square border"
              onClick={enterNumber}
              value="5"
            >
              5
            </button>
          </Col>
          <Col className="p-1 col-4">
            <button
              className="calc_btn square border"
              onClick={enterNumber}
              value="6"
            >
              6
            </button>
          </Col>
        </Row>
        <Row>
          <Col className="p-1 col-4">
            <button
              className="calc_btn square border"
              onClick={enterNumber}
              value="7"
            >
              7
            </button>
          </Col>
          <Col className="p-1 col-4">
            <button
              className="calc_btn square border"
              onClick={enterNumber}
              value="8"
            >
              8
            </button>
          </Col>
          <Col className="p-1 col-4">
            <button
              className="calc_btn square border"
              onClick={enterNumber}
              value="9"
            >
              9
            </button>
          </Col>
        </Row>
        <Row>
          <Col className="p-1 col-4">
            <button className="calc_btn square border" onClick={clearAll}>
              CLR
            </button>
          </Col>
          <Col className="p-1 col-4">
            <button
              className="calc_btn square border"
              onClick={enterNumber}
              value="0"
            >
              0
            </button>
          </Col>
          <Col className="p-1 col-4">
            <button className="calc_btn square border" onClick={backSpace}>
              &#60;
            </button>
          </Col>
        </Row>
        <Row>
          <Col className="p-1 col-8">
            <button className="calc_btn add" value="+" onClick={calcResult}>
              ADD
            </button>
          </Col>
          <Col className="p-1 col-4">
            <button className="calc_btn sub" value="-" onClick={calcResult}>
              SUB
            </button>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Calculator;
