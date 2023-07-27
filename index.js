const express = require("express");
const { v4: uuidv4 } = require("uuid");
// const { MongoClient } = require('mongodb');
const mongoose = require("mongoose");

const url = "mongodb://localhost:27017/URL-Map";
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
  res.send("Welcome to URL Shortener");
});

// Route to handle URL shortening
app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res
      .status(400)
      .json({ error: "Please provide the original URL to shorten." });
  }

  const UUID = uuidv4();
  const shortUrl = `http://localhost:3000/redirect/${UUID}`;

  // Store the shortened URL in the database
  try {
    await URLMapModel.create({ UUID, originalUrl });
  } catch (error) {
    console.log(error);
  }
  res.status(200).json({ shortUrl, originalUrl });
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