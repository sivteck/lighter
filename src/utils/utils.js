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

function addUnit(metric) {
  if (
    [
      "first-contentful-paint",
      "largest-contentful-paint",
      "interactive",
      "total-blocking-time",
    ].includes(metric)
  ) {
    return "ms";
  }
  return "";
}

function outputCSVString(audits, numberOfRuns) {
  const results = { score: 0 };
  let metrics = "";
  let scores = "";
  let values = "";
  for (const audit of audits) {
    results.score += audit.score;
    for (const metric of metricsOfInterest) {
      if (!results[metric]) results[metric] = { score: 0, numericValue: 0 };
      if (audit[metric].score && audit[metric].numericValue) {
        results[metric].score += audit[metric].score;
        results[metric].numericValue += audit[metric].numericValue;
      }
    }
  }
  results.score /= numberOfRuns;
  for (const metric of metricsOfInterest) {
    results[metric].score /= numberOfRuns;
    results[metric].numericValue /= numberOfRuns;
    metrics += metric + ",";
    scores += String(results[metric].score.toFixed(2)) + ",";
    values +=
      String(results[metric].numericValue.toFixed(2)) + addUnit(metric) + ",";
  }

  return { metrics, scores, values, results };
}

async function runPSI(url, strategy) {
  const audits = [];

  for (let i = 0; i < numberOfRuns; i++) {
    const { data } = await psi(url, {
      key: gKey,
      strategy,
    });

    audits.push({
      ...data.lighthouseResult.audits,
      score: data.lighthouseResult.categories.performance.score,
    });
  }

  const { metrics, scores, values, results } = outputCSVString(
    audits,
    numberOfRuns
  );
  console.log(
    `FOR URL: ${url} | Number of Runs: ${numberOfRuns} | Strategy: ${strategy} \n Metrics, Scores and Values \n All time values are in ms`
  );

  console.log("JSON OUTPUT");
  console.log(results);
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

async function calcTime(perfTimes) {
  const navigationStart = perfTimes.navigationStart;
  for (const key in perfTimes) {
    perfTimes[key] = perfTimes[key] - navigationStart;
  }
}

async function puppetCSVOutput(perfTimes, url) {
  const responseTime =
    String(perfTimes["responseEnd"] - perfTimes["requestStart"]) + " ms";
  const ttfb = String(perfTimes["responseStart"]) + " ms";
  console.log(`CSV OUTPUT | URL: ${url}`);
  console.log(`Response Time, TTFB`);
  console.log(`${responseTime}, ${ttfb}`);
}

async function runPuppet(url) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const performanceTiming = JSON.parse(
      await page.evaluate(() => JSON.stringify(window.performance.timing))
    );
    calcTime(performanceTiming);
    console.log(performanceTiming);
    puppetCSVOutput(performanceTiming, url);
    await browser.close();
  } catch (e) {
    console.error(e);
  }
}

module.exports = { loadUrls, runPSI, runPuppet, takeScreenshot };
