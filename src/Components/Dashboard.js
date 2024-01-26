import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import UserList from "./UserList";
import { useMediaQuery } from "@mui/material";

function Dashboard() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [threadUsers, setThreadUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUserLogin, setSelectedUserLogin] = useState("");
  const [selectedUserOnline, setSelectedUserOnline] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [socket, setSocket] = useState(null);
  const [senderId, setSenderId] = useState(null);
  const [senderName, setSenderName] = useState(null);
  const [senderLastName, setSenderLastName] = useState(null);
  const [senderEmail, setSenderEmail] = useState(null);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [emojiPicker, setEmojiPicker] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const formatMessageTime = (timestamp) => {
    try {
      const options = {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: "Asia/Karachi",
      };
      const formattedTime = new Intl.DateTimeFormat("en-US", options).format(
        new Date(timestamp)
      );
      return formattedTime;
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "";
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const socket = io(
        "https://effortless-douhua-2c7809.netlify.app/.netlify/functions/api/",
        {
          auth: { token },
          autoConnect: false,
        }
      );

      socket.on("message", (data) => {
        setMessages((prevMessages) => {
          if (Array.isArray(prevMessages)) {
            try {
              const newMessages = [...prevMessages, data];
              return newMessages;
            } catch (error) {
              console.error("Error updating messages:", error);
              return prevMessages;
            }
          } else {
            console.error("prevMessages is not an array:", prevMessages);
            return prevMessages;
          }
        });

        setUnseenMessages((prevUnseenMessages) => {
          const userKey = data.from;
          const unseenCount = prevUnseenMessages[userKey] || 0;
          return { ...prevUnseenMessages, [userKey]: unseenCount + 1 };
        });
      });

      socket.on("userStatusChange", ({ userId, online }) => {
        setOnlineUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, online } : user
          )
        );
        setThreadUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, online } : user
          )
        );
      });

      socket.on("connect", async () => {
        console.log("Socket connected:", socket.connected);
      });

      socket.on("allUsers", (allUsers) => {
        setOnlineUsers(allUsers);
      });

      socket.on("allThreads", (threadUsers) => {
        setThreadUsers(threadUsers);
        console.log("thjreasd", threadUsers);
      });
      socket.on("getId", (getId) => {
        setSenderId(getId._id);
        setSenderName(getId.first_name);
        setSenderLastName(getId.last_name);
        setSenderEmail(getId.email);
      });

      socket.on("allMessages", (messages) => {
        setMessages(messages);
      });

      socket.on("disconnect", async (reason) => {
        console.log("Socket disconnected:", reason);
        if (socket && socket.userId) {
          const userId = JSON.parse(localStorage.getItem("user"))._id;
          socket.emit("userOffline", userId);
        }
      });

      socket.connect();
      setSocket(socket);
      console.log("Socket connected:", socket.connected);
    }
  }, [token]);

  const logout = async () => {
    try {
      const userId = senderId;
      if (socket) {
        socket.disconnect();
        console.log("Socket disconnected");
        socket.emit("userOffline", userId);
      }
      localStorage.clear();
      navigate("/login");
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sendMessage = async () => {
    if (messageInput.trim() !== "" && selectedUser !== "") {
      socket.emit("privateMessage", { to: selectedUser, text: messageInput });
      setMessageInput("");
    } else if (messageInput.trim() === "") {
      return;
    } else if (selectedUser === "") {
      alert("Select a user to send chat");
    }
  };

  const selectChatUser = async (user) => {
    setEmojiPicker(false);
    setSelectedUser(user._id);
    setSelectedChatUser(user.first_name);
    setSelectedUserLogin(user.last_login);
    setSelectedUserOnline(user.online);

    setUnseenMessages((prevUnseenMessages) => {
      const updatedUnseenMessages = { ...prevUnseenMessages };
      delete updatedUnseenMessages[user._id];
      return updatedUnseenMessages;
    });
    socket.emit("selectChatUser", user._id);
  };

  // ==========---------- Emoji Selector ----------==========
  const emojiSelector = () => {
    setEmojiPicker(!emojiPicker);
  };
  const onEmojiClick = (emojiObject) => {
    if (emojiObject && emojiObject.emoji) {
      setMessageInput((prevInput) => prevInput + emojiObject.emoji);
    }
    setEmojiPicker(false);
  };

  // ==========---------- If link send in msgs then it is link ----------==========
  const renderMessageContent = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="link-text"
          >
            {part}
          </a>
        );
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  };

  // ==========---------- Auto Scroll for messages ----------==========
  useEffect(() => {
    const messagesArea = document.querySelector(".chat-messages");
    if (messagesArea) {
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }
  }, [messages]);

  const isScreenSmall = useMediaQuery("(max-width:500px)");
  const chatFalse = () => {
    setSelectedUser(false);
  };

  return (
    <>
      <div className="main-component">
        {isScreenSmall && selectedUser ? null : (
          <div className="user-list-component">
            <UserList
              onlineUsers={onlineUsers}
              threadUsers={threadUsers}
              senderId={senderId}
              senderName={senderName}
              senderLastName={senderLastName}
              senderEmail={senderEmail}
              selectChatUser={selectChatUser}
              selectedUser={selectedUser}
              unseenMessages={unseenMessages}
              socket={socket}
              logout={logout}
            />
          </div>
        )}
        {isScreenSmall && !selectedUser ? null : selectedUser ? (
          <>
            <div className="chat-page">
              <div className="chat-page-header">
                {isScreenSmall && (
                  <button onClick={chatFalse} className="back-btn">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-arrow-left-short"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"
                      />
                    </svg>
                  </button>
                )}
                <div className="receive-user">
                  <span className="circle">
                    {selectedChatUser ? selectedChatUser.slice(0, 1) : null}
                  </span>
                  <div className="list-username">
                    <span className={` name `}>{selectedChatUser} </span>
                    {selectedUserOnline ? (
                      <span className="online green-dot">Online ●</span>
                    ) : (
                      <span className="online">
                        Offline{" "}
                        {selectedUserLogin
                          ? `, last seen ${formatMessageTime(
                              selectedUserLogin
                            )}`
                          : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="chat-page-body">
                <div id="chatPage" className="chat-messages">
                  {Array.isArray(messages) &&
                  messages.length > 0 &&
                  selectedUser ? (
                    messages.map((msg, index) => (
                      <div
                        className="messages"
                        key={index}
                        style={{
                          alignSelf:
                            msg.from === senderId ? "flex-end" : "flex-start",
                          display:
                            msg.from !== senderId && msg.from !== selectedUser
                              ? "none"
                              : "",
                          backgroundColor:
                            msg.from === senderId ? "#007bff" : "#ffffff",
                          color: msg.from === senderId ? "#ffffff" : "#007bff",
                          borderRadius:
                            msg.from === senderId
                              ? "20px 0px 20px 20px"
                              : "0px 20px 20px 20px",
                        }}
                      >
                        <div>{renderMessageContent(msg.text)}</div>
                        <div className="chat-time">{`${formatMessageTime(
                          msg.createdAt
                        )}`}</div>
                      </div>
                    ))
                  ) : (
                    <p></p>
                  )}
                </div>

                <div className="input-div">
                  {emojiPicker && (
                    <span className="emoji">
                      <EmojiPicker
                        Style={{ width: "100%" }}
                        onEmojiClick={onEmojiClick}
                      />
                    </span>
                  )}
                  <button className="emoji-selector" onClick={emojiSelector}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      fill="currentColor"
                      className="bi bi-emoji-smile"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                      <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z" />
                    </svg>
                  </button>
                  <textarea
                    type="text"
                    value={messageInput}
                    className="message-input"
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message"
                  />
                  <button onClick={sendMessage} className="send-btn">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-send-fill"
                      viewBox="0 0 16 16"
                    >
                      <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="chat-page">
            <div
              className="chat-page-header"
              style={{
                fontSize: "26px",
                fontWeight: "700",
                paddingLeft: "2%",
                color: "#007bff",
                letterSpacing: "1px",
              }}
            >
              Select any user to start conversation!
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
