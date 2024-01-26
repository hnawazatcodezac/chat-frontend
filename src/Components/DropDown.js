import React from "react";

function DropDown(props) {
  const profileClick = () => {
    if (props.setProfileDiv) {
      props.setMessagesUsers(false);
      props.setGetAllUsers(false);
      props.setProfileDiv(true);
    }
    if (props.setDropDown) {
      props.setDropDown(false);
    }
  };

  return (
    <div className="drop-down">
      <div className="name-div">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-person-fill"
          viewBox="0 0 16 16"
        >
          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        </svg>
        <span className="user-name">
          {props.senderName}
          <span className="user-active">
            <span className="online-green-dot">●</span>
            Active
          </span>
        </span>
      </div>
      <div className="personal-div">
        <span className="profile" onClick={profileClick}>
          Profile
        </span>
        <span className="setting">Setting</span>
        <span className="logout-btn" onClick={props.logout}>
          Sign out
        </span>
      </div>
    </div>
  );
}

export default DropDown;
