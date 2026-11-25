import fs from "node:fs";
import path from "node:path";

const LFS_HEADER = "version https://git-lfs.github.com/spec/v1";
const REPO_RAW_BASE =
  "https://media.githubusercontent.com/media/harshmaha070-ui/portfolio-2/main/public/models";
const TARGET_DIR = path.resolve("dist/models");

function isGlbBinary(buf) {
  return (
    buf.length >= 4 &&
    buf[0] === 0x67 &&
    buf[1] === 0x6c &&
    buf[2] === 0x54 &&
    buf[3] === 0x46
  );
}

async function resolveLfsFiles() {
  if (!fs.existsSync(TARGET_DIR)) {
    return;
  }

  const entries = fs.readdirSync(TARGET_DIR);
  for (const file of entries) {
    if (!file.endsWith(".glb")) continue;

    const fullPath = path.join(TARGET_DIR, file);
    const stat = fs.statSync(fullPath);

    // Git LFS pointers are tiny text files (~130 bytes)
    if (stat.size < 1024) {
      const text = fs.readFileSync(fullPath, "utf8");
      if (text.startsWith(LFS_HEADER)) {
        const remoteUrl = `${REPO_RAW_BASE}/${encodeURIComponent(file)}`;
        console.log(`[resolve-lfs] Resolving LFS pointer for ${file} from ${remoteUrl}...`);
        try {
          const res = await fetch(remoteUrl);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status} ${res.statusText}`);
          }
          const buf = Buffer.from(await res.arrayBuffer());
          if (!isGlbBinary(buf)) {
            throw new Error(`Downloaded ${file} is not a valid binary glTF file`);
          }
          fs.writeFileSync(fullPath, buf);
          console.log(`[resolve-lfs] Resolved ${file} (${buf.length} bytes).`);
        } catch (err) {
          console.warn(`[resolve-lfs] Warning: failed to resolve ${file}:`, err.message);
        }
      }
    }
  }
}

resolveLfsFiles();
