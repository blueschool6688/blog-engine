package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"strings"
	"unicode"
)

// Structural models for Go Index JSON output
type FieldInfo struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type StructInfo struct {
	Name    string      `json:"name"`
	Comment string      `json:"comment"`
	Fields  []FieldInfo `json:"fields"`
}

type InterfaceInfo struct {
	Name    string   `json:"name"`
	Comment string   `json:"comment"`
	Methods []string `json:"methods"`
}

type FunctionInfo struct {
	Name      string   `json:"name"`
	Signature string   `json:"signature"`
	Comment   string   `json:"comment"`
	DependsOn []string `json:"depends_on"`
}

type FileIndex struct {
	Path       string          `json:"path"`
	Imports    []string        `json:"imports"`
	Structs    []StructInfo    `json:"structs"`
	Interfaces []InterfaceInfo `json:"interfaces"`
	Functions  []FunctionInfo  `json:"functions"`
}

type PackageIndex struct {
	Name  string      `json:"name"`
	Files []FileIndex `json:"files"`
}

type BusinessRule struct {
	File string `json:"file"`
	Line int    `json:"line"`
	Text string `json:"text"`
}

type BackendIndex struct {
	Packages      []PackageIndex `json:"packages"`
	BusinessRules []BusinessRule `json:"business_rules"`
}

func main() {
	rootDir := flag.String("dir", ".", "Root directory to scan (default to current)")
	outPath := flag.String("out", "", "Output file path (default prints to stdout)")
	flag.Parse()

	absRoot, err := filepath.Abs(*rootDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error resolving absolute path: %v\n", err)
		os.Exit(1)
	}

	index, err := scanBackend(absRoot)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error scanning backend: %v\n", err)
		os.Exit(1)
	}

	bytes, err := json.MarshalIndent(index, "", "  ")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error marshaling JSON: %v\n", err)
		os.Exit(1)
	}

	if *outPath != "" {
		err = os.WriteFile(*outPath, bytes, 0644)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error writing output file: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Successfully generated Go codebase index at: %s\n", *outPath)
	} else {
		fmt.Println(string(bytes))
	}
}

