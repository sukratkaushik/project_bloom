const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = [
  'sukrat.jpg',
  'lakshay.jpg',
  'vaishali.png',
  'food_scanner_updated_1779026987896.png',
  'food_scanner_mockup_1778967420573.png',
  'dashboard_mockup_1778967408326.png'
];

async function convert() {
  for (const file of files) {
    const input = path.join(publicDir, file);
    if (!fs.existsSync(input)) {
      console.log('Not found:', file);
      continue;
    }
    
    const output = path.join(publicDir, path.parse(file).name + '.webp');
    await sharp(input).webp({ quality: 80 }).toFile(output);
    console.log('Converted', file);
  }
}
convert().catch(console.error);
