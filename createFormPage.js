const Survey = require("./models/surveyModel");
const { getSurveyByAuthor, formatDate } = require("./homePage");

// xoa file
const fs = require("fs");
const { promisify } = require("util");

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
 * @param {object} oTitle
 * @param socket
 * @param io
 */

const setTitle = async (sId, sAuthor, oTitle, socket, io) => {
    await Survey.findOneAndUpdate(
        { _id: sId },
        { title: oTitle.value },
        { new: true },
    )
        .exec()
        .then(() => {
            getSurveyByAuthor(sAuthor, socket, io, false);
            io.sockets.in(sAuthor).emit("SERVER_SEND_NEW_TITLE", oTitle);
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set description
 * @param {string} sId : id form
 * @param {string} sAuthor
 * @param {object} oDescription
 * @param io
 */
const setDescription = async (sId, sAuthor, oDescription, io) => {
    await Survey.findOneAndUpdate(
        { _id: sId },
        { description: oDescription.value },
        { new: true },
    )
        .exec()
        .then(() => {
            io.sockets
                .in(sAuthor)
                .emit("SERVER_SEND_NEW_DESCRIPTION", oDescription);
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set interface color
 * @param {string} sId : id form
 * @param {string} sAuthor
 * @param {object} oColor
 * @param io
 */
const setInterfaceColor = async (sId, sAuthor, oColor, io) => {
    await Survey.findOneAndUpdate(
        { _id: sId },
        { interfaceColor: oColor.color },
        { new: true },
    )
        .exec()
        .then(() => {
            io.sockets
                .in(sAuthor)
                .emit("SERVER_SEND_NEW_INTERFACE_COLOR", oColor);
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set background color
 * @param {string} sId : id form
 * @param {string} sAuthor
 * @param {object} oColor
 * @param io
 */
const setBackgroundColor = async (sId, sAuthor, oColor, io) => {
    await Survey.findOneAndUpdate(
        { _id: sId },
        { backgroundColor: oColor.color },
        { new: true },
    )
        .exec()
        .then(() => {
            io.sockets
                .in(sAuthor)
                .emit("SERVER_SEND_NEW_BACKGROUND_COLOR", oColor);
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set questions
 * @param {string} sId : id form
 * @param {string} sAuthor
 * @param {object} oQuestions
 * @param io
 */
const setQuestions = async (sId, sAuthor, oQuestions, io) => {
    await Survey.findOneAndUpdate(
        { _id: sId },
        { questions: oQuestions.questions },
        { new: true },
    )
        .exec()
        .then(() => {
            io.sockets
                .in(sAuthor)
                .emit("SERVER_SEND_NEW_QUESTIONS", oQuestions);
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set open question
 * @param {string} sId
 * @param {string} sAuthor
 * @param {object} oIdQues
 * @param io
 */
const setOpenQuestion = async (sId, sAuthor, oIdQues, io) => {
    await Survey.findOneAndUpdate(
        { _id: sId, "questions.open": true },
        { $set: { "questions.$.open": false } },
    )
        .exec()
        .then(() => {
            Survey.findOneAndUpdate(
                { _id: sId, "questions._id": oIdQues.idQuestion },
                { $set: { "questions.$.open": true } },
            )
                .exec()
                .then(() => {
                    Survey.findById(sId)
                        .exec()
                        .then((data) => {
                            io.in(sAuthor).emit(
                                "SERVER_CHANGED_STATUS_OPEN_QUESTION",
                                { survey: data, idForm: oIdQues.idForm },
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
 * @param {string} idForm
 * @param {int} iIndex
 * @param io
 */
const setTitleQuestion = async (
    sId,
    sAuthor,
    sIdQues,
    sTitle,
    iIndex,
    idForm,
    io,
) => {
    await Survey.findOneAndUpdate(
        { _id: sId, "questions._id": sIdQues },
        { $set: { "questions.$.questionText": sTitle } },
    )
        .exec()
        .then(() => {
            io.sockets.in(sAuthor).emit("SERVER_SEND_NEW_TITLE_QUESTION", {
                title: sTitle,
                index: iIndex,
                idForm,
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
 * @param {String} idForm
 * @param io
 */
const setQuestionType = async (
    sId,
    sAuthor,
    sIdQues,
    sType,
    iIndex,
    idForm,
    io,
) => {
    await Survey.findOneAndUpdate(
        { _id: sId, "questions._id": sIdQues },
        {
            $set: {
                "questions.$.questionType": sType,
                "questions.$.options": [
                    { optionText: "Tùy chọn 1", image: "", other: false },
                ],
            },
        },
    )
        .exec()
        .then((data) => {
            io.sockets.in(sAuthor).emit("SERVER_SEND_NEW_TYPE_QUESTION", {
                options: data.questions[iIndex].options,
                type: sType,
                index: iIndex,
                idForm,
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
 * @param {string} idForm
 * @param socket
 */
const setOptions = async (
    sId,
    sAuthor,
    sIdQues,
    aOptions,
    iIndex,
    idForm,
    socket,
) => {
    await Survey.findOneAndUpdate(
        { _id: sId, "questions._id": sIdQues },
        { $set: { "questions.$.options": aOptions } },
    )
        .exec()
        .then((data) => {
            socket.broadcast.to(sAuthor).emit("SERVER_SEND_NEW_OPTIONS", {
                options: aOptions,
                id: sIdQues,
                index: iIndex,
                idForm,
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
 * @param {string} idForm
 * @param socket
 */
const changeRequire = async (
    sId,
    sAuthor,
    sIdQues,
    bRequire,
    iIndex,
    idForm,
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
                idForm,
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set question image
 * @param {string} sIdForm
 * @param {string} sIdQuestion
 * @param {int} index
 * @param {string} sImage
 */
const setQuestionImage = async (sIdForm, sIdQuestion, index, sImage) => {
    await Survey.findById(sIdForm)
        .exec()
        .then((data) => {
            if (data.questions[index].image !== "") {
                // fs.unlink(data.questions[index].image, function (err) {
                //     console.log("File question image deleted!");
                // });
            }
            Survey.findOneAndUpdate(
                { _id: sIdForm, "questions._id": sIdQuestion },
                { $set: { "questions.$.image": sImage } },
            )
                .exec()
                .then()
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set option image
 * @param {string} sIdForm
 * @param {string} sIdQuestion
 * @param {int} indexQues
 * @param {int} indexOption
 * @param {string} sImage
 */
const setOptionImage = async (
    sIdForm,
    sIdQuestion,
    indexQues,
    indexOption,
    sImage,
) => {
    await Survey.findById(sIdForm)
        .exec()
        .then((data) => {
            var aOptions = data.questions[indexQues].options;
            if (aOptions[indexOption].image !== "") {
                // fs.unlink(aOptions[indexOption].image, function (err) {
                //     console.log("File option image deleted!");
                // });
            }
            aOptions[indexOption].image = sImage;

            Survey.findOneAndUpdate(
                { _id: sIdForm, "questions._id": sIdQuestion },
                { $set: { "questions.$.options": aOptions } },
            )
                .exec()
                .then(() => {
                    console.log("xong");
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
 * set question image
 * @param {object} oImage {idForm, sIdQuestion, path, index}
 * @param {string} sAuthor
 * @param io
 */
const deleteQuesImg = async (oImage, sAuthor, io) => {
    await Survey.findOneAndUpdate(
        { _id: oImage.idForm, "questions._id": oImage.sIdQuestion },
        { $set: { "questions.$.image": "" } },
    )
        .exec()
        .then(() => {
            // fs.unlink(oImage.path, function (err) {
            //     console.log("File deleted!");
            // });
            io.sockets.in(sAuthor).emit("SERVER_SEND_MSG_QUESTION_IMAGE", {
                image: "",
                index: oImage.index,
                idForm: oImage.idForm,
            });
        })
        .catch((err) => {
            console.log("loi");
        });
};

/*
 * set option image
 * @param {object} oImage {sIdForm, sIdQuestion, path, index}
 * @param {string} sAuthor
 * @param io
 */
const deleteOptionImg = async (oImage, sAuthor, io) => {
    await Survey.findById(oImage.idForm)
        .exec()
        .then((oData) => {
            aOptions = oData.questions[oImage.indexQues].options;
            aOptions[oImage.indexOption].image = "";

            Survey.findOneAndUpdate(
                { _id: oImage.idForm, "questions._id": oImage.sIdQuestion },
                { $set: { "questions.$.options": aOptions } },
            )
                .exec()
                .then(() => {
                    // fs.unlink(oImage.path, function (err) {
                    //     console.log("File option image deleted!");
                    // });
                    io.sockets.in(sAuthor).emit("SERVER_SEND_NEW_OPTIONS", {
                        options: aOptions,
                        id: oImage.sIdQuestion,
                        index: oImage.indexQues,
                        idForm: oImage.idForm,
                    });
                })
                .catch((err) => {
                    console.log(err);
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
    setQuestionImage,
    deleteQuesImg,
    setOptionImage,
    deleteOptionImg,
};
