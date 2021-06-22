const Survey = require("./models/surveyModel");

// /*
//  * get all result
//  * @param {string} idForm
//  * @param socket
//  * emit message
//  */
// const getAllResults = async (idForm, socket) => {
//     Survey.findById(idForm, { "questions.answers": 1, _id: 0 })
//         .exec()
//         .then((data) => {
//             socket.emit("SERVER_SEND_RESULTS", data.questions);
//         })
//         .catch((err) => {
//             console.log(err);
//         });
// };

module.exports = {
    // getAllResults,
};
