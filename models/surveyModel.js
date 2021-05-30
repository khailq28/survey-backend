const mongooes = require("mongoose");

const SurveysSchema = new mongooes.Schema({
    id: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    questions: [
        {
            questionText: String,
            questionType: String,
            options: [{ optionText: String }],
            open: {
                type: Boolean,
                required: true,
            },
            required: {
                type: Boolean,
                required: true,
            },
            answers: [
                {
                    user: {
                        type: String,
                        required: true,
                    },
                    answer: String,
                },
            ],
        },
    ],
    interfaceColor: {
        type: String,
        required: true,
    },
    backgroundColor: {
        type: String,
        required: true,
    },
    updateDate: {
        type: String,
        required: true,
    },
});

module.exports = mongooes.model("Survey", SurveysSchema);
