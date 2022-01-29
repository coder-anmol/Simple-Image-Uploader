const fs = require("fs");
require("dotenv").config();

const cloudinary = require("cloudinary");
const Formidable = require("formidable");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  return res.end(fs.readFileSync("index.html", { encoding: "utf-8" }));
});

app.post("/", (req, res) => {
  const form = new Formidable.IncomingForm({
    uploadDir: "temp/uploads",
    keepExtensions: true,
  });

  // validations can be added here

  form.parse(req, async (err, fields, files) => {
    const oldPath = "temp/uploads" + "/" + files.upload.newFilename;
    const newPath = "temp/uploads" + "/" + files.upload.originalFilename;

    fs.rename(oldPath, newPath, (err) => {
      if (err) console.log(err);
    });

    const result = await cloudinary.v2.uploader.upload(newPath, {
      use_filename: true,
      unique_filename: true,
      folder: "testing",
    });

    if (result.public_id) {
      fs.unlink(newPath, (err) => {
        if (err) console.log(err);
      });

      const url = result.secure_url;
      res.send(`<a href="${url}" target="_blank">Watch</a>`);
    }
  });
});

// rest api
app.post("/api/upload", (req, res) => {
  const form = new Formidable.IncomingForm({
    uploadDir: "temp/uploads",
    keepExtensions: true,
  });

  // validations can be added here

  form.parse(req, async (err, fields, files) => {
    const oldPath = "temp/uploads" + "/" + files.upload.newFilename;
    const newPath = "temp/uploads" + "/" + files.upload.originalFilename;

    fs.rename(oldPath, newPath, (err) => {
      if (err) console.log(err);
    });

    const result = await cloudinary.v2.uploader.upload(newPath, {
      use_filename: true,
      unique_filename: true,
      folder: "testing",
    });

    if (result.public_id) {
      fs.unlink(newPath, (err) => {
        if (err) console.log(err);
      });
      const url = result.secure_url;
      res.json({
        status: "ok",
        fileUrl: url,
      });
    }
  });
});

app.listen(3000, () =>
  console.log("server is running on http://localhost:3000/")
);
