const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
var users = [];
var messages = [];

//RUN EXPRESS SERVER
const app = express();
//RUN SERVER USING HTTP MODULE REQUIRED BY SOCKET.IO
const server = http.createServer(app);
//INIT SOCKET.IO
const io = socketio(server);

//SET STATIC FOLDER
app.use(express.static(path.join(__dirname, "static")));

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('index');
});


//RUN WHEN CLIENT CONNECTS
io.on("connection", (socket) => {
    //message only to me when I connect
    socket.emit("message", "Welcome!");

    socket.emit('chat_history', messages);

    socket.on('new_user', (name) => {
        users[socket.id] = name;
        console.log(users[socket.id]);
        io.emit('user_connected', users[socket.id])
    })

    socket.on('new_message', (message) => {
        messages[users[socket.id]] = message;
        io.emit('broadcast_message', {
            user: users[socket.id],
            message: messages[users[socket.id]],
        })
        messages.push(users[socket.id] + ": " + messages[users[socket.id]]);
    })
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);