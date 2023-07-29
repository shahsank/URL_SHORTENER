const app = require('./app');
const serverless = require('serverless-http');
checkUrl();
let isEmpty = true;
const shortUrlElement = document.getElementById("shortUrl");
const windowUrl = window.location.href;


async function shortenUrl() {
  const originalUrl = document.getElementById("originalUrl").value;
  console.log("start", originalUrl);
  const response = await fetch("/shorten", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ originalUrl, windowUrl }),
  });
  console.log(response.body);
  const data = await response.json();
  const shortUrl = data.shortUrl;
  document.getElementById("shortUrl").innerText = `${shortUrl}`;
  checkUrl();
}


function copyUrl() {
  const copyText = document.getElementById("shortUrl").innerText;
  const tempTextarea = document.createElement("textarea");
  tempTextarea.value = copyText;
  document.body.appendChild(tempTextarea);
  tempTextarea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextarea);
  alert("Text copied to clipboard!");
}


function checkUrl() {
  console.log("yoooo");
  const contentElement = document.getElementsByClassName("content");
  console.log(contentElement);
  const text = document.getElementById("shortUrl")?.innerText;
  console.log(text);
  if (text && text.length > 0) {
    Array.from(contentElement).forEach((element) => {
      element.classList.remove("hide");
    });
  } else {
    console.log('hide');
    Array.from(contentElement).forEach((element) => {
      element.classList.add("hide");
    });
  }
}


function redirectToUrl() {
  const shortenedUrl = shortUrlElement.innerText;
  if (shortenedUrl) {
    window.open(shortenedUrl, "_target");
  }
}

module.exports.handler = serverless(app);