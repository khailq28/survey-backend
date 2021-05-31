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
    setInterfaceColor,
    setBackgroundColor,
    setQuestions,
    setOpenQuestion,
    setTitleQuestion,
    setQuestionType,
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

        socket.on("CLIENT_CREATE_NEW_FORM", () => {
            createNewForm(sAuthor, socket, io);
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

        socket.on("CLIENT_CHANGE_INTERFACE_COLOR", (sColor) => {
            setInterfaceColor(oData.id, sColor);
        });

        socket.on("CLIENT_CHANGE_BACKGROUND_COLOR", (sColor) => {
            setBackgroundColor(oData.id, sColor);
        });

        socket.on("CLIENT_SET_QUESTIONS", (aQuestions) => {
            setQuestions(oData.id, aQuestions);
        });

        socket.on("CLIENT_CHANGE_OPEN_QUESTION", (sIdQues) => {
            setOpenQuestion(oData.id, sIdQues);
        });

        socket.on("CLIENT_CHANGE_TITLE_QUESTION", (oDataSetTitleQues) => {
            setTitleQuestion(
                oData.id,
                oDataSetTitleQues.id,
                oDataSetTitleQues.value,
            );
        });

        socket.on("CLIENT_CHANGE_QUESTION_TYPE", (oDataSetTitleQues) => {
            setQuestionType(
                oData.id,
                oDataSetTitleQues.id,
                oDataSetTitleQues.value,
            );
        });
    });

    socket.on("disconnect", () => {
        console.log("User had left!!!");
    });
});

// const Survey = require("./models/surveyModel");
// var a = `questions.${2}.open`;
// Survey.findOneAndUpdate(
//     {
//         id: "00ef6ae-73e1-682e-ab7-f11e1ae8713",
//     },
//     { "questions.2.open": true },
//     // { "questions[0].open": 1 },
//     // { $set: { "questions.$.open": false } },
//     // // { id: sId },
//     // { $set: { "questions.$.questionText": "s" } },
// )
//     .exec()
//     .then((data) => {
//         console.log(data);
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
