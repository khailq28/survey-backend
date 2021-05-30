const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const mongoose = require("mongoose");
const action = require("./action");

const PORT = process.env.PORT || 5000;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
    console.log("We have a new connection!!!");

    socket.on("join", (data) => {
        console.log(data);
    });
});

action.getSurveyByAuthor("khailuong61@gmail.com");

// const a = new Survey({
//     id: "81b84e3-a076-56a-8bc-33bcc2b62d",
//     author: "khailuong61@gmail.com",
//     title: "Mẫu Không tiêu đề",
//     description: "",
//     questions: [
//         {
//             questionText: "",
//             questionType: "text",
//             options: [{ optionText: "" }],
//             open: true,
//             required: false,
//             answers: [],
//         },
//     ],
//     interfaceColor: "#673AB7",
//     backgroundColor: "#F0EBF8",
//     updateDate: "18:03 30/05/2021",
// });

// a.save()
//     .then((result) => {
//         console.log(result);
//     })
//     .catch((err) => {
//         console.log(err);
//     });

app.use(router);

mongoose
    .connect(
        "mongodb+srv://surveyapp:survey123@cluster0.csh9w.mongodb.net/survey-app-clone?retryWrites=true&w=majority",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    )
    .then(() =>
        server.listen(PORT, () =>
            console.log(`Server has started on port ${PORT}`),
        ),
    )
    .catch((error) => console.log(error.message));

// server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
