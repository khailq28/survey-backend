const Survey = require("./models/surveyModel");

const formatDate = () => {
    var date = new Date();
    var hour = `0${date.getHours()}`.slice(-2);
    var minute = `0${date.getMinutes()}`.slice(-2);
    var day = `0${date.getDate()}`.slice(-2);
    var mounth = `0${date.getMonth() + 1}`.slice(-2);
    var year = date.getFullYear();

    return `${hour}:${minute} ${day}/${mounth}/${year}`;
};

/*
 * update date
 * @param {string} author
 * @param socket
 * @param io
 * @param {string} sId
 */
const setUpdateDate = async (sId, sAuthor, socket, io) => {
    await Survey.findOneAndUpdate({ id: sId }, { updateDate: formatDate() })
        .exec()
        .then(() => {
            getSurveyByAuthor(sAuthor, socket, io, false);
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * get id, title, updateDate by author
 * @param {string} author
 * @param socket
 * @param io
 * @param {boolean} bFirstAccess
 * emit message
 */
const getSurveyByAuthor = async (sAuthor, socket, io, bFirstAccess) => {
    await Survey.find(
        { author: sAuthor },
        { id: 1, title: 1, updateDate: 1, _id: 0 },
    )
        .exec()
        .then((data) => {
            if (bFirstAccess) {
                socket.emit("SERVER_SEND_SURVEYS", data);
            } else {
                io.sockets.in(sAuthor).emit("SERVER_SEND_SURVEYS_ALL", data);
            }
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * delete survey by id
 * @param {string} sId
 * @param {string} sAuthor : current user
 * @param socket
 * @param io
 * emit message
 */
const deleteSurveyById = async (sId, sAuthor, socket, io) => {
    await Survey.deleteOne({ id: sId })
        .exec()
        .then(() => {
            getSurveyByAuthor(sAuthor, socket, io, false);
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * create new form
 * @param {string} sFormId
 * @param {string} sAuthor : current user
 * @param socket
 * @param io
 * emit message
 */
const createNewForm = async (sFormId, sAuthor, socket, io) => {
    const oSurvey = new Survey({
        id: sFormId,
        author: sAuthor,
        title: "Mẫu Không tiêu đề",
        description: "",
        questions: [
            {
                questionText: "",
                questionType: "text",
                options: [{ optionText: "" }],
                open: true,
                required: false,
                answers: [],
            },
        ],
        interfaceColor: "#673AB7",
        backgroundColor: "#F0EBF8",
        updateDate: formatDate(),
    });

    oSurvey
        .save()
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
    await Survey.findOne({ id: sId }, { _id: 0 })
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
    await Survey.findOneAndUpdate({ id: sId }, { title: sTitle })
        .exec()
        .then(() => {
            getSurveyByAuthor(sAuthor, socket, io, false);
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * set description
 * @param {string} sId : id form
 * @param {string} sDescription
 */
const setDescription = async (sId, sDescription) => {
    await Survey.findOneAndUpdate({ id: sId }, { description: sDescription })
        .exec()
        .then()
        .catch((err) => {
            console.log(err);
        });
};

module.exports = {
    getSurveyByAuthor,
    deleteSurveyById,
    createNewForm,
    findSurveyById,
    setTitle,
    setDescription,
};
