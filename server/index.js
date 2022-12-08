const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const db = mysql.createPool({
  host: "mysql_db",
  user: "MYSQL_USER",
  password: "MYSQL_PASSWORD",
  database: "whiteboard",
});

const storage = multer.diskStorage({
  destination: path.join(__dirname, "/public/images"),
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}.${file.mimetype.split("/")[1]}`);
  },
});

const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  multer({
    storage,
    dest: path.join(__dirname, "public/images"),
  }).single("image")
);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Hi there");
});

app.get("/get", (req, res) => {
  const selectQuery = "Select * from images";
  db.query(selectQuery, (err, result) => {
    res.send(result);
  });
});

app.delete("/delete/:imageId", (req, res) => {
  const imageId = req.params.imageId;
  const deleteQuery = "Delete from images where id = ?";
  db.query(deleteQuery, imageId, (err, resul) => {
    if (err) console.log(err);
  });
});

app.post("/upload", function (req, res) {
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    console.log(error);
  }
  const imageName = file.filename;
  const route = file.path;
  const insertQuery = "INSERT INTO images (image_name, route) values (?, ?)";
  db.query(insertQuery, [imageName, route], (err, result) => {
    console.log(result);
  });
  res.send(file);
  console.log(req.file, req.body);
});

//var sockets = io.listen(server);
io.on("connection", (socket) => {
  console.log("a user connected");
  console.log(socket.id);

  socket.on("message", (message) => {
    console.log(message);
    socket.broadcast.emit("message", message);
  });
});

server.listen("3001", () => {});
console.log("server started on port ...");
