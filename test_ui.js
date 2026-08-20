const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const jsPlaces = fs.readFileSync('places-api.js', 'utf8');
const jsApp = fs.readFileSync('app.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "outside-only", url: "http://localhost" });
const window = dom.window;
const document = window.document;
global.window = window;
global.document = document;
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};
global.L = {
  icon: () => {},
  map: () => ({ setView: () => {}, on: () => {}, invalidateSize: () => {} }),
  tileLayer: () => ({ addTo: () => {} })
};

try {
  window.eval(jsPlaces);
  window.eval(jsApp);
  window.eval('document.dispatchEvent(new window.Event("DOMContentLoaded"))');
  window.eval('switchTab("profile")');
  console.log("HTML length inside profile: " + document.getElementById('view-profile').innerHTML.length);
  console.log("SUCCESS");
} catch (e) {
  console.log("ERROR: " + e.message);
  console.log(e.stack);
}
