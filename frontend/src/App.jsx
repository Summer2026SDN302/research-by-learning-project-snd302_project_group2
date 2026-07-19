import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import ToastContainer from "./components/feedback/ToastContainer";
import AppErrorBoundary from "./components/feedback/AppErrorBoundary";

function App() {
  return (
    <AppErrorBoundary>
      <AppRoutes />
      <ToastContainer />
    </AppErrorBoundary>
  );
}

export default App;
