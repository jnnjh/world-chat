const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

var users = {};
const lastSeen = {};
var messages = [];

//SET STATIC FOLDER
app.use(express.static(path.join(__dirname, "static")));
app.set('view engine', 'ejs');
app.get('/', function(req, res) {
    res.render('index');
});


io.on("connection", (socket) => {
    socket.emit("chat_history", messages);

    socket.on("new_user", (name) => {
        const now = Date.now();

        const shouldAnnounce =
            !lastSeen[name] ||
            now - lastSeen[name] > 10 * 60 * 1000; // 10 minutes so 

        users[socket.id] = name;

        if (shouldAnnounce) {
            io.emit("user_connected", {
            user: name,
            timestamp: new Date().toLocaleString(),
            });
        }
        lastSeen[name] = now;
        io.emit("user_count", Object.keys(users).length);
    });

    socket.on("new_message", (message) => {
        if (!message.trim()) return;
        const chatMessage = {
        user: users[socket.id],
        message,
        timestamp: new Date().toLocaleString(),
        };
        messages.push(chatMessage);
        io.emit("broadcast_message", chatMessage);
    });

    socket.on("disconnect", () => {
        const username = users[socket.id];
        delete users[socket.id];
        if (username) {
            lastSeen[username] = Date.now();
        }
        io.emit("user_count", Object.keys(users).length);
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});