const fs = require('fs');
const js = fs.readFileSync('app.js', 'utf8');

const jsb = js.substring(js.indexOf('const state'), js.indexOf('// --- UI INITIALIZATION ---'));

const stub = `
const localStorage = { getItem: () => '0' };
const document = {
  getElementById: (id) => {
    return {
      textContent: '',
      className: '',
      style: {},
      innerHTML: ''
    };
  }
};
`;
try {
  eval(stub + jsb + '; renderProfileView(); console.log("Success");');
} catch (e) {
  console.log("Error: " + e.stack);
}
