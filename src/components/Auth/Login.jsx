import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Container,
  Button,
  Form,
  Image,
  Spinner,
} from "react-bootstrap";
import { signInAPI } from "../../api/auth";
import Logo from "../../assets/images/logo.png";
import { connect } from "react-redux";
import { loginSucces, loginFail } from "../../redux/actions/userActions";
import { routesConstant } from "../../routes/routeConstant";
import { getUsersByIdApi } from "../../api/configureUser";
import { setToken } from "../../api";
import { baseName, desiredPath } from "../../utils/StaticData";

const Login = (props) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const [loginButtonLoader, setLoginButtonLoader] = useState(false);

  const redirectDesiredPath = sessionStorage.getItem(desiredPath)
    ? sessionStorage.getItem(desiredPath).replace(baseName, "")
    : null;

  const onSubmit = async (event) => {
    setLoginButtonLoader(true);
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
    } else {
      setValidated(true);
      const postObj = {
        username,
        password,
      };

      const res = await signInAPI(postObj);

      if (res && res.success === true) {
        if (res?.data) {
          setToken(res?.data?.token);
          const userRes = await getUsersByIdApi(res?.data?.id);
          const payload = {
            ...res?.data,
            ...userRes?.data,
          };
          props.authSuccess(payload, res.data?.token);
          navigate(redirectDesiredPath || routesConstant.HOME);
          sessionStorage.removeItem(desiredPath);
        }
      }
    }
    setLoginButtonLoader(false);
  };

  return (
    <section className="login h-100 d-flex align-items-center">
      <Container className="h-100">
        <Form noValidate validated={validated} onSubmit={onSubmit}>
          <Row className="justify-content-center align-items-center h-100">
            <Col
              style={{
                boxShadow:
                  "0 3px 1px -2px #0003, 0 2px 2px #00000024, 0 1px 5px #0000001f",
                borderRadius: "0.25rem",
              }}
              className="p-5"
              xxl={3}
              xl={4}
              lg={5}
              md={6}
              sm={10}
            >
              <div className="text-center mb-4">
                <Image src={Logo} fluid />
              </div>
              {/* <Alert
                variant="primary"
                className="text-uppercase text-center h4 fw-light"
              >
                Log out Successful
              </Alert> */}
              <h1 className="text-center text-primary h3 mb-3">Login</h1>

              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Control
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter username
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter Password
                </Form.Control.Feedback>
              </Form.Group>
              <div className="text-end">
                <Button type="submit" variant="primary">
                  {loginButtonLoader && (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="mr-2"
                    />
                  )}
                  <span> Login </span>
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </section>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    authSuccess: (data, token) => dispatch(loginSucces(data, token)),
    authFail: () => dispatch(loginFail()),
  };
};

export default connect(null, mapDispatchToProps)(Login);
