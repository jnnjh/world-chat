
const socket = io();

var name = prompt("Enter your name:");

socket.emit('new_user', name);

socket.on('user_connected', (data) => {
    console.log('user connected: ' + data);
})

socket.on('chat_history', (messages) => {
    for(var i = 0; i < messages.length; i++){
        const p = document.createElement("p");
        const box = document.getElementById('chats')
        p.innerHTML = messages[i];
        box.appendChild(p);
    }
})

socket.on('broadcast_message', (data) => {
    console.log(data);
    const p = document.createElement("p");
    const box = document.getElementById('chats')
    
    p.innerHTML = data.user + ':     ' + data.message;
    p.style.fontSize = 16 + "px";
    box.appendChild(p);
})

document.addEventListener("DOMContentLoaded", function (event) {
    console.log("DOM fully loaded and parsed");

    const chatbox = document.getElementById('guess');

    chatbox.addEventListener('submit', (e) => {
        e.preventDefault()

        const message = document.getElementById('chat').value

        socket.emit('new_message', message);
        chatbox.reset();
    })
});
