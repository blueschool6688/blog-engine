import * as child_process from "child_process";
import * as path from "path";
import * as fs from "fs";

interface FieldInfo {
  name: string;
  type: string;
}

interface StructInfo {
  name: string;
  comment: string;
  fields: FieldInfo[];
}

interface InterfaceInfo {
  name: string;
  comment: string;
  methods: string[];
}

interface FunctionInfo {
  name: string;
  signature: string;
  comment: string;
  depends_on?: string[];
}

interface GoFileIndex {
  path: string;
  imports: string[];
  structs: StructInfo[];
  interfaces: InterfaceInfo[];
  functions: FunctionInfo[];
}

interface GoPackageIndex {
  name: string;
  files: GoFileIndex[];
}

interface GoBusinessRule {
  file: string;
  line: number;
  text: string;
}

interface BackendIndex {
  packages: GoPackageIndex[];
  business_rules: GoBusinessRule[];
}

interface TSExportInfo {
  type: string;
  name: string;
  signature?: string;
  comment?: string;
  propsType?: string;
}

interface TSFileIndex {
  path: string;
  imports: string[];
  exports: TSExportInfo[];
}

interface TSBusinessRule {
  file: string;
  line: number;
  text: string;
}

interface FrontendIndex {
  files: TSFileIndex[];
  business_rules: TSBusinessRule[];
}

// Giới hạn độ dài file index (khoảng 60,000 ký tự / ~15,000 tokens)
const MAX_CHAR_LIMIT = 60000;

function main() {
  const rootDir = path.resolve(__dirname, "..");
  const backendDir = path.join(rootDir, "backend");
  const webDir = path.join(rootDir, "web");

  const backendJsonPath = path.join(rootDir, "backend-index.json");
  const frontendJsonPath = path.join(rootDir, "frontend-index.json");
  const outMdPath = path.join(rootDir, ".ai", "codebase-index.md");

  console.log("▶  Running backend Go parser...");
  try {
    child_process.execSync(
      `go run scripts/gen-index/main.go --dir "${rootDir}" --out "${backendJsonPath}"`,
      { cwd: backendDir, stdio: "inherit" }
    );
  } catch (err) {
    console.error("❌  Backend Go parser failed:", err);
    process.exit(1);
  }

  console.log("▶  Running frontend TS parser...");
  try {
    child_process.execSync(
      `node --experimental-strip-types scripts/gen-index.ts --out "${frontendJsonPath}"`,
      { cwd: webDir, stdio: "inherit" }
    );
  } catch (err) {
    console.error("❌  Frontend TS parser failed:", err);
    process.exit(1);
  }

  // Load JSON outputs
  if (!fs.existsSync(backendJsonPath) || !fs.existsSync(frontendJsonPath)) {
    console.error("❌  JSON outputs not found!");
    process.exit(1);
  }

  const backendData: BackendIndex = JSON.parse(fs.readFileSync(backendJsonPath, "utf8"));
  const frontendData: FrontendIndex = JSON.parse(fs.readFileSync(frontendJsonPath, "utf8"));

  // Lấy Git Hash
  let gitHash = "N/A";
  try {
    gitHash = child_process.execSync("git rev-parse --short HEAD", { cwd: rootDir }).toString().trim();
  } catch {}

  // Generate Tree
  const fileList = [
    ...backendData.packages.flatMap(p => p.files.map(f => f.path)),
    ...frontendData.files.map(f => f.path)
  ];
  const treeStr = generateFileTree(fileList);

  // Compile Markdown
  let markdown = buildMarkdown(backendData, frontendData, treeStr, gitHash, false);

  // Truncate logic if length exceeds MAX_CHAR_LIMIT
  if (markdown.length > MAX_CHAR_LIMIT) {
    console.log(`⚠️  Index file exceeds ${MAX_CHAR_LIMIT} chars. Truncating functions details...`);
    markdown = buildMarkdown(backendData, frontendData, treeStr, gitHash, true);
  }

  // Write output
  const aiDir = path.join(rootDir, ".ai");
  if (!fs.existsSync(aiDir)) {
    fs.mkdirSync(aiDir, { recursive: true });
  }

  fs.writeFileSync(outMdPath, markdown, "utf8");
  console.log(`✅  Successfully generated Codebase Index at: ${outMdPath} (${markdown.length} chars)`);

  // Cleanup temporary JSON files
  try {
    fs.unlinkSync(backendJsonPath);
    fs.unlinkSync(frontendJsonPath);
  } catch {}
}

