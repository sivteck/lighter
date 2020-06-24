const psi = require("psi");
const puppeteer = require("puppeteer");
const { readFile } = require("fs").promises;
const { metricsOfInterest, gKey, numberOfRuns } = require("../../config.js");

if (!gKey) {
  console.log("Add valid google api key to googleAPIKey file");
  exit(1);
}

async function loadUrls(source, type = "file") {
  let urls;
  if (type == "file") urls = await readFile(source);
  return urls.toString().split("\n").slice(0, -1);
}

function outputCSVString(audits, numberOfRuns) {
  const results = {};
  let metrics = "";
  let scores = "";
  let values = "";
  for (const audit of audits) {
    for (const metric of metricsOfInterest) {
      if (!results[metric]) results[metric] = { score: 0, numericValue: 0 };
      if (audit[metric].score && audit[metric].numericValue) {
        results[metric].score += audit[metric].score;
        results[metric].numericValue += audit[metric].numericValue;
      }
    }
  }

  for (const metric of metricsOfInterest) {
    results[metric].score /= numberOfRuns;
    results[metric].numericValue /= numberOfRuns;
    metrics += metric + ",";
    scores += String(results[metric].score.toFixed(2)) + ",";
    values += String(results[metric].numericValue.toFixed(2)) + ",";
  }

  return { metrics, scores, values };
}

async function runPSI(url, strategy) {
  const audits = [];

  for (let i = 0; i < numberOfRuns; i++) {
    const { data } = await psi(url, {
      key: gKey, 
      strategy,
    });
    audits.push({ ...data.lighthouseResult.audits });
  }

  const { metrics, scores, values } = outputCSVString(audits, numberOfRuns);
  console.log(
    `FOR URL: ${url} | Number of Runs: ${numberOfRuns} | Strategy: ${strategy} \n Metrics, Scores and Values \n All time values are in ms`
  );
  console.log("CSV OUTPUT");
  console.log(metrics);
  console.log(scores);
  console.log(values);
  // await psi.output(url, { format: "json", key: "AIzaSyARWPLCDUQPxOXWpn0p2MR59DUj3HM8yhI"  });
  console.log("Done");
}

async function takeScreenshot(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  console.log("--------------------");
  await page.screenshot({ path: "expm.png" });
  await browser.close();
}

module.exports = { loadUrls, runPSI, takeScreenshot };
