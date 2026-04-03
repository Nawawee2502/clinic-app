const fs = require('fs');
const glob = require('glob');

const files = glob.sync('/Users/vdiesel/Desktop/clinic/clinic/src/pages/*Management.js');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // Add format="DD/MM/YYYY" to <DatePicker if not present
  // A regex to find <DatePicker tags and checking if format is inside
  
  // Actually a simpler way: split by "<DatePicker"
  const parts = newContent.split('<DatePicker');
  for(let i=1; i<parts.length; i++) {
    // Look at the part up to the closing ">"
    const closeIdx = parts[i].indexOf('>');
    if(closeIdx !== -1) {
        const tagContent = parts[i].substring(0, closeIdx);
        if(!tagContent.includes('format=')) {
            parts[i] = '\n                                            format="DD/MM/YYYY"' + parts[i];
        }
    }
  }
  
  newContent = parts.join('<DatePicker');
  
  if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    console.log('Fixed', file);
  }
}