function generateFileTree(files: string[]): string {
  interface TreeNode {
    name: string;
    children: { [key: string]: TreeNode };
    isFile: boolean;
  }

  const root: TreeNode = { name: "root", children: {}, isFile: false };

  for (const f of files) {
    const parts = f.split("/");
    // Hạn chế độ sâu tối đa 3 cấp
    if (parts.length > 4) continue;

    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          children: {},
          isFile: i === parts.length - 1
        };
      }
      current = current.children[part];
    }
  }

  function renderNode(node: TreeNode, indent: string): string {
    let result = "";
    const keys = Object.keys(node.children).sort((a, b) => {
      // Directories first, then files
      const aNode = node.children[a];
      const bNode = node.children[b];
      if (aNode.isFile !== bNode.isFile) {
        return aNode.isFile ? 1 : -1;
      }
      return a.localeCompare(b);
    });

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const child = node.children[key];
      const isLast = i === keys.length - 1;
      const marker = isLast ? "└── " : "├── ";
      result += `${indent}${marker}${child.name}\n`;
      if (!child.isFile) {
        const nextIndent = indent + (isLast ? "    " : "│   ");
        result += renderNode(child, nextIndent);
      }
    }
    return result;
  }

  return "```\n" + renderNode(root, "") + "```";
}

function formatComment(comment: string | undefined): string {
  if (!comment) return "";
  const cleaned = comment.trim().replace(/\r?\n/g, " ");
  if (cleaned.length <= 200) return cleaned;
  // Truncate to the first sentence.
  // Sentences end with . or ! or ? followed by space or end of string.
  const sentenceEndRegex = /([.!?])(\s|$)/;
  const match = cleaned.match(sentenceEndRegex);
  if (match && match.index !== undefined) {
    return cleaned.substring(0, match.index + 1).trim();
  }
  // Fallback if no sentence boundary found
  return cleaned.substring(0, 197) + "...";
}

