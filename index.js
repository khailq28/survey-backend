const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const mongoose = require("mongoose");

const {
    getSurveyByAuthor,
    deleteSurveyById,
    createNewForm,
} = require("./action");

const PORT = process.env.PORT || 5000;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
    console.log("We have a new connection!!!");

    // home page
    socket.on("CLIENT_GET_SURVEY_BY_AUTHOR", (sAuthor) => {
        socket.join(sAuthor);
        socket.room = sAuthor;

        getSurveyByAuthor(sAuthor, socket, io, true);

        socket.on("CLIENT_REMOVE_SURVEY", (sSurveyId) => {
            deleteSurveyById(sSurveyId, sAuthor, socket, io);
        });

        socket.on("CLIENT_CREATE_NEW_FORM", (sFormId) => {
            createNewForm(sFormId, sAuthor, socket, io);
        });
    });

    socket.on("disconnect", () => {
        console.log("User had left!!!");
    });
});

app.use(router);

mongoose
    .connect(
        "mongodb+srv://surveyapp:survey123@cluster0.csh9w.mongodb.net/survey-app-clone?retryWrites=true&w=majority",
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
