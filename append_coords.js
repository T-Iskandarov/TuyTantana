const fs = require('fs');

const coordsStr = fs.readFileSync('districtCoords.json', 'utf8');

const exportStr = `\n\nexport const districtCoordinates = ${coordsStr};\n`;

fs.appendFileSync('mobile/src/lib/regions.js', exportStr);
fs.appendFileSync('frontend/lib/regions.js', exportStr);

console.log("Appended");