function buildMarkdown(
  backend: BackendIndex,
  frontend: FrontendIndex,
  treeStr: string,
  gitHash: string,
  truncateFunctions: boolean
): string {
  const lines: string[] = [];

  lines.push("# Codebase Index — Auto-generated, DO NOT EDIT MANUALLY");
  lines.push(`# Generated at: ${new Date().toISOString()}`);
  lines.push(`# Generated from commit: ${gitHash}`);
  lines.push("");
  lines.push("## 1. Directory Tree");
  lines.push(treeStr);
  lines.push("");

  // 2. Backend (Golang)
  lines.push("## 2. Backend (Golang)");
  for (const pkg of backend.packages) {
    lines.push(`### Package: ${pkg.name}`);
    for (const file of pkg.files) {
      lines.push(`#### File: ${file.path}`);
      if (file.imports.length > 0) {
        lines.push(`**Imports:** \`${file.imports.join("`, `")}\``);
      }

      if (file.structs.length > 0) {
        lines.push("**Structs:**");
        for (const s of file.structs) {
          const desc = s.comment ? ` — ${formatComment(s.comment)}` : "";
          lines.push(`- \`${s.name}\`${desc}`);
          if (s.fields.length > 0) {
            const fieldsStr = s.fields.map(f => `${f.name || "[embedded]"}: ${f.type}`).join(", ");
            lines.push(`  - Fields: { ${fieldsStr} }`);
          }
        }
      }

      if (file.interfaces.length > 0) {
        lines.push("**Interfaces:**");
        for (const inf of file.interfaces) {
          const desc = inf.comment ? ` — ${formatComment(inf.comment)}` : "";
          lines.push(`- \`${inf.name}\`${desc}`);
          if (inf.methods.length > 0) {
            lines.push(`  - Methods:`);
            for (const m of inf.methods) {
              lines.push(`    - \`${m}\``);
            }
          }
        }
      }

      if (file.functions.length > 0) {
        if (truncateFunctions) {
          // Truncate: Just list function names
          const names = file.functions.map(f => `\`${f.name}\``).join(", ");
          lines.push(`**Functions (names only):** ${names}`);
        } else {
          lines.push("**Functions:**");
          for (const f of file.functions) {
            const desc = f.comment ? ` — ${formatComment(f.comment)}` : "";
            lines.push(`- \`${f.signature}\`${desc}`);
            if (f.depends_on && f.depends_on.length > 0) {
              lines.push(`  - Depends on: ${f.depends_on.join(", ")}`);
            }
          }
        }
      }
      lines.push("");
    }
  }

  // 3. Frontend (React/TS)
  lines.push("## 3. Frontend (React/TS)");
  for (const file of frontend.files) {
    lines.push(`### File: ${file.path}`);
    if (file.imports.length > 0) {
      lines.push(`**Imports:** \`${file.imports.join("`, `")}\``);
    }

    if (file.exports.length > 0) {
      lines.push("**Exports:**");
      for (const exp of file.exports) {
        const desc = exp.comment ? ` — ${formatComment(exp.comment)}` : "";
        if (exp.type === "component") {
          lines.push(`- Component \`${exp.name}\`${desc}`);
          if (exp.propsType) {
            lines.push(`  - Props: \`${exp.propsType}\``);
          }
        } else if (exp.type === "hook") {
          lines.push(`- Hook \`${exp.signature || exp.name}\`${desc}`);
        } else {
          if (!truncateFunctions || (exp.type !== "function" && exp.type !== "variable")) {
            lines.push(`- ${exp.type} \`${exp.signature || exp.name}\`${desc}`);
          }
        }
      }
    }
    lines.push("");
  }

  // 4. Business Rules
  lines.push("## 4. Business Rules");
  const allRules = [
    ...backend.business_rules.map(r => ({ ...r, origin: "Backend" })),
    ...frontend.business_rules.map(r => ({ ...r, origin: "Frontend" }))
  ];

  if (allRules.length === 0) {
    lines.push("No marked business rules or constraints found.");
  } else {
    for (const rule of allRules) {
      lines.push(`- **RULE:** ${rule.text} (Source: [${rule.file}:${rule.line}](file:///${rule.file}#L${rule.line}))`);
    }
  }
  lines.push("");

  // 5. Dependency Graph
  lines.push("## 5. Dependency Graph (Summary)");
  const depLines: string[] = [];

  // Compute backend deps
  for (const pkg of backend.packages) {
    for (const file of pkg.files) {
      for (const fn of file.functions) {
        if (fn.depends_on) {
          for (const dep of fn.depends_on) {
            // Find which file has this struct/interface
            let depFile = "";
            for (const p2 of backend.packages) {
              for (const f2 of p2.files) {
                const hasStruct = f2.structs.some(s => s.name === dep);
                const hasInterface = f2.interfaces.some(inf => inf.name === dep);
                if (hasStruct || hasInterface) {
                  depFile = f2.path;
                  break;
                }
              }
              if (depFile) break;
            }
            if (depFile && depFile !== file.path) {
              const depLine = `${path.basename(file.path)} → ${path.basename(depFile)} (uses ${dep})`;
              if (!depLines.includes(depLine)) {
                depLines.push(depLine);
              }
            }
          }
        }
      }
    }
  }

  // Limit dependency summary count to keep it concise
  const maxDeps = 15;
  if (depLines.length === 0) {
    lines.push("No file dependencies detected.");
  } else {
    depLines.slice(0, maxDeps).forEach(dl => lines.push(`- ${dl}`));
    if (depLines.length > maxDeps) {
      lines.push(`- ...and ${depLines.length - maxDeps} more dependencies.`);
    }
  }

  return lines.join("\n");
}

main();
