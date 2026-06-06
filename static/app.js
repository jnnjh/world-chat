const socket = io();

let username = localStorage.getItem("chatUsername");

if (!username) {
    username = prompt("Enter your name:");
    while (!username || !username.trim()) {
        username = prompt("Enter your name:");
    }
    localStorage.setItem("chatUsername", username);
}
socket.emit("new_user", username);

document.getElementById("welcome-user").textContent = `👋 Welcome back, ${username}`;

function scrollToBottom() {
    const chats = document.getElementById("chats");
    chats.scrollTop = chats.scrollHeight;
}

function createMessageElement(data) {
    const p = document.createElement("p");
    p.textContent = `[${data.timestamp}] ${data.user}: ${data.message}`;
    if (data.user === username) {
        p.classList.add("my-message");
    }
    return p;
}

socket.on("chat_history", (messages) => {
    const box = document.getElementById("chats");
    messages.forEach((msg) => {
        box.appendChild(createMessageElement(msg));
    });
    scrollToBottom();
});

socket.on("broadcast_message", (data) => {
    document
        .getElementById("chats")
        .appendChild(createMessageElement(data));

    scrollToBottom();
});

socket.on("user_connected", (data) => {
    const p = document.createElement("p");
    p.classList.add("system-message");
    p.textContent = `🟢 ${data.user} joined the chat`;
    document.getElementById("chats").appendChild(p);
    scrollToBottom();
});

socket.on("user_count", (count) => {
    document.getElementById("online-count").textContent = `👥 ${count} online`;
});

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("guess");
    const input = document.getElementById("chat");

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            form.requestSubmit();
        }
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;
        socket.emit("new_message", message);
        form.reset();
    });
});