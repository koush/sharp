const child_process = require('child_process');
const { once } = require('events');
const path = require('path');

process.env.PREBUILD_VERSION = '0.32.6';

async function spawnBinary(p, args) {
  console.log(p, ...args);
  const cp = child_process.spawn(p, args, {
    stdio: ['pipe', 'inherit', 'inherit']
  })
  const [code] = await once(cp, 'exit');
  if (code)
    throw new Error(`exited with error: ${code}`);
}

async function spawnScript(script, args) {
  return spawnBinary(process.argv0, [path.join(__dirname, script), ...(args || [])]);
}

async function main() {
  try {
    // node install/libvips && node install/dll-copy && prebuild-install)
    await spawnScript('libvips.js');
    await spawnScript('dll-copy.js');
    await spawnScript('../node_modules/@koush/prebuild-install/bin.js', []);
  }
  catch (e) {
    console.warn('prebuild failed:', e);
    // node install/can-compile && node-gyp rebuild && node install/dll-copy
    await spawnScript('can-compile.js');
    await spawnScript('../node_modules/.bin/node-gyp', ['rebuild']);
    await spawnScript('dll-copy.js');
  }
}

main();
