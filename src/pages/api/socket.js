import { Server } from "socket.io";

const usersTyping = new Set();

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Получение нового сообщения
      socket.on("sendMessage", (message) => {
        io.emit("newMessage", message);
      });

      // Обработка печати
      socket.on("startTyping", (username) => {
        usersTyping.add(username);
        io.emit("typing", Array.from(usersTyping));
      });

      socket.on("stopTyping", (username) => {
        usersTyping.delete(username);
        io.emit("typing", Array.from(usersTyping));
      });

      // Обработка отключения пользователя
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        // Удаляем пользователя из typing при отключении
        io.emit("typing", Array.from(usersTyping));
      });
    });

    console.log("Socket.IO server initialized");
  }
  res.end();
}
