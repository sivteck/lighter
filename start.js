const { loadUrls, runPSI, takeScreenshot } = require("./src/utils/utils");
if (!process.argv[2]) throw Error;

const filename = process.argv[2];

async function lightsUp(filename) {
  const urls = await loadUrls(filename);
  console.log(urls);
  for (const url of urls) {
    try {
      await runPSI(url);
      // await takeScreenshot(url)
    } catch (err) {
      console.log(err);
      console.log("too slow");
    }
  }
}

lightsUp(filename).then(() => console.log("ensoy"));
