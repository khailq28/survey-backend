const Survey = require("./models/surveyModel");

/*
 * find survey by id
 * @param {string} sId
 * @param {string} sAuthor
 * @param socket
 * emit message
 */
const findSurveySubmit = async (sId, sAuthor, socket) => {
    await Survey.findById(sId, { "questions.answers": 1, status: 1 })
        .exec()
        .then((data) => {
            if (data.status) {
                var checkDo = true;
                data.questions.forEach((question) => {
                    question.answers.forEach((answer) => {
                        if (answer.user === sAuthor) {
                            checkDo = false;
                        }
                    });
                });

                if (checkDo) {
                    Survey.findById(sId, { "questions.answers": 0 })
                        .exec()
                        .then((data) => {
                            socket.emit("SERVER_SEND_SURVEY_SUBMIT", data);
                        })
                        .catch((err) => {
                            console.log(err);
                            socket.emit("SERVER_SEND_MSG_NOT_FOUND");
                        });
                } else {
                    socket.emit("SERVER_SEND_MSG_DONE");
                }
            } else {
                socket.emit("SERVER_SEND_MSG_FORM_CLOSE");
            }
        })
        .catch((err) => {
            console.log(err);
            socket.emit("SERVER_SEND_MSG_NOT_FOUND");
        });
};

/*
 * push data answer
 * @param {object} oSubmit
 * surveyId: '60c47fa8811822427851c4ae',
 * author: ""
 * created: ""
 * content: [
 *  {
 *      idQuestion: '60c47fbb811822427851c4c1',
 *      type: 'radio',
 *      required: true,
 *      validate: false,
 *      answers: { user: action.author, answer: "", checkbox: [{value, optionId}] }
 *  }
 * ]
 * @param socket
 * emit message
 */
const submitForm = async (oSubmit, socket) => {
    Survey.findOneAndUpdate(
        { _id: oSubmit.surveyId },
        {
            $push: {
                submiter: { name: oSubmit.author, created: oSubmit.created },
            },
        },
    )
        .exec()
        .then(() => {})
        .catch();

    oSubmit.content.forEach((element, index) => {
        var answer = [];
        if (element.type === "checkbox") {
            element.answers.checkbox.forEach((ele) => {
                answer.push(ele.value);
            });
        } else {
            answer.push(element.answers.answer);
        }
        Survey.findOneAndUpdate(
            {
                _id: oSubmit.surveyId,
                "questions._id": element.idQuestion,
            },
            {
                $push: {
                    "questions.$.answers": {
                        user: oSubmit.author,
                        answer: answer,
                    },
                },
            },
        )
            .exec()
            .then(() => {
                if (index === oSubmit.content.length - 1) {
                    Survey.findById(oSubmit.surveyId, {
                        questions: 1,
                        author: 1,
                        submiter: 1,
                    })
                        .exec()
                        .then((data) => {
                            socket.broadcast
                                .to(data.author)
                                .emit("SERVER_SEND_NEW_ANSWER", {
                                    questions: data.questions,
                                    idForm: data._id,
                                    submiter: data.submiter
                                });
                        })
                        .catch();

                    socket.emit("SERVER_SEND_MSG_SUBMIT_SUCCESS");
                }
            })
            .catch((err) => {
                console.log(err);
            });
    });
};

module.exports = {
    findSurveySubmit,
    submitForm,
};
