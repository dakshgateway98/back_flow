import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import RoutesComponent from "./routes/RoutesComponent";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import configureStore from "./redux/store/configureStore";
import { SocketContext, socket } from "./context/socket";
function App() {
  const { store, persistor } = configureStore();
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <SocketContext.Provider value={socket}>
          <ToastContainer />
          <RoutesComponent />
        </SocketContext.Provider>
      </PersistGate>
    </Provider>
  );
}

export default App;
