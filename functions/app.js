const express = require("express");
const path = require('path');
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();
const dbPassword = process.env.DB_PASSWORD;
console.log(dbPassword)
const url = `mongodb+srv://ss24392483:${dbPassword}@url-map.e3b5fjr.mongodb.net/?retryWrites=true&w=majority`;

const app = express();
const router = express.Router();
app.use(express.json());
app.use(express.static("dist"));
console.log("beeeee");

mongoose
  .connect(url)
  .then(() => {
    console.log("Mongo-DB Connected Successfully");
  })
  .catch((err) => {
    console.log("Mongo-DB Connection Failed", err);
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

router.get("/", (req, res) => {
  const filePath = path.join(__dirname, 'dist', 'index.html');
  console.log(filePath)
  res.sendFile(filePath);
});

// Route to handle URL shortening
router.post("/shorten", async (req, res) => {
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
router.get("/redirect/:uniqueId", async (req, res) => {
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

app.use('/', router);
const serverless = require('serverless-http')
const port = 3000;
const handler = serverless(app);
module.exports.handler = handler;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
module.exports = app;