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
 * @param {string} sColor
 */
const setInterfaceColor = async (sId, sColor) => {
    await Survey.findOneAndUpdate(
        { _id: sId },
        { interfaceColor: sColor },
        { new: true },
    )
        .exec()
        .then()
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set background color
 * @param {string} sColor
 */
const setBackgroundColor = async (sId, sColor) => {
    await Survey.findOneAndUpdate(
        { _id: sId },
        { backgroundColor: sColor },
        { new: true },
    )
        .exec()
        .then()
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set questions
 * @param {array} index
 */
const setQuestions = async (sId, aQuestions) => {
    await Survey.findOneAndUpdate(
        { _id: sId },
        { questions: aQuestions },
        { new: true },
    )
        .exec()
        .then()
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set open question
 * @param {string} sId
 * @param {string} sIdQues
 */
const setOpenQuestion = async (sId, sIdQues) => {
    await Survey.findOneAndUpdate(
        { _id: sId, "questions.open": true },
        { $set: { "questions.$.open": false } },
    )
        .exec()
        .then(() => {
            Survey.findOneAndUpdate(
                { _id: sId, "questions._id": sIdQues },
                { $set: { "questions.$.open": true } },
            ).exec();
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set title question
 * @param {string} sId
 * @param {string} sIdQues
 * @param {string} sTitle
 */
const setTitleQuestion = async (sId, sIdQues, sTitle) => {
    await Survey.findOneAndUpdate(
        { _id: sId, "questions._id": sIdQues },
        { $set: { "questions.$.questionText": sTitle } },
    )
        .exec()
        .then(() => {})
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set question type
 * @param {string} sId
 * @param {string} sIdQues
 * @param {string} sType
 */
const setQuestionType = async (sId, sIdQues, sType) => {
    await Survey.findOneAndUpdate(
        { _id: sId, "questions._id": sIdQues },
        { $set: { "questions.$.questionType": sType } },
    ).exec();
};

/*
 * set question type
 * @param {string} sId
 * @param {array} aOptions
 */
const setOptions = async (sId, aOptions) => {
    await Survey.findOneAndUpdate(
        { _id: sId, "questions._id": aOptions.id },
        { $set: { "questions.$.options": aOptions.options } },
    ).exec();
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
};
