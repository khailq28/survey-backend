const Survey = require("./models/surveyModel");

module.exports = {
    /*
     * get id, title, updateDate by author
     * @param {string} author
     * @return {object}
     */
    getSurveyByAuthor: (sAuthor) => {
        Survey.find({ author: sAuthor }, { id: 1, title: 1, updateDate: 1 })
            .exec()
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
            });
    },
};
