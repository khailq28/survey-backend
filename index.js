const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
    console.log("We have a new connection!!!");

    socket.on("join", (data) => {
        console.log(data);
    });
});

app.use(router);

mongoose
    .connect(
        "mongodb+srv://surveyapp:survey123@cluster0.csh9w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    )
    .then(() =>
        server.listen(PORT, () =>
            console.log(`Server has started on port ${PORT}`),
        ),
    )
    .catch((error) => console.log(error.message));

// server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
