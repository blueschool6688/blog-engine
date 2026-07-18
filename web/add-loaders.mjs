import fs from "node:fs";
import path from "node:path";

const PAGES_DIR = path.resolve("./src/pages");
const LOADER_SNIPPET = `export async function loader() {\n  return null;\n}\n\n`;

function hasLoader(content) {
    return /export\s+(async\s+)?function\s+loader\s*\(/.test(content) ||
        /export\s+const\s+loader\s*=/.test(content);
}

function insertLoader(content) {
    const lines = content.split("\n");
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (/^import .+ from ['"].+['"];?$/.test(lines[i].trim())) {
            lastImportIndex = i;
        }
    }
    if (lastImportIndex === -1) {
        return LOADER_SNIPPET + content;
    }
    lines.splice(lastImportIndex + 1, 0, "", LOADER_SNIPPET.trimEnd());
    return lines.join("\n");
}

function run() {
    if (!fs.existsSync(PAGES_DIR)) {
        console.error(`Không tìm thấy thư mục: ${PAGES_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith(".tsx"));
    let updated = 0, skipped = 0;

    for (const file of files) {
        const filePath = path.join(PAGES_DIR, file);
        const content = fs.readFileSync(filePath, "utf-8");

        if (hasLoader(content)) {
            console.log(`⏭  Bỏ qua (đã có loader): ${file}`);
            skipped++;
            continue;
        }

        fs.writeFileSync(filePath, insertLoader(content), "utf-8");
        console.log(`✅ Đã thêm loader: ${file}`);
        updated++;
    }

    console.log(`\nHoàn tất: ${updated} file cập nhật, ${skipped} file bỏ qua.`);
}

run();