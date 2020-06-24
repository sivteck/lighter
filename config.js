const fs = require("fs")
//Parameters of Interest
// Available Metrics
// render-blocking-resources,mainthread-work-breakdown,cumulative-layout-shift,interactive,server-response-time,dom-size,uses-long-cache-ttl,largest-contentful-paint,redirects,total-byte-weight,max-potential-fid,speed-index,third-party-summary,first-contentful-paint,estimated-input-latency,first-meaningful-paint,first-cpu-idle,bootup-time,first-contentful-paint-3g,total-blocking-time

const metricsOfInterest = ["first-contentful-paint", "largest-contentful-paint", "interactive", "total-blocking-time", "cumulative-layout-shift"]

// Google Developer API key
const gKey = fs.readFileSync("./googleAPIKey");

//Number of lightspeed runs per URL, outputs average
const numberOfRuns = 5

module.exports = {
  metricsOfInterest,
  gKey,
  numberOfRuns
}
