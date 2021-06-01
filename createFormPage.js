const Survey = require("./models/surveyModel");
const { getSurveyByAuthor, formatDate } = require("./homePage");
/*
 * update date
 * @param {string} author
 * @param socket
 * @param io
 * @param {string} sId
 */
const setUpdateDate = async (sId, sAuthor, socket, io) => {
    await Survey.findOneAndUpdate(
        { _id: sId },
        { updateDate: formatDate() },
        { new: true },
    )
        .exec()
        .then(() => {
            getSurveyByAuthor(sAuthor, socket, io, false);
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * find survey by id
 * @param {string} sId
 * @param {string} sAuthor
 * @param socket
 * emit message
 */
const findSurveyById = async (sId, sAuthor, socket, io) => {
    await Survey.findById(sId)
        .exec()
        .then((data) => {
            if (sAuthor === data.author) {
                setUpdateDate(sId, sAuthor, socket, io);
                socket.emit("SERVER_SEND_SURVEY_TO_CREATE_FORM_PAGE", data);
            } else {
                socket.emit("SERVER_SEND_MESSAGE_NO_ACCESS");
            }
        })
        .catch((err) => {
            console.log(err);
            socket.emit("SERVER_SEND_MESSAGE_NO_ACCESS");
        });
};

/*
 * set title
 * @param {string} sId : id form
 * @param {string} sAuthor
 * @param {string} sTitle
 * @param socket
 * @param io
 */

const setTitle = async (sId, sAuthor, sTitle, socket, io) => {
    await Survey.findOneAndUpdate(
        { _id: sId },
        { title: sTitle },
        { new: true },
    )
        .exec()
        .then(() => {
            getSurveyByAuthor(sAuthor, socket, io, false);
            io.sockets.in(sAuthor).emit("SERVER_SEND_NEW_TITLE", sTitle);
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set description
 * @param {string} sId : id form
 * @param {string} sAuthor
 * @param {string} sDescription
 * @param io
 */
const setDescription = async (sId, sAuthor, sDescription, io) => {
    await Survey.findOneAndUpdate(
        { _id: sId },
        { description: sDescription },
        { new: true },
    )
        .exec()
        .then(() => {
            io.sockets
                .in(sAuthor)
                .emit("SERVER_SEND_NEW_DESCRIPTION", sDescription);
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set interface color
 * @param {string} sId : id form
 * @param {string} sAuthor
 * @param {string} sColor
 * @param io
 */
const setInterfaceColor = async (sId, sAuthor, sColor, io) => {
    await Survey.findOneAndUpdate(
        { _id: sId },
        { interfaceColor: sColor },
        { new: true },
    )
        .exec()
        .then(() => {
            io.sockets
                .in(sAuthor)
                .emit("SERVER_SEND_NEW_INTERFACE_COLOR", sColor);
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set background color
 * @param {string} sId : id form
 * @param {string} sAuthor
 * @param {string} sColor
 * @param io
 */
const setBackgroundColor = async (sId, sAuthor, sColor, io) => {
    await Survey.findOneAndUpdate(
        { _id: sId },
        { backgroundColor: sColor },
        { new: true },
    )
        .exec()
        .then(() => {
            io.sockets
                .in(sAuthor)
                .emit("SERVER_SEND_NEW_BACKGROUND_COLOR", sColor);
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set questions
 * @param {string} sId : id form
 * @param {string} sAuthor
 * @param {array} aQuestions
 * @param io
 */
const setQuestions = async (sId, sAuthor, aQuestions, io) => {
    await Survey.findOneAndUpdate(
        { _id: sId },
        { questions: aQuestions },
        { new: true },
    )
        .exec()
        .then(() => {
            io.sockets
                .in(sAuthor)
                .emit("SERVER_SEND_NEW_QUESTIONS", aQuestions);
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set open question
 * @param {string} sId
 * @param {string} sAuthor
 * @param {string} sIdQues
 * @param io
 */
const setOpenQuestion = async (sId, sAuthor, sIdQues, io) => {
    await Survey.findOneAndUpdate(
        { _id: sId, "questions.open": true },
        { $set: { "questions.$.open": false } },
    )
        .exec()
        .then(() => {
            Survey.findOneAndUpdate(
                { _id: sId, "questions._id": sIdQues },
                { $set: { "questions.$.open": true } },
            )
                .exec()
                .then(() => {
                    Survey.findById(sId)
                        .exec()
                        .then((data) => {
                            io.in(sAuthor).emit(
                                "SERVER_CHANGED_STATUS_OPEN_QUESTION",
                                data,
                            );
                        })
                        .catch();
                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set title question
 * @param {string} sId
 * @param {string} sAuthor
 * @param {string} sIdQues
 * @param {string} sTitle
 * @param {int} iIndex
 * @param io
 */
const setTitleQuestion = async (sId, sAuthor, sIdQues, sTitle, iIndex, io) => {
    await Survey.findOneAndUpdate(
        { _id: sId, "questions._id": sIdQues },
        { $set: { "questions.$.questionText": sTitle } },
    )
        .exec()
        .then(() => {
            io.sockets.in(sAuthor).emit("SERVER_SEND_NEW_TITLE_QUESTION", {
                title: sTitle,
                index: iIndex,
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set question type
 * @param {string} sId
 * @param {string} sAuthor
 * @param {string} sIdQues
 * @param {string} sType
 * @param {int} iIndex
 * @param io
 */
const setQuestionType = async (sId, sAuthor, sIdQues, sType, iIndex, io) => {
    await Survey.findOneAndUpdate(
        { _id: sId, "questions._id": sIdQues },
        {
            $set: {
                "questions.$.questionType": sType,
                "questions.$.options": [{ optionText: "", other: false }],
            },
        },
    )
        .exec()
        .then(() => {
            io.sockets.in(sAuthor).emit("SERVER_SEND_NEW_TYPE_QUESTION", {
                type: sType,
                index: iIndex,
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set question type
 * @param {string} sId
 * @param {string} sAuthor
 * @param {string} sIdQues
 * @param {array} aOptions
 * @param {int} index       vi tri cua option duoc them trong mang
 * @param socket
 */
const setOptions = async (sId, sAuthor, sIdQues, aOptions, iIndex, socket) => {
    await Survey.findOneAndUpdate(
        { _id: sId, "questions._id": sIdQues },
        { $set: { "questions.$.options": aOptions } },
    )
        .exec()
        .then(() => {
            socket.broadcast.to(sAuthor).emit("SERVER_SEND_NEW_OPTIONS", {
                options: aOptions,
                id: sIdQues,
                index: iIndex,
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * change Require question
 * @param {string} sId
 * @param {string} sAuthor
 * @param {string} sIdQues
 * @param {bool} bRequire
 * @param {int} iIndex
 * @param socket
 */
const changeRequire = async (
    sId,
    sAuthor,
    sIdQues,
    bRequire,
    iIndex,
    socket,
) => {
    await Survey.findOneAndUpdate(
        { _id: sId, "questions._id": sIdQues },
        { $set: { "questions.$.required": bRequire } },
    )
        .exec()
        .then(() => {
            socket.broadcast.to(sAuthor).emit("SERVER_SEND_NEW_REQUIRED", {
                bRequire,
                index: iIndex,
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

module.exports = {
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
};
