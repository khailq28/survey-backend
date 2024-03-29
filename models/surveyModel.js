const mongooes = require("mongoose");

const SurveysSchema = new mongooes.Schema({
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
            image: String,
            options: [{ optionText: String, image: String, other: false }],
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
                    answer: {
                        type: [String],
                    },
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
    status: {
        type: Boolean,
        required: true,
    },
    submiter: [
        {
            name: {
                type: String,
                required: true,
            },
            created: {
                type: String,
                required: true,
            },
        },
    ],
    timer: {
        start: {
            status: Boolean,
            value: String,
        },
        end: {
            status: Boolean,
            value: String,
        },
    },
    // timer: {
    //     start: {
    //         status: Boolean,
    //         hour: String,
    //         minute: String,
    //         second: String,
    //         millisecond: String,
    //         day: String,
    //         month: String,
    //         year: String,
    //     },
    //     end: {
    //         status: Boolean,
    //         hour: String,
    //         minute: String,
    //         second: String,
    //         millisecond: String,
    //         day: String,
    //         month: String,
    //         year: String,
    //     },
    // },
});

module.exports = mongooes.model("Survey", SurveysSchema);
