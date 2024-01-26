import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertData, setAlertData] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    try {
      const response = await fetch(
        "https://merry-monstera-6e2723.netlify.app/.netlify/functions/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );
      if (response.status === 200) {
        const responseData = await response.json();
        const user = responseData.data.user;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", responseData.data.token);
        navigate("/dashboard");
      }
      if (response.status === 404) {
        setAlertData("invalid user or password");
        setTimeout(() => setAlertData(false), 3000);
        return;
      }
      if (response.status === 401) {
        setAlertData("invalid user or password");
        setTimeout(() => setAlertData(false), 3000);
        return;
      }
      if (response.status === 500) {
        setAlertData("invalid credentials");
        setTimeout(() => setAlertData(false), 3000);
        return;
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <>
      <div className="signup-component">
        <div className="signup-form">
          <h1>Login</h1>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
          <div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>

          <button onClick={login} className="login-btn">
            Login
          </button>
          <p className="account-para">
            Don't have account?{" "}
            <Link to="/" className="navigate-btn">
              Signup today
            </Link>{" "}
          </p>
        </div>
      </div>
      <div className={`alert ${alertData === false ? "hidden-alert" : ""}`}>
        {alertData}
      </div>
    </>
  );
}

export default LoginForm;
