// const io = require("socket.io-client");
var socket = io.connect('http://127.0.0.1:5000/feeds');



socket.on("connect", () => {
    console.log(socket.id);
});

socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
        socket.connect();
    }
});

socket.on("connect_error", () => {
    setTimeout(() => {
        socket.connect();
    }, 1000);
});



socket.on('message', function(msg) {
    // $("#messages").append('<li>' + msg + socket.id + '</li>');
    console.log('Received message', msg);
});

function clickMessage() {
    console.log("click")
    socket.send(document.getElementById('myMessage').value);
}

function displayDate() {
    console.log(Date())
}