func scanBackend(absRoot string) (*BackendIndex, error) {
	index := &BackendIndex{
		Packages:      []PackageIndex{},
		BusinessRules: []BusinessRule{},
	}

	// We scan only the "backend" directory if it exists, or the target directory.
	targetDir := absRoot
	if _, err := os.Stat(filepath.Join(absRoot, "backend")); err == nil {
		targetDir = filepath.Join(absRoot, "backend")
	}

	fset := token.NewFileSet()
	packages := make(map[string]*PackageIndex)

	err := filepath.Walk(targetDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories that are vendor, scripts, tests, hidden or build artifacts
		if info.IsDir() {
			name := info.Name()
			if name == "vendor" || name == "scripts" || name == "tmp" || name == ".git" || name == "storages" || strings.HasPrefix(name, ".") {
				return filepath.SkipDir
			}
			return nil
		}

		// Skip non-go files and test files
		if !strings.HasSuffix(path, ".go") || strings.HasSuffix(path, "_test.go") {
			return nil
		}

		// Parse the Go file
		fileAST, err := parser.ParseFile(fset, path, nil, parser.ParseComments)
		if err != nil {
			// Print warning and continue rather than breaking execution
			fmt.Fprintf(os.Stderr, "Warning: failed to parse %s: %v\n", path, err)
			return nil
		}

		// Get relative path from workspace root
		relPath, _ := filepath.Rel(absRoot, path)
		relPath = filepath.ToSlash(relPath)

		// Parse package info
		pkgName := fileAST.Name.Name
		pkg, exists := packages[pkgName]
		if !exists {
			pkg = &PackageIndex{Name: pkgName, Files: []FileIndex{}}
			packages[pkgName] = pkg
		}

		fileIdx := FileIndex{
			Path:       relPath,
			Imports:    []string{},
			Structs:    []StructInfo{},
			Interfaces: []InterfaceInfo{},
			Functions:  []FunctionInfo{},
		}

		// Parse imports
		for _, imp := range fileAST.Imports {
			if imp.Path != nil {
				val := strings.Trim(imp.Path.Value, `"`)
				fileIdx.Imports = append(fileIdx.Imports, val)
			}
		}

		// Collect structures/interfaces to detect dependencies inside functions
		localTypes := make(map[string]bool)

		// First pass: find structures and interfaces
		for _, decl := range fileAST.Decls {
			genDecl, ok := decl.(*ast.GenDecl)
			if !ok || genDecl.Tok != token.TYPE {
				continue
			}

			for _, spec := range genDecl.Specs {
				typeSpec, ok := spec.(*ast.TypeSpec)
				if !ok {
					continue
				}

				name := typeSpec.Name.Name
				// Only index exported (public) types
				if !isExported(name) {
					continue
				}

				localTypes[name] = true

				comment := getCommentText(typeSpec.Doc)
				if comment == "" {
					comment = getCommentText(genDecl.Doc)
				}

				switch t := typeSpec.Type.(type) {
				case *ast.StructType:
					structInfo := StructInfo{
						Name:    name,
						Comment: comment,
						Fields:  []FieldInfo{},
					}
					if t.Fields != nil {
						for _, f := range t.Fields.List {
							fieldType := exprToString(f.Type)
							if len(f.Names) == 0 {
								// Embedded field
								structInfo.Fields = append(structInfo.Fields, FieldInfo{
									Name: "",
									Type: fieldType,
								})
							} else {
								for _, fn := range f.Names {
									structInfo.Fields = append(structInfo.Fields, FieldInfo{
										Name: fn.Name,
										Type: fieldType,
									})
								}
							}
						}
					}
					fileIdx.Structs = append(fileIdx.Structs, structInfo)

				case *ast.InterfaceType:
					interInfo := InterfaceInfo{
						Name:    name,
						Comment: comment,
						Methods: []string{},
					}
					if t.Methods != nil {
						for _, m := range t.Methods.List {
							methodSig := exprToString(m.Type)
							if len(m.Names) > 0 {
								methodSig = m.Names[0].Name + methodSig
							}
							interInfo.Methods = append(interInfo.Methods, methodSig)
						}
					}
					fileIdx.Interfaces = append(fileIdx.Interfaces, interInfo)
				}
			}
		}

		// Second pass: Parse functions & methods
		for _, decl := range fileAST.Decls {
			funcDecl, ok := decl.(*ast.FuncDecl)
			if !ok {
				continue
			}

			funcName := funcDecl.Name.Name
			// Only index public (exported) functions
			if !isExported(funcName) {
				continue
			}

			// Format function signature
			var params []string
			if funcDecl.Type.Params != nil {
				for _, p := range funcDecl.Type.Params.List {
					pType := exprToString(p.Type)
					if len(p.Names) == 0 {
						params = append(params, pType)
					} else {
						for _, pn := range p.Names {
							params = append(params, pn.Name+" "+pType)
						}
					}
				}
			}

			var results []string
			if funcDecl.Type.Results != nil {
				for _, r := range funcDecl.Type.Results.List {
					rType := exprToString(r.Type)
					if len(r.Names) == 0 {
						results = append(results, rType)
					} else {
						for _, rn := range r.Names {
							results = append(results, rn.Name+" "+rType)
						}
					}
				}
			}

			sig := funcName + "(" + strings.Join(params, ", ") + ")"
			if len(results) > 0 {
				if len(results) == 1 && !strings.Contains(results[0], " ") {
					sig += " " + results[0]
				} else {
					sig += " (" + strings.Join(results, ", ") + ")"
				}
			}

			// Add receiver details if it's a method
			if funcDecl.Recv != nil && len(funcDecl.Recv.List) > 0 {
				recv := funcDecl.Recv.List[0]
				recvType := exprToString(recv.Type)
				recvName := ""
				if len(recv.Names) > 0 {
					recvName = recv.Names[0].Name + " "
				}
				sig = fmt.Sprintf("(%s%s) %s", recvName, recvType, sig)
			}

			// Detect dependencies (types mentioned in the function AST)
			dependsOnMap := make(map[string]bool)
			ast.Inspect(funcDecl, func(n ast.Node) bool {
				ident, ok := n.(*ast.Ident)
				if ok {
					// If the type is local or looks like an exported type, count it
					if isExported(ident.Name) {
						dependsOnMap[ident.Name] = true
					}
				}
				return true
			})

			// Convert map to slice, excluding the function name itself
			dependsOn := []string{}
			for dep := range dependsOnMap {
				if dep != funcName {
					dependsOn = append(dependsOn, dep)
				}
			}

			funcInfo := FunctionInfo{
				Name:      funcName,
				Signature: sig,
				Comment:   getCommentText(funcDecl.Doc),
				DependsOn: dependsOn,
			}
			fileIdx.Functions = append(fileIdx.Functions, funcInfo)
		}

		// If the file has structs, interfaces, or functions, add it to index
		if len(fileIdx.Structs) > 0 || len(fileIdx.Interfaces) > 0 || len(fileIdx.Functions) > 0 {
			pkg.Files = append(pkg.Files, fileIdx)
		}

		// Collect Business Rules / Rules comments
		for _, commentGroup := range fileAST.Comments {
			for _, comment := range commentGroup.List {
				text := comment.Text
				var cleanText string
				isRule := false

				if strings.HasPrefix(text, "//") {
					cleanText = strings.TrimSpace(strings.TrimPrefix(text, "//"))
				} else if strings.HasPrefix(text, "/*") {
					cleanText = strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(text, "/*"), "*/"))
				}

				lines := strings.Split(cleanText, "\n")
				for _, line := range lines {
					line = strings.TrimSpace(line)
					upper := strings.ToUpper(line)
					if strings.HasPrefix(upper, "BUSINESS:") {
						isRule = true
						cleanText = strings.TrimSpace(line[9:])
					} else if strings.HasPrefix(upper, "RULE:") {
						isRule = true
						cleanText = strings.TrimSpace(line[5:])
					}

					if isRule {
						pos := fset.Position(comment.Pos())
						index.BusinessRules = append(index.BusinessRules, BusinessRule{
							File: relPath,
							Line: pos.Line,
							Text: cleanText,
						})
					}
				}
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Add packages to final index list
	for _, pkg := range packages {
		if len(pkg.Files) > 0 {
			index.Packages = append(index.Packages, *pkg)
		}
	}

	return index, nil
}

func isExported(name string) bool {
	if len(name) == 0 {
		return false
	}
	runes := []rune(name)
	return unicode.IsUpper(runes[0])
}

func getCommentText(cg *ast.CommentGroup) string {
	if cg == nil {
		return ""
	}
	return strings.TrimSpace(cg.Text())
}

// exprToString converts AST type expression to string representation
func exprToString(expr ast.Expr) string {
	switch t := expr.(type) {
	case *ast.Ident:
		return t.Name
	case *ast.SelectorExpr:
		return exprToString(t.X) + "." + t.Sel.Name
	case *ast.StarExpr:
		return "*" + exprToString(t.X)
	case *ast.ArrayType:
		if t.Len == nil {
			return "[]" + exprToString(t.Elt)
		}
		return "[" + exprToString(t.Len) + "]" + exprToString(t.Elt)
	case *ast.MapType:
		return "map[" + exprToString(t.Key) + "]" + exprToString(t.Value)
	case *ast.InterfaceType:
		return "interface{}"
	case *ast.FuncType:
		// Simple representation for functions inside fields
		return "func(...)"
	case *ast.Ellipsis:
		return "..." + exprToString(t.Elt)
	case *ast.ChanType:
		return "chan " + exprToString(t.Value)
	default:
		return fmt.Sprintf("%T", expr)
	}
}
