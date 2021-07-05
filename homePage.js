const Survey = require("./models/surveyModel");

const formatDate = () => {
    var date = new Date();
    var hour = `0${date.getHours()}`.slice(-2);
    var minute = `0${date.getMinutes()}`.slice(-2);
    var day = `0${date.getDate()}`.slice(-2);
    var month = `0${date.getMonth() + 1}`.slice(-2);
    var year = date.getFullYear();

    return `${hour}:${minute} ${day}/${month}/${year}`;
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
    await Survey.find({ author: sAuthor }, { title: 1, updateDate: 1 })
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
    await Survey.findByIdAndRemove(sId)
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
 * @param {string} sAuthor : current user
 * @param socket
 * @param io
 * emit message
 */
const createNewForm = async (sAuthor, socket, io) => {
    const oSurvey = new Survey({
        author: sAuthor,
        title: "Mẫu Không tiêu đề",
        description: "",
        questions: [
            {
                questionText: "",
                questionType: "text",
                image: "",
                options: [
                    { optionText: "Tùy chọn 1", image: "", other: false },
                ],
                open: true,
                required: false,
                answers: [],
            },
        ],
        interfaceColor: "#673AB7",
        backgroundColor: "#F0EBF8",
        updateDate: formatDate(),
        status: true,
        submiter: [],
        timer: {
            start: {
                status: false,
                value: "",
            },
            end: {
                status: false,
                value: "",
            },
        },
        // timer: {
        //     start: {
        //         status: false,
        //         hour: "",
        //         minute: "",
        //         second: "",
        //         millisecond: "",
        //         day: "",
        //         month: "",
        //         year: "",
        //     },
        //     end: {
        //         status: false,
        //         hour: "",
        //         minute: "",
        //         second: "",
        //         millisecond: "",
        //         day: "",
        //         month: "",
        //         year: "",
        //     },
        // },
    });

    oSurvey
        .save()
        .then((data) => {
            getSurveyByAuthor(sAuthor, socket, io, false);
            socket.emit("SERVER_SEND_MESSAGE_CREATE_SURVEY_SUCCESS", data._id);
        })
        .catch((err) => {
            console.log(err);
        });
};

module.exports = {
    formatDate,
    getSurveyByAuthor,
    deleteSurveyById,
    createNewForm,
};
