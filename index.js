const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const Survey = require("./models/surveyModel");

const {
    getSurveyByAuthor,
    deleteSurveyById,
    createNewForm,
} = require("./homePage");

const {
    findSurveyById,
    setTitle,
    setDescription,
    setInterfaceColor,
    setBackgroundColor,
    setQuestions,
    setOpenQuestion,
    setTitleQuestion,
    setQuestionType,
    setOptions,
    changeRequire,
    deleteQuesImg,
    deleteOptionImg,
    changeStatusForm,
} = require("./createFormPage");

const { findSurveySubmit, submitForm } = require("./submitPage");

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
    });

    socket.on("CLIENT_CREATE_NEW_FORM", (user) => {
        createNewForm(user, socket, io);
    });

    // create survey
    socket.on("CLIENT_GET_DATA_SURVEY", (oData) => {
        socket.join(oData.author);
        socket.room = oData.author;
        findSurveyById(oData.id, oData.author, socket, io);

        socket.on("CLIENT_CHANGE_TITLE_FORM", (oTitle) => {
            setTitle(oData.id, oData.author, oTitle, socket, io);
        });

        socket.on("CLIENT_CHANGE_DESCRIPTION_FORM", (oDescription) => {
            setDescription(oData.id, oData.author, oDescription, socket);
        });

        socket.on("CLIENT_CHANGE_INTERFACE_COLOR", (oColor) => {
            setInterfaceColor(oData.id, oData.author, oColor, socket);
        });

        socket.on("CLIENT_CHANGE_BACKGROUND_COLOR", (oColor) => {
            setBackgroundColor(oData.id, oData.author, oColor, socket);
        });

        socket.on("CLIENT_SET_QUESTIONS", (oQuestions) => {
            setQuestions(oData.id, oData.author, oQuestions, socket);
        });

        socket.on("CLIENT_CHANGE_OPEN_QUESTION", (oIdQues) => {
            setOpenQuestion(oData.id, oData.author, oIdQues, socket);
        });

        socket.on("CLIENT_CHANGE_TITLE_QUESTION", (oDataSetTitleQues) => {
            setTitleQuestion(
                oData.id,
                oData.author,
                oDataSetTitleQues.id,
                oDataSetTitleQues.value,
                oDataSetTitleQues.index,
                oDataSetTitleQues.idForm,
                socket,
            );
        });

        socket.on("CLIENT_CHANGE_QUESTION_TYPE", (oDataSetTitleQues) => {
            setQuestionType(
                oData.id,
                oData.author,
                oDataSetTitleQues.id,
                oDataSetTitleQues.value,
                oDataSetTitleQues.index,
                oDataSetTitleQues.idForm,
                socket,
            );
        });

        socket.on("CLIENT_SET_OPTIONS", (aOptions) => {
            setOptions(
                oData.id,
                oData.author,
                aOptions.id,
                aOptions.options,
                aOptions.index,
                aOptions.idForm,
                socket,
            );
        });

        socket.on("CLIENT_CHANGE_REQUIRE", (oQues) => {
            changeRequire(
                oData.id,
                oData.author,
                oQues.id,
                oQues.value,
                oQues.index, //to send client
                oQues.idForm,
                socket,
            );
        });

        socket.on("CLIENT_SET_QUESTION_IMAGE", (oImage) => {
            io.sockets
                .in(oData.author)
                .emit("SERVER_SEND_MSG_QUESTION_IMAGE", oImage);
        });

        socket.on("CLIENT_DELETE_QUESTION_IMAGE", (oImage) => {
            deleteQuesImg(oImage, oData.author, io);
        });

        socket.on("CLIENT_SET_OPTION_IMAGE", (oImage) => {
            Survey.findById(oImage.idForm)
                .exec()
                .then((data) => {
                    var aOptions = data.questions[oImage.index].options;
                    aOptions[oImage.indexOption].image = oImage.image;
                    io.sockets
                        .in(oData.author)
                        .emit("SERVER_SEND_NEW_OPTIONS", {
                            id: oImage.id,
                            index: oImage.index,
                            idForm: oImage.idForm,
                            options: aOptions,
                        });
                })
                .catch((err) => {
                    console.log(err);
                });
        });

        socket.on("CLIENT_DELETE_OPTION_IMAGE", (oImage) => {
            deleteOptionImg(oImage, oData.author, io);
        });
    });

    // submit page
    socket.on("CLIENT_GET_DATA_SURVEY_SUBMIT", (oData) => {
        socket.join(oData.author);
        socket.room = oData.author;
        findSurveySubmit(oData.id, oData.author, socket);
    });

    socket.on("CLIENT_SUBMIT_FORM", (oSubmit) => {
        submitForm(oSubmit, socket);
    });

    // result page
    socket.on("CLIENT_CHANGE_STATUS", (oData) => {
        changeStatusForm(oData.idForm, oData.value, socket);
    });

    socket.on("disconnect", () => {
        console.log("User had left!!!");
    });
});

app.use(express.static("public"));
app.use(cors());
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
