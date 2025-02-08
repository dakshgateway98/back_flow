import UserReducer from "./userReducer";
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import pageReducer from "./pageReducer";
import templateReducer from "./templateReducer";
import subPageConfigReducer from "./subPageConfigReducer";
import orderReducer from "./orderReducer";
import multiplierReducer from "./multiplierReducer";
import phaseReducer from "./phaseReducer";
import settingsReducer from "./settingsReducer";
import calcSettingsReducer from "./calcSettingsReducer";
import bakerCalcSelectionReducer from "./bakerCalcSelectionReducer";
import UserlevelsReducer from "./userlevelsReducer";
import venueConfigReducer from "./venueConfigReducer";

const persistConfig = {
  key: "patty-cakes",
  storage: storage,
  whitelist: ["user"],
};

const rootReducer = combineReducers({
  user: UserReducer,
  pages: pageReducer,
  templates: templateReducer,
  orders: orderReducer,
  subPageConfig: subPageConfigReducer,
  multiplier: multiplierReducer,
  phases: phaseReducer,
  settings: settingsReducer,
  calcSettings: calcSettingsReducer,
  bakerCalcSelection: bakerCalcSelectionReducer,
  userlevels: UserlevelsReducer,
  venueConfig: venueConfigReducer,
});

export default persistReducer(persistConfig, rootReducer);
