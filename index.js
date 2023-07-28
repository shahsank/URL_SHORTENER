const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { spawn } = require('child_process');
// const { MongoClient } = require('mongodb');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();
const dbPassword = process.env.DB_PASSWORD;
console.log(dbPassword)
// const url = "mongodb://localhost:27017/URL-Map";
const url = `mongodb+srv://ss24392483:${dbPassword}@url-map.e3b5fjr.mongodb.net/?retryWrites=true&w=majority`;
// const options = { useNewUrlParser: true, useUnifiedTopology: true };

const app = express();
app.use(express.json());
app.use(express.static("public"));
console.log("beeeee");

mongoose
  .connect(url)
  .then(() => {
    console.log("Mongo-DB Connected Successfully");
  })
  .catch(() => {
    console.log("Mongo-DB Connection Failed");
  });

const URLMapSchema = new mongoose.Schema({
  UUID: {
    type: String,
    required: true,
  },
  originalUrl: {
    type: String,
    required: true,
  },
});

const URLMapModel = mongoose.model("URL-Map", URLMapSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + '/index.html');//sendFile("~/index.html");
});

// Route to handle URL shortening
app.post("/shorten", async (req, res) => {
  console.log('........', req.body)
  const { originalUrl, windowUrl } = req.body;

  if (!originalUrl) {
    return res
      .status(400)
      .json({ error: "Please provide the original URL to shorten." });
  }

  const UUID = uuidv4();
  console.log(windowUrl);
  const shortUrl = `${windowUrl}redirect/${UUID}`;

  // Store the shortened URL in the database
  try {
    await URLMapModel.create({ UUID, originalUrl });
  } catch (error) {
    console.log(error);
  }
  res.status(200).json({ shortUrl });
});

// Route to handle URL redirection
app.get("/redirect/:uniqueId", async (req, res) => {
  const { uniqueId } = req.params;
  console.log(req.params);
  // Find the original URL from the database using the uniqueId
  const result = await URLMapModel.find({ UUID: uniqueId });
  if(!result[0]) {
    return res.status(500).send("OOPS! that's the wrong URL");
  }
  if (
    !result[0].originalUrl.startsWith("http://") &&
    !result[0].originalUrl.startsWith("https://")
  ) {
    result[0].originalUrl = `http://${result[0].originalUrl}`;
  }
  console.log(result[0] !== undefined);
  try {
    res.redirect(result[0].originalUrl);
  } catch (error) {
    // console.log(error);
    res.status(500).send("OOPS! that didn't work.");
  }
  // res.send('OK')
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
