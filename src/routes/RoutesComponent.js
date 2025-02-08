import React from "react";

import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Auth from "../containers/admin/Auth";
import Home from "../containers/Home";
import PageNotFound from "../components/common/PageNotFound";
import { connect } from "react-redux";
import { routesConstant } from "./routeConstant";
import ConfigureUser from "../containers/admin/ConfigureUser";
import ConfigureLevels from "../containers/admin/ConfigureLevels";
import CreateLevels from "../containers/admin/CreateLevels";
import Pages from "../containers/admin/Pages";
import Templates from "../containers/admin/Templates";
import Phases from "../containers/admin/Phases";
import Settings from "../containers/admin/Settings";
import ConfigTemplatesOption from "../containers/admin/ConfigTemplatesOption";
import ConfigHomePage from "../containers/admin/ConfigHomePage";
import ProductPage from "../containers/category/ProductPage";
import ConfigCategoryPage from "../containers/admin/ConfigCategoryPage";
import OrderOverViewCategory from "../containers/customerServices/OrderOverViewCategory";
import Fillings from "../components/templates/Fillings";
import OrderOverview from "../containers/customerServices/OrderOverview";
import FillingsSetting from "../components/templates/FillingsSetting";
import CakeLabels from "../components/templates/CakeLabels";
import Reports from "../containers/reports/Reports";
import { baseName, desiredPath } from "../utils/StaticData";

const ProtectedRoute = ({
  isLoggedIn,
  redirectPath = routesConstant.LOGIN,
  children,
}) => {
  if (!isLoggedIn) {
    const { pathname, search } = window.location;
    sessionStorage.setItem(desiredPath, pathname + search);

    return <Navigate to={redirectPath} replace />;
  } else {
    sessionStorage.removeItem(desiredPath);
  }

  return children;
};

const RoutesComponent = (props) => {
  const { isLoggedIn } = props;

  return (
    <>
      <Router basename={baseName}>
        <Routes>
          <Route
            path="/"
            element={
              <Navigate
                replace
                to={isLoggedIn ? routesConstant.HOME : routesConstant.LOGIN}
              />
            }
          />

          <Route path={routesConstant.LOGIN} {...props} element={<Auth />} />

          <Route
            path={routesConstant.HOME}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Home />
              </ProtectedRoute>
            }
            {...props}
          />

          <Route
            path={routesConstant.ConfigureUser}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ConfigureUser />
              </ProtectedRoute>
            }
            {...props}
          />

          <Route
            path={routesConstant.CreateLevels}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <CreateLevels />
              </ProtectedRoute>
            }
            {...props}
          />

          <Route
            path={routesConstant.ConfigureLevel}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ConfigureLevels />
              </ProtectedRoute>
            }
            {...props}
          />
          <Route
            path={routesConstant.Pages}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Pages />
              </ProtectedRoute>
            }
            {...props}
          />
          <Route
            path={routesConstant.Templates}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Templates />
              </ProtectedRoute>
            }
            {...props}
          />
          <Route
            path={routesConstant.Phases}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Phases />
              </ProtectedRoute>
            }
            {...props}
          />
          <Route
            path={routesConstant.Settings}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Settings />
              </ProtectedRoute>
            }
            {...props}
          />
          <Route
            path={routesConstant.ConfigTemplateOption}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ConfigTemplatesOption />
              </ProtectedRoute>
            }
            {...props}
          />
          <Route
            path={routesConstant.configHomePage}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ConfigHomePage />
              </ProtectedRoute>
            }
            {...props}
          />
          <Route
            path={routesConstant.productPage}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ProductPage />
              </ProtectedRoute>
            }
            {...props}
          />
          <Route
            path={routesConstant.configCategoryPage}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ConfigCategoryPage />
              </ProtectedRoute>
            }
            {...props}
          />
          <Route
            path={routesConstant.orderOverview}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <OrderOverview />
              </ProtectedRoute>
            }
            {...props}
          />
          <Route
            path={routesConstant.orderOverviewCategory}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <OrderOverViewCategory />
              </ProtectedRoute>
            }
            {...props}
          />

          <Route
            path={routesConstant.cakeFillings}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Fillings />
              </ProtectedRoute>
            }
            {...props}
          />

          <Route
            path={routesConstant.cakeFillingsSetting}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <FillingsSetting />
              </ProtectedRoute>
            }
            {...props}
          />
          <Route
            path={routesConstant.cakeLabels}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <CakeLabels />
              </ProtectedRoute>
            }
            {...props}
          />
          <Route
            path={routesConstant.reports}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Reports />
              </ProtectedRoute>
            }
            {...props}
          />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </>
  );
};

const mapStateToProps = (state) => ({
  isLoggedIn: state.user.isLoggedIn,
});

export default connect(mapStateToProps, null)(RoutesComponent);
