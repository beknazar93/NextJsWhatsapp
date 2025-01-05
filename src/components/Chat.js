import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";

let socket;

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [confirmedUsername, setConfirmedUsername] = useState(false); // Новое состояние
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket = io({
      path: "/api/socket",
    });

    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("typing", (users) => {
      setTypingUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { username: confirmedUsername, text: message });
      setMessage("");
      socket.emit("stopTyping", confirmedUsername);
    }
  };

  const handleTyping = () => {
    if (message.trim()) {
      socket.emit("startTyping", confirmedUsername);
    } else {
      socket.emit("stopTyping", confirmedUsername);
    }
  };

  const handleConfirmUsername = () => {
    if (username.trim()) {
      setConfirmedUsername(username);
    }
  };
  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "80vh" }}>
      {!confirmedUsername && (
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Введите ваше имя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: "5px", width: "80%", marginRight: "10px" }}
          />
          <button
            onClick={handleConfirmUsername}
            style={{ padding: "5px 10px" }}
          >
            Подтвердить
          </button>
        </div>
      )}
      {confirmedUsername && (
        <>
          <div
            style={{
              flex: 1,
              overflow: "auto",
              border: "1px solid black",
              padding: "10px",
            }}
          >
            {messages.map((message, index) => (
              <div key={index}>
                <strong>{message.username}</strong>: {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div
            style={{
              height: "30px",
              fontStyle: "italic",
              margin: "5px 0",
            }}
          >
            {typingUsers.length > 0 &&
              `${typingUsers.join(", ")} ${
                typingUsers.length > 1 ? "печатают" : "печатает"
              }...`}
          </div>

          <div
            style={{
              display: "flex",
              padding: "10px",
              borderTop: "1px solid black",
            }}
          >
            <button style={{marginRight:'10px', padding:'5px 10px'}}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            >😊</button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyUp={handleTyping}
              placeholder="Введите ваше сообщение"
              style={{
                flex: 1,
                marginRight: "10px",
                padding: "5px",
              }}
            />
            
            <button
              style={{ padding: "10px 20px" }}
              onClick={handleSendMessage}
            >
              Отправить
            </button>

          </div>
          {showEmojiPicker && (
          <div style={{marginTop:'10px'}}>
            <EmojiPicker
              onEmojiClick={onEmojiClick}
            />

          </div>
          )}
        </>
      )}
    </div>
  );
}
