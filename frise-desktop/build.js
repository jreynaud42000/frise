const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

// Build outside OneDrive: syncing ~300 MB of intermediate files slows everything down
// and makes rcedit fail intermittently ("Unable to commit changes").
const outDir = path.join(process.env.LOCALAPPDATA || os.tmpdir(), 'frise-chronologique-build');
const releaseDir = path.join(__dirname, 'release');

// index.html is the single source of truth; the standalone web version is a copy of it.
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(__dirname, '..', 'frise.html'));

fs.rmSync(outDir, { recursive: true, force: true });
const builder = path.join(__dirname, 'node_modules', '.bin', process.platform === 'win32' ? 'electron-builder.cmd' : 'electron-builder');
const res = spawnSync(`"${builder}" --win "--config.directories.output=${outDir}"`, { stdio: 'inherit', shell: true });
if (res.status !== 0) process.exit(res.status || 1);

fs.rmSync(releaseDir, { recursive: true, force: true });
fs.mkdirSync(releaseDir);
for (const f of fs.readdirSync(outDir).filter(f => f.endsWith('.exe'))) {
  fs.copyFileSync(path.join(outDir, f), path.join(releaseDir, f));
  console.log('->', path.join('release', f));
}
