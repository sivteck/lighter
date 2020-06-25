const { loadUrls, runPSI, runPuppet, takeScreenshot } = require("./src/utils/utils");

if (!process.argv[2]) throw Error;

const filename = process.argv[2];

async function lightsUp(filename) {
  const urls = await loadUrls(filename);
  console.log(urls);
  for (const url of urls) {
    try {
      await runPSI(url, "mobile");
      await runPSI(url, "desktop");
      // await takeScreenshot(url)
    } catch (err) {
      console.log(err);
      console.log("too slow");
    }
  }
}

async function puppetIt(filename) {
  const urls = await loadUrls(filename);
  console.log(urls)
  for (const url of urls) {
    runPuppet(url)
  }
}

if (process.argv[3] === "lighthouse")
  lightsUp(filename).then(() => console.log("ensoy"));
if (process.argv[3] === "puppet")
  puppetIt(filename).then(() => console.log("puppet pipette"));
