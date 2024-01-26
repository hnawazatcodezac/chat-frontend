import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginForm from "./Components/LoginForm";
import SignupForm from "./Components/SignupForm";
import Dashboard from "./Components/Dashboard";
import PrivateComponent from "./Components/PrivateComponent";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<PrivateComponent />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<SignupForm />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
