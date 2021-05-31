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
 * get id, title, updateDate by author
 * @param {string} author
 * @param socket
 * @param io
 * @param {boolean} bFirstAccess
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
                io.sockets.in(socket.room).emit("SERVER_SEND_SURVEYS", data);
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
 */
const deleteSurveyById = async (sId, sAuthor, socket, io) => {
    await Survey.deleteOne({ id: sId })
        .exec()
        .then(() => {
            getSurveyByAuthor(sAuthor, socket, io);
            socket.emit("REMOVE_SURVEY_SUCCESS");
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
            getSurveyByAuthor(sAuthor, socket, io);
        })
        .catch((err) => {
            console.log(err);
        });
};

/*
 * find survey by id
 * @param {string} sId
 * @param socket
 */
const findSurveyById = async (sId, socket) => {
    await Survey.findOne({ id: sId }, { _id: 0 })
        .exec()
        .then((data) => {
            socket.emit("SERVER_SEND_SURVEY_TO_CREATE_FORM_PAGE", data);
        })
        .catch((err) => {
            console.log(err);
        });
};

module.exports = {
    getSurveyByAuthor,
    deleteSurveyById,
    createNewForm,
    findSurveyById,
};
