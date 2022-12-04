const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const db = mysql.createPool({
  host: "mysql_db",
  user: "MYSQL_USER",
  password: "MYSQL_PASSWORD",
  database: "whiteboard"
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hi there");
});

app.get("/get", (req, res) => {
  const selectQuery = "Select * from images";
  db.query(selectQuery, (err, result) => {
    res.send(result);
  });
});

app.post("/insert", (req, res) => {
  const imageName = req.body.imageName;
  const insertQuery = "INSERT INTO images (image_name) values (?)";
  db.query(insertQuery, [imageName], (err, result) => {
    console.log(result);
  });
});

app.delete("/delete/:imageId", (req, res) => {
  const imageId = req.params.imageId;
  const deleteQuery = "Delete from images where id = ?";
  db.query(deleteQuery, imageId, (err, resul) => {
    if (err) console.log(err);
  });
});

app.listen("3001", () => {});
