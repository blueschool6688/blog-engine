import tsmorph from "ts-morph";
const { Project, SyntaxKind } = tsmorph;
import type { ExportedDeclarations } from "ts-morph";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ExportInfo {
  type: string;
  name: string;
  signature?: string;
  comment?: string;
  propsType?: string;
}

interface FileIndex {
  path: string;
  imports: string[];
  exports: ExportInfo[];
}

interface BusinessRule {
  file: string;
  line: number;
  text: string;
}

interface FrontendIndex {
  files: FileIndex[];
  business_rules: BusinessRule[];
}

function main() {
  const args = process.argv.slice(2);
  const outArgIdx = args.indexOf("--out");
  const outPath = outArgIdx !== -1 ? args[outArgIdx + 1] : undefined;

  const projectRoot = path.resolve(__dirname, "..");
  const srcDir = path.join(projectRoot, "src");

  const project = new Project({
    compilerOptions: {
      allowJs: true,
    },
  });

  // Recursively add TS/TSX files
  project.addSourceFilesAtPaths([
    path.join(srcDir, "/**/*.ts"),
    path.join(srcDir, "/**/*.tsx"),
    "!" + path.join(srcDir, "/**/*.test.ts"),
    "!" + path.join(srcDir, "/**/*.test.tsx"),
    "!" + path.join(srcDir, "/**/*.stories.tsx"),
  ]);

  const index: FrontendIndex = {
    files: [],
    business_rules: [],
  };

  const workspaceRoot = path.resolve(projectRoot, "..");

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    const relPath = path.relative(workspaceRoot, filePath).replace(/\\/g, "/");

    const fileIdx: FileIndex = {
      path: relPath,
      imports: [],
      exports: [],
    };

    // Extract Imports
    for (const importDecl of sourceFile.getImportDeclarations()) {
      const moduleSpec = importDecl.getModuleSpecifierValue();
      // Only keep internal project imports (starts with '.' or '..')
      if (moduleSpec.startsWith(".") || moduleSpec.startsWith("src/")) {
        fileIdx.imports.push(moduleSpec);
      }
    }

    // Extract Exports
    const exportedDeclarations = sourceFile.getExportedDeclarations();
    for (const [name, decls] of exportedDeclarations.entries()) {
      for (const decl of decls) {
        const comment = getComment(decl);
        let expType = "unknown";
        let signature = "";
        let propsType = "";

        if (decl.isKind(SyntaxKind.FunctionDeclaration)) {
          expType = name.startsWith("use") ? "hook" : "function";
          signature = decl.getSignature().getDeclaration().getText().split("{")[0].trim();
        } else if (decl.isKind(SyntaxKind.VariableDeclaration)) {
          // Detect Arrow Function / Functional Component
          const initializer = decl.getInitializer();
          if (initializer && (initializer.isKind(SyntaxKind.ArrowFunction) || initializer.isKind(SyntaxKind.FunctionExpression))) {
            expType = name.startsWith("use") ? "hook" : "component";
            const params = initializer.getParameters().map(p => p.getText()).join(", ");
            signature = `${name}(${params})`;

            // Try to find Props Type/Interface
            const firstParam = initializer.getParameters()[0];
            if (firstParam) {
              const typeNode = firstParam.getTypeNode();
              if (typeNode) {
                propsType = typeNode.getText();
              }
            }
          } else {
            expType = "variable";
            signature = `const ${name}`;
          }
        } else if (decl.isKind(SyntaxKind.InterfaceDeclaration)) {
          expType = "interface";
          signature = `interface ${name}`;
        } else if (decl.isKind(SyntaxKind.TypeAliasDeclaration)) {
          expType = "type";
          signature = `type ${name}`;
        } else if (decl.isKind(SyntaxKind.ClassDeclaration)) {
          expType = "class";
          signature = `class ${name}`;
        }

        fileIdx.exports.push({
          type: expType,
          name,
          signature,
          comment,
          propsType: propsType || undefined,
        });
      }
    }

    // Scan for // BUSINESS: or // RULE: comments in the file text
    const commentNodes = [
      ...sourceFile.getDescendantsOfKind(SyntaxKind.SingleLineCommentTrivia),
      ...sourceFile.getDescendantsOfKind(SyntaxKind.MultiLineCommentTrivia)
    ];
    for (const commentNode of commentNodes) {
      const commentText = commentNode.getText();
      const pos = sourceFile.getLineAndColumnAtPos(commentNode.getStart());
      let cleanText = "";
      let isRule = false;

      if (commentText.startsWith("//")) {
        cleanText = commentText.replace(/^\/\/+/, "").trim();
      } else if (commentText.startsWith("/*")) {
        cleanText = commentText.replace(/^\/\*+/, "").replace(/\*+\/$/, "").trim();
      }

      const lines = cleanText.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        const upper = trimmed.toUpperCase();
        if (upper.startsWith("BUSINESS:")) {
          isRule = true;
          cleanText = trimmed.substring(9).trim();
        } else if (upper.startsWith("RULE:")) {
          isRule = true;
          cleanText = trimmed.substring(5).trim();
        }

        if (isRule) {
          index.business_rules.push({
            file: relPath,
            line: pos.line,
            text: cleanText,
          });
        }
      }
    }

    if (fileIdx.exports.length > 0) {
      index.files.push(fileIdx);
    }
  }

  const jsonStr = JSON.stringify(index, null, 2);

  if (outPath) {
    fs.writeFileSync(outPath, jsonStr, "utf8");
    console.error(`Successfully generated Frontend index JSON at: ${outPath}`);
  } else {
    console.log(jsonStr);
  }
}

function getComment(decl: ExportedDeclarations): string {
  // Try to get JSdoc comments
  if (
    decl.isKind(SyntaxKind.FunctionDeclaration) ||
    decl.isKind(SyntaxKind.ClassDeclaration) ||
    decl.isKind(SyntaxKind.InterfaceDeclaration) ||
    decl.isKind(SyntaxKind.TypeAliasDeclaration)
  ) {
    const jsDocs = decl.getJsDocs();
    if (jsDocs.length > 0) {
      return jsDocs.map(j => j.getDescription().trim()).join("\n");
    }
  } else if (decl.isKind(SyntaxKind.VariableDeclaration)) {
    const statement = decl.getVariableStatement();
    if (statement) {
      const jsDocs = statement.getJsDocs();
      if (jsDocs.length > 0) {
        return jsDocs.map(j => j.getDescription().trim()).join("\n");
      }
    }
  }
  return "";
}

main();
