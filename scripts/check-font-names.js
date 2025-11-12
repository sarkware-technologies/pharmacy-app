/**
 * Script to check font PostScript names
 * Run with: node scripts/check-font-names.js
 */

const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, '../assets/fonts');

// Simple TTF parser to extract PostScript name
function getPostScriptName(fontPath) {
  try {
    const buffer = fs.readFileSync(fontPath);
    
    // TTF files have a name table that contains font names
    // This is a simplified parser - for production, use a proper font library
    const nameTableOffset = buffer.readUInt32BE(12);
    let tableOffset = 12;
    
    // Find name table
    for (let i = 0; i < buffer.readUInt16BE(4); i++) {
      const tag = buffer.toString('ascii', tableOffset, tableOffset + 4);
      if (tag === 'name') {
        const nameTablePos = buffer.readUInt32BE(tableOffset + 8);
        // Read name records
        const count = buffer.readUInt16BE(nameTablePos + 2);
        const stringOffset = buffer.readUInt16BE(nameTablePos + 4);
        
        for (let j = 0; j < count; j++) {
          const recordOffset = nameTablePos + 6 + (j * 12);
          const nameID = buffer.readUInt16BE(recordOffset + 6);
          // Name ID 6 is PostScript name
          if (nameID === 6) {
            const length = buffer.readUInt16BE(recordOffset + 8);
            const offset = buffer.readUInt16BE(recordOffset + 10);
            const namePos = nameTablePos + stringOffset + offset;
            return buffer.toString('ascii', namePos, namePos + length);
          }
        }
      }
      tableOffset += 16;
    }
  } catch (e) {
    console.error(`Error reading ${fontPath}:`, e.message);
  }
  return null;
}

console.log('Checking font PostScript names...\n');

const fontFiles = fs.readdirSync(fontsDir).filter(f => f.endsWith('.ttf'));

fontFiles.forEach(file => {
  const fontPath = path.join(fontsDir, file);
  const postScriptName = getPostScriptName(fontPath);
  const fileName = file.replace('.ttf', '');
  
  console.log(`File: ${file}`);
  console.log(`  Filename (without .ttf): ${fileName}`);
  console.log(`  PostScript Name: ${postScriptName || 'Could not read'}`);
  console.log(`  Use in React Native: fontFamily: '${postScriptName || fileName}'`);
  console.log('');
});

console.log('\nNote: Android typically uses the PostScript name, while iOS uses the filename.');
console.log('Try both if one doesn\'t work.');

