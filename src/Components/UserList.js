import React, { useEffect, useRef, useState } from "react";
import DropDown from "./DropDown";

function UserList({
  onlineUsers,
  threadUsers,
  senderId,
  selectChatUser,
  selectedUser,
  unseenMessages,
  senderName,
  senderLastName,
  socket,
  senderEmail,
  logout,
}) {
  const [getAllUsers, setGetAllUsers] = useState(false);
  const [messagesUsers, setMessagesUsers] = useState(true);
  const [displayProfile, setDisplayProfile] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [profileName, setProfileName] = useState(senderName);
  const [errorName, setErrorName] = useState(false);
  const [errorLastName, setErrorLastName] = useState(false);
  const [profileLastName, setProfileLastName] = useState(senderLastName);
  const [profileNameInput, setProfileNameInput] = useState(false);
  const [profileLastNameInput, setProfileLastNameInput] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword3, setShowPassword3] = useState(false);
  const [passwordInput, setPasswordInput] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorAlert, setErrorAlert] = useState("");
  const [successAlert, setSuccessAlert] = useState("");
  const dropDownRef = useRef(null);

  useEffect(() => {
    setProfileName(senderName);
    setProfileLastName(senderLastName);
  }, [senderName, senderLastName]);

  const formatLastLogin = (lastLogin) => {
    const now = new Date();
    const lastLoginDate = new Date(lastLogin);
    const timeDifference = now - lastLoginDate;
    const minutesAgo = Math.floor(timeDifference / (1000 * 60));
    const hoursAgo = Math.floor(timeDifference / (1000 * 60 * 60));
    const daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    if (minutesAgo < 60) {
      return `${minutesAgo} ${minutesAgo === 1 ? "minute" : "minutes"} ago`;
    } else if (hoursAgo < 24) {
      return `${hoursAgo} ${hoursAgo === 1 ? "hour" : "hours"} ago`;
    } else {
      return `${daysAgo} ${daysAgo === 1 ? "day" : "days"} ago`;
    }
  };

  const allUsersBtn = () => {
    setGetAllUsers(true);
    setMessagesUsers(false);
    setDisplayProfile(false);
  };

  const threadUsersBtn = () => {
    setGetAllUsers(false);
    setMessagesUsers(true);
    setDisplayProfile(true);
  };

  const compareLastLogin = (a, b) => {
    if (a.online && !b.online) return -1;
    if (!a.online && b.online) return 1;
    if (a.last_login && b.last_login) {
      return new Date(b.last_login) - new Date(a.last_login);
    }
    return 0;
  };

  const getDropDown = () => {
    setDropDown(true);
  };

  const handleClickOutside = (event) => {
    if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
      setDropDown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const nameEdit = () => {
    if (profileName.trim().length < 5) {
      setErrorName(true);
      return;
    } else {
      setProfileNameInput((prevInput) => !prevInput);
      socket.emit("updateName", { senderId, profileName });
    }
  };

  const lastNameEdit = () => {
    if (profileLastName.trim().length < 5) {
      setErrorLastName(true);
      return;
    } else {
      setProfileLastNameInput((prevInput) => !prevInput);
      socket.emit("updateLastName", { senderId, profileLastName });
    }
  };

  const handleNameChange = (event) => {
    setProfileName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setProfileLastName(event.target.value);
  };

  const showPasswordBtn1 = () => {
    setShowPassword1(!showPassword1);
  };
  const showPasswordBtn2 = () => {
    setShowPassword2(!showPassword2);
  };
  const showPasswordBtn3 = () => {
    setShowPassword3(!showPassword3);
  };

  useEffect(() => {
    if (
      oldPassword.trim().length > 7 &&
      newPassword.trim().length > 7 &&
      confirmPassword.trim().length > 7
    ) {
      setPasswordInput(true);
    } else {
      setPasswordInput(false);
    }
  }, [oldPassword, newPassword, confirmPassword]);

  const savePassword = async (e) => {
    if (newPassword !== confirmPassword) {
      setErrorAlert("passwords are not matched");
      setTimeout(() => {
        setErrorAlert("");
      }, 3000);
      return;
    }
    e.preventDefault();
    console.log("senderId", senderId);
    try {
      const response = await fetch(
        "https://effortless-douhua-2c7809.netlify.app/.netlify/functions/api/updatePassword",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId,
            oldPassword,
            newPassword,
          }),
        }
      );
      if (response.status === 200) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSuccessAlert("Password updated successfully!");
        setTimeout(() => {
          setSuccessAlert("");
        }, 3000);
        return;
      } else if (response.status === 400) {
        const errorResponse = await response.json();
        setErrorAlert(errorResponse.message);
        setTimeout(() => {
          setErrorAlert("");
        }, 3000);
      } else if (response.status === 401) {
        setErrorAlert("Old password is incorect");
        setTimeout(() => {
          setErrorAlert("");
        }, 3000);
      } else if (response.status === 404) {
        setErrorAlert("User not found");
        setTimeout(() => {
          setErrorAlert("");
        }, 3000);
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <>
      {dropDown && (
        <div ref={dropDownRef}>
          <DropDown
            senderName={senderName}
            logout={logout}
            setDropDown={setDropDown}
            setGetAllUsers={setGetAllUsers}
            setMessagesUsers={setMessagesUsers}
            setProfileDiv={setDisplayProfile}
          />
        </div>
      )}
      <div className="user-list-header">
        <div className="buttons">
          <div className="allUsersBtn">
            <button onClick={allUsersBtn} className="custom-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-people-fill"
                viewBox="0 0 16 16"
              >
                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
              </svg>
            </button>
          </div>
          <div className="allUsersBtn">
            <button onClick={threadUsersBtn}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-threads"
                viewBox="0 0 16 16"
              >
                <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948.591.621.928 1.509 1.005 2.644.328.138.63.299.905.484 1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.217 6.217 0 0 0-1.528-.161Z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="login-user">
          <span className="circle" onClick={getDropDown}>
            {senderName ? senderName.slice(0, 1) : null}
          </span>
        </div>
      </div>
      <div className="user-list">
        {messagesUsers && (
          <>
            <div className="all-users-header">
              <h2>Chats</h2>
              <img
                width="32"
                height="32"
                src="https://img.icons8.com/wired/64/007bff/connection-status-on.png"
                alt="connection-status-on"
              />
            </div>
            <div className="search-bar">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-search"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
              <input type="text" placeholder="search" />
            </div>
            <p className="divider"></p>
            <div className="thread-users">
              <ul>
                {threadUsers ? (
                  threadUsers
                    .filter((user) => user._id !== senderId)
                    .sort(compareLastLogin)
                    .map((threadUsers) => (
                      <li
                        key={threadUsers._id}
                        onClick={() => selectChatUser(threadUsers)}
                      >
                        <div className="circle-div">
                          <span className="circle-span">
                            <span
                              className={` circle ${
                                threadUsers.online ? "circle-online" : ""
                              }`}
                            >
                              {threadUsers.first_name
                                ? threadUsers.first_name.slice(0, 1)
                                : null}
                            </span>
                          </span>
                          {threadUsers.online === true && (
                            <span className="user-name-dot"></span>
                          )}
                        </div>
                        <div className="list-username">
                          <span
                            className={` name ${
                              threadUsers.online ? "green-dot" : ""
                            }`}
                          >
                            {threadUsers.first_name}{" "}
                          </span>
                          {threadUsers.online ? (
                            <span className="online green-dot">Online</span>
                          ) : (
                            <span className="online">Offline</span>
                          )}
                          <span className="last-msg"></span>
                        </div>
                        <div className="last-login-component">
                          <span
                            className={`last-login ${
                              threadUsers.online === true
                                ? "hidden-component"
                                : ""
                            }`}
                          >
                            {threadUsers.last_login !== null
                              ? formatLastLogin(threadUsers.last_login)
                              : "0 hours ago"}
                          </span>
                          {selectedUser !== threadUsers._id &&
                            unseenMessages[threadUsers._id] > 0 && (
                              <span className="notification-badge">
                                {unseenMessages[threadUsers._id]}
                              </span>
                            )}
                        </div>
                      </li>
                    ))
                ) : (
                  <p>No users</p>
                )}
              </ul>
            </div>
          </>
        )}
        {getAllUsers && (
          <>
            <div className="all-users-header">
              <h2>Users</h2>
              <img
                width="32"
                height="32"
                src="https://img.icons8.com/wired/64/007bff/connection-status-on.png"
                alt="connection-status-on"
              />
            </div>
            <div className="search-bar">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-search"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
              <input type="text" placeholder="search" />
            </div>
            <p className="divider"></p>
            <div className="all-users">
              <ul>
                {onlineUsers ? (
                  onlineUsers
                    .filter((user) => user._id !== senderId)
                    .sort(compareLastLogin)
                    .map((onlineUsers) => (
                      <li
                        key={onlineUsers._id}
                        onClick={() => selectChatUser(onlineUsers)}
                      >
                        <div className="circle-div">
                          <span className="circle-span">
                            <span
                              className={` circle ${
                                onlineUsers.online ? "circle-online" : ""
                              }`}
                            >
                              {onlineUsers.first_name
                                ? onlineUsers.first_name.slice(0, 1)
                                : null}
                            </span>
                          </span>
                          {onlineUsers.online === true && (
                            <span className="user-name-dot"></span>
                          )}
                        </div>
                        <div className="list-username">
                          <span
                            className={` name ${
                              onlineUsers.online ? "green-dot" : ""
                            }`}
                          >
                            {onlineUsers.first_name}{" "}
                          </span>
                          {onlineUsers.online ? (
                            <span className="online green-dot">Online </span>
                          ) : (
                            <span className="online">Offline</span>
                          )}
                        </div>
                        <div className="last-login-component">
                          <span
                            className={`last-login ${
                              onlineUsers.online === true
                                ? "hidden-component"
                                : ""
                            }`}
                          >
                            {onlineUsers.last_login !== null
                              ? formatLastLogin(onlineUsers.last_login)
                              : "0 hours ago"}
                          </span>
                          {selectedUser !== onlineUsers._id &&
                            unseenMessages[onlineUsers._id] > 0 && (
                              <span className="notification-badge">
                                {unseenMessages[onlineUsers._id]}
                              </span>
                            )}
                        </div>
                      </li>
                    ))
                ) : (
                  <p className="no-user">No users</p>
                )}
              </ul>
            </div>
          </>
        )}
        {displayProfile && (
          <div className={`profile-div ${displayProfile ? "active" : ""}`}>
            <div className="all-users-header">
              <h2>Profile</h2>
            </div>
            <div className="profile-body">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="106"
                height="106"
                fill="currentColor"
                className="bi bi-person-circle"
                viewBox="0 0 16 16"
              >
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                <path
                  fillRule="evenodd"
                  d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
                />
              </svg>
            </div>
            <div className="profile-name">
              <p>First Name</p>
              <div className="profile-form">
                <input
                  type="text"
                  value={profileName}
                  onChange={handleNameChange}
                  className={`${profileNameInput && "input-active"}`}
                />
                <button onClick={nameEdit}>
                  {profileNameInput ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      fill="#00db00"
                      className={`bi bi-check-circle-fill ${
                        errorName ? "disable-input" : ""
                      }`}
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-pencil-fill"
                      viewBox="0 0 16 16"
                    >
                      <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="profile-name">
              <p>Last Name</p>
              <div className="profile-form">
                <input
                  type="text"
                  value={profileLastName}
                  onChange={handleLastNameChange}
                  className={`${profileLastNameInput && "input-active"}`}
                />
                <button onClick={lastNameEdit}>
                  {profileLastNameInput ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      fill="#00db00"
                      className={`bi bi-check-circle-fill ${
                        errorLastName ? "disable-input" : ""
                      }`}
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-pencil-fill"
                      viewBox="0 0 16 16"
                    >
                      <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="profile-name">
              <p>Email</p>
              <div className="profile-form">
                <input disabled type="text" value={senderEmail} />
              </div>
            </div>
            <div className="profile-name">
              <p>Old Password</p>
              <div className="profile-form">
                <input
                  className="password-input"
                  type={showPassword1 ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <button onClick={showPasswordBtn1}>
                  {showPassword1 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-eye"
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-eye-slash"
                      viewBox="0 0 16 16"
                    >
                      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
                      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
                      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="profile-name">
              <p>New Password</p>
              <div className="profile-form">
                <input
                  className="password-input"
                  type={showPassword2 ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button onClick={showPasswordBtn2}>
                  {showPassword2 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-eye"
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-eye-slash"
                      viewBox="0 0 16 16"
                    >
                      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
                      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
                      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="profile-name">
              <p>Confirm Password</p>
              <div className="profile-form">
                <input
                  className="password-input"
                  type={showPassword3 ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button onClick={showPasswordBtn3}>
                  {showPassword3 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-eye"
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-eye-slash"
                      viewBox="0 0 16 16"
                    >
                      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
                      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
                      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
                    </svg>
                  )}
                </button>
                <button
                  className={`${
                    passwordInput === false
                      ? "disable-password-input"
                      : "enable-password-input"
                  }`}
                  onClick={savePassword}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    fill="#00db00"
                    className="bi bi-check-circle-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                  </svg>
                </button>
              </div>
            </div>
            <p
              className={`${
                errorAlert === "" ? "disable-paragraph" : "error-paragraph"
              }`}
            >
              {errorAlert}
            </p>
            <p
              className={`${
                successAlert === "" ? "disable-paragraph" : "success-paragraph"
              }`}
            >
              {successAlert}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default UserList;
