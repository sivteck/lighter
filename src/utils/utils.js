const psi = require("psi");
const puppeteer = require("puppeteer");
const { readFile } = require("fs").promises;

async function loadUrls(source, type = "file") {
  let urls;
  if (type == "file") urls = await readFile(source);
  return urls.toString().split("\n").slice(0, -1);
}

async function runPSI(url) {
  const { data } = await psi(url, { format: "json" });
  console.log(
    "Speed score:",
    data.lighthouseResult.categories.performance.score
  );
  await psi.output(url);
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
