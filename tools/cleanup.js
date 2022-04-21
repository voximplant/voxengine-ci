const { resolve, join } = require('path');
const { existsSync } = require('fs');
const { rm, readdir, lstat } = require('fs/promises');

const binPath = resolve(__dirname, '..', 'bin');
const libPath = resolve(__dirname, '..', 'lib');

const fn = async (path) => {
  if (existsSync(path)) {
    const dirents = await readdir(path);
    for (const dirent of dirents) {
      const direntPath = join(path, dirent);
      const stat = await lstat(direntPath);
      if (stat.isDirectory()) {
        await fn(direntPath);
      } else {
        if (stat.isFile() && direntPath.match(/\.js|\.d\.ts$/)) {
          await rm(direntPath);
          console.info(`'${direntPath}' file was removed`);
        }
      }
    }
  }
};

(async () => {
  console.info(`Cleaning up the '.js' and '.d.ts' dist files...`);
  await fn(binPath);
  await fn(libPath);
  console.info(`Cleaning up complete successfully\n`);
})();
