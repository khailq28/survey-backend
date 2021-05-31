const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const mongoose = require("mongoose");

const {
    getSurveyByAuthor,
    deleteSurveyById,
    createNewForm,
    findSurveyById,
    setTitle,
    setDescription,
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

    // create survey
    socket.on("CLIENT_GET_DATA_SURVEY", (oData) => {
        findSurveyById(oData.id, oData.author, socket, io);

        socket.on("CLIENT_CHANGE_TITLE_FORM", (sTitle) => {
            setTitle(oData.id, oData.author, sTitle, socket, io);
        });

        socket.on("CLIENT_CHANGE_DESCRIPTION_FORM", (sDescription) => {
            setDescription(oData.id, sDescription);
        });
    });

    socket.on("disconnect", () => {
        console.log("User had left!!!");
    });
});

// const Survey = require("./models/surveyModel");
// Survey.findOneAndUpdate(
//     { id: "00ef6ae-73e1-682e-ab7-f11e1ae8713" },
//     { title: "hello" },
// )
//     .exec()
//     .then(() => {
//         console.log("xong");
//     })
//     .catch((err) => {
//         console.log(err);
//     });

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
