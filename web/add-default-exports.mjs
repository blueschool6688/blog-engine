import fs from "node:fs";
import path from "node:path";

const DIRS_TO_SCAN = [
    path.resolve("./src/pages"),
    path.resolve("./src/layouts"),
    path.resolve("./src/components"),
];

function hasDefaultExport(content) {
    return /export\s+default\s+/.test(content);
}

function findNamedComponentExport(content) {
    const match = content.match(/export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*(:\s*React\.FC[^\=]*)?=\s*\(/);
    return match ? match[1] : null;
}

function run() {
    let updated = 0;
    let skipped = 0;

    for (const dir of DIRS_TO_SCAN) {
        if (!fs.existsSync(dir)) {
            console.log(`(Bỏ qua, không tồn tại: ${dir})`);
            continue;
        }

        const files = fs.readdirSync(dir).filter((f) => f.endsWith(".tsx"));

        for (const file of files) {
            const filePath = path.join(dir, file);
            const content = fs.readFileSync(filePath, "utf-8");

            if (hasDefaultExport(content)) {
                console.log(`⏭  Đã có export default: ${dir}/${file}`);
                skipped++;
                continue;
            }

            const componentName = findNamedComponentExport(content);
            if (!componentName) {
                console.log(`⚠️  Không tìm thấy named component export trong: ${dir}/${file} (kiểm tra tay)`);
                continue;
            }

            const newContent = content.trimEnd() + `\n\nexport default ${componentName};\n`;
            fs.writeFileSync(filePath, newContent, "utf-8");
            console.log(`✅ Đã thêm "export default ${componentName};" vào: ${dir}/${file}`);
            updated++;
        }
    }

    console.log(`\nHoàn tất: ${updated} file cập nhật, ${skipped} file bỏ qua (đã có default export).`);
}

run();