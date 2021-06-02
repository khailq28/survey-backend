const express = require("express");
const multer = require("multer");
const { setQuestionImage } = require("./createFormPage");

const path = require("path");

const formatDate = () => {
    var date = new Date();
    var hour = `0${date.getHours()}`.slice(-2);
    var minute = `0${date.getMinutes()}`.slice(-2);
    var second = `0${date.getSeconds()}`.slice(-2);
    var day = `0${date.getDate()}`.slice(-2);
    var mounth = `0${date.getMonth() + 1}`.slice(-2);
    var year = date.getFullYear();

    return `${hour}${minute}${second}${day}${mounth}${year}`;
};

// random id
var s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
};

var generateID = () => {
    return (
        s4() + s4() + "-" + s4() + "-" + "-" + s4() + s4() + s4() + "-" + s4()
    );
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/");
    },
    filename: function (req, file, cb) {
        // You could rename the file name
        // cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))

        // You could use the original name
        cb(null, formatDate() + generateID() + file.originalname);
    },
});

var upload = multer({
    storage: storage,
});

const router = express.Router();

// Upload Image
router.post("/setQuestionImage", upload.single("photo"), (req, res, next) => {
    setQuestionImage(
        req.body.idForm,
        req.body.idQues,
        req.body.index,
        req.file.path,
    );
    return res.json({
        image: req.file.path,
        idForm: req.body.idForm,
        idQues: req.body.idQues,
    });
});

router.get("/", (req, res) => {
    res.send("server is up and running");
});
module.exports = router;
