import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import ToastContainer from "./components/feedback/ToastContainer";

function App() {
  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
}

export default App;