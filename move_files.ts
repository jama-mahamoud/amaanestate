import fs from 'fs';
import path from 'path';

function moveFiles(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    if (fs.statSync(srcPath).isDirectory()) {
      moveFiles(srcPath, destPath);
    } else {
      fs.renameSync(srcPath, destPath);
    }
  }
}

moveFiles('components', 'src/components');
fs.rmSync('components', { recursive: true, force: true });
// also delete lib since we moved utils.ts
fs.rmSync('lib', { recursive: true, force: true });
