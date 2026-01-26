const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const optimizeImage = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const outputPath = filePath;

  try {
    if (ext === '.jpg' || ext === '.jpeg') {
      await sharp(filePath)
        .resize(1920, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality: 80, progressive: true })
        .toFile(outputPath + '.tmp');
      
      fs.renameSync(outputPath + '.tmp', outputPath);
      console.log(`✅ Optimized: ${filePath}`);
    } else if (ext === '.png') {
      await sharp(filePath)
        .resize(1920, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .png({ quality: 80, progressive: true })
        .toFile(outputPath + '.tmp');
      
      fs.renameSync(outputPath + '.tmp', outputPath);
      console.log(`✅ Optimized: ${filePath}`);
    }
  } catch (err) {
    console.error(`❌ Error optimizing ${filePath}:`, err);
  }
};

const optimizeDirectory = async (dir) => {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      await optimizeDirectory(fullPath);
    } else if (file.isFile() && /\.(jpg|jpeg|png)$/i.test(file.name)) {
      await optimizeImage(fullPath);
    }
  }
};

console.log('🚀 Starting image optimization...');
optimizeDirectory('public/images').then(() => {
  console.log('✅ All images optimized!');
}).catch(err => {
  console.error('❌ Error:', err);
});
