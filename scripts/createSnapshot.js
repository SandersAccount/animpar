import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createSnapshot() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotDir = path.join(__dirname, '..', 'snapshots', `snapshot-${timestamp}`);

  // Create snapshots directory if it doesn't exist
  fs.mkdirSync(path.join(__dirname, '..', 'snapshots'), { recursive: true });

  // Create snapshot directory
  fs.mkdirSync(snapshotDir);

  // Function to copy files recursively
  function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) {
      console.log(`Directory not found: ${src}`);
      return;
    }

    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
      fs.mkdirSync(dest, { recursive: true });
      fs.readdirSync(src).forEach(childItemName => {
        copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  // Copy project files to snapshot directory
  copyRecursive(path.join(__dirname, '..', 'src'), path.join(snapshotDir, 'src'));
  
  // Check if public directory exists before copying
  const publicDir = path.join(__dirname, '..', 'public');
  if (fs.existsSync(publicDir)) {
    copyRecursive(publicDir, path.join(snapshotDir, 'public'));
  } else {
    console.log('Public directory not found, skipping...');
  }

  // Copy other important files
  const filesToCopy = ['package.json', 'tsconfig.json', 'vite.config.ts'];
  filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, '..', file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(snapshotDir, file));
    } else {
      console.log(`File not found: ${file}, skipping...`);
    }
  });

  console.log(`Snapshot created: ${snapshotDir}`);
}

createSnapshot();