import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignupForm() {
  const [username, setUsername] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertData, setAlertData] = useState(false);
  const navigate = useNavigate();

  const signup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://merry-monstera-6e2723.netlify.app/.netlify/functions/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: username,
            last_name: lastName,
            email,
            password,
          }),
        }
      );
      if (response.status === 200) {
        const responseData = await response.json();
        const user = responseData.data.newUser;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", responseData.data.token);
        navigate("/dashboard");
      }
      if (response.status === 401) {
        setAlertData("User already exist");
        setTimeout(() => setAlertData(false), 3000);
        return;
      } else if (response.status === 400) {
        const errorResponse = await response.json();
        setAlertData(errorResponse.message);
        setTimeout(() => setAlertData(false), 3000);
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <>
      <div className="signup-component">
        <div className="signup-form">
          <h1>Signup</h1>
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="First Name"
            />
          </div>
          <div>
            <input
              className="input"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
            />
          </div>
          <div>
            <input
              className="input"
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

          <button onClick={signup} className="login-btn">
            Register
          </button>
          <p className="account-para">
            alread have account?{" "}
            <Link to="/login" className="navigate-btn">
              Login
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

export default SignupForm;
