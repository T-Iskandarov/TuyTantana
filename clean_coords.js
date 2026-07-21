const fs = require('fs');

function clean(file) {
  let content = fs.readFileSync(file, 'utf8');
  let index = content.indexOf('export const districtCoordinates = {');
  if (index !== -1) {
    fs.writeFileSync(file, content.substring(0, index));
  }
}

clean('mobile/src/lib/regions.js');
clean('frontend/lib/regions.js');
