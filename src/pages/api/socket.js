// pages/api/socket.js
import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: "*",  // Разрешение на доступ с любых источников (для тестов)
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("Новое соединение");

      socket.on("sendMessage", (message) => {
        io.emit("newMessage", message);  // Эмитируем новое сообщение для всех клиентов
      });

      socket.on("startTyping", (username) => {
        io.emit("typing", `${username} печатает...`);
      });

      socket.on("stopTyping", () => {
        io.emit("typing", "");  // Останавливаем уведомление о печати
      });

      socket.on("disconnect", () => {
        console.log("Пользователь отключился");
      });
    });

    res.socket.server.io = io;  // Привязываем сервер с сокетами к сокет-серверу
  }
  res.end();  // Завершаем обработку запроса
}
