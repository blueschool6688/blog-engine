import os
import shutil
import base64
import tempfile
import subprocess
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse

# 100 MB max upload size
MAX_UPLOAD_BYTES = 100 * 1024 * 1024

app = FastAPI(title="MinerU Parser Service")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mineru_service")

# Try to import magic-pdf layout analysis pipeline
MINERU_AVAILABLE = False
try:
    from magic_pdf.pipe.UNIPipe import UNIPipe
    from magic_pdf.data.data_reader_writer import FileBasedDataWriter
    MINERU_AVAILABLE = True
    logger.info("magic_pdf (MinerU) library loaded successfully.")
except ImportError as e:
    logger.warning(f"magic_pdf library not available: {e}. Using lightweight fallback engine (PyMuPDF + Mammoth).")

# Import lightweight alternatives
try:
    import fitz  # PyMuPDF
    import mammoth
    LIGHTWEIGHT_AVAILABLE = True
    logger.info("Lightweight parsers (PyMuPDF & Mammoth) loaded successfully.")
except ImportError as e:
    LIGHTWEIGHT_AVAILABLE = False
    logger.error(f"Failed to load lightweight fallback libraries: {e}")


@app.get("/")

def read_root():
    return {
        "message": "MinerU Parser Service is running. Access /docs for API documentation.",
        "health": "/health",
        "mineru_available": MINERU_AVAILABLE,
        "lightweight_available": LIGHTWEIGHT_AVAILABLE
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "mineru_available": MINERU_AVAILABLE,
        "lightweight_available": LIGHTWEIGHT_AVAILABLE
    }

def slugify(text: str) -> str:
    import re
    slug = text.lower()
    # Replace non-alphanumeric characters (supporting Latin/Vietnamese accents) with hyphens
    slug = re.sub(r"[^a-z0-9\u00C0-\u024F]+", "-", slug)
    return slug.strip("-")

def linkify_toc_lines(text: str) -> str:
    import re
    lines = text.split("\n")
    processed_lines = []
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            processed_lines.append(line)
            continue
        
        # Pre-filter: Only examine short lines ending with a number (TOC entries)
        # to prevent catastrophic regex backtracking on long body text paragraphs
        if len(stripped) < 150 and stripped[-1].isdigit() and ("." in stripped or "  " in stripped):
            # Match dots and page number at the end of the line
            match = re.search(r"(\s*[\.\s]{4,}\s*)(\d+)$", stripped)
            if match:
                dots_part = match.group(1)
                page_part = match.group(2)
                title = stripped[:match.start(1)].strip()
                # Ensure it is not already a markdown link
                if title and not "[" in title:
                    slug = slugify(title)
                    line = f"[{title}](#{slug}){dots_part}{page_part}"
        processed_lines.append(line)
    return "\n".join(processed_lines)

def promote_headings_to_markdown(text: str) -> str:
    # First linkify any TOC lines in the document
    text = linkify_toc_lines(text)
    
    lines = text.split("\n")
    processed_lines = []
    for line in lines:
        stripped = line.strip()
        # Heuristic: if a line starts with Chapter, Preface, Appendix, Introduction and is short (<100 chars)
        # and doesn't already start with a heading mark (#)
        if stripped and not stripped.startswith("#") and len(stripped) < 100:
            # Exclude Table of Contents rows containing dots or page number link structures
            if "..." in stripped or " . ." in stripped or ". ." in stripped or "](#" in stripped:
                processed_lines.append(line)
                continue
                
            is_heading = False
            # Check standard patterns (Case insensitive)
            import re
            if re.match(r"^(Chapter\s+\d+|Preface|Introduction|Appendix\s+[A-Z]|Contents|Conclusion|Summary)", stripped, re.IGNORECASE):
                is_heading = True
            
            if is_heading:
                line = f"## {stripped}"
                
        processed_lines.append(line)
    return "\n".join(processed_lines)

def parse_docx_light(docx_path, image_dir_path):
    with open(docx_path, "rb") as docx_file:
        # Convert to markdown directly without extracting images to save memory
        result = mammoth.convert_to_markdown(docx_file)
        return promote_headings_to_markdown(result.value)

def parse_pdf_light(pdf_path, image_dir_path):
    logger.info(f"Opening PDF file: {pdf_path}")
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    logger.info(f"PDF opened successfully. Total pages: {total_pages}")
    md_blocks = []

    for page_idx, page in enumerate(doc):
        if page_idx % 10 == 0 or page_idx == total_pages - 1:
            logger.info(f"Extracting text from page {page_idx + 1}/{total_pages}...")
        text = page.get_text("text")
        if text:
            md_blocks.append(text)

    logger.info("PDF text extraction completed. Running heading promoter...")
    full_text = "\n\n".join(md_blocks)
    result = promote_headings_to_markdown(full_text)
    logger.info("Heading promotion completed.")
    return result

@app.post("/parse")
async def parse_file(file: UploadFile = File(...)):
    filename = file.filename
    suffix = os.path.splitext(filename)[1].lower()
    if suffix not in [".pdf", ".docx"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed.")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        input_path = os.path.join(temp_dir, filename)
        logger.info(f"Saving uploaded file to {input_path}")
        
        # Read file in chunks to support large files without OOM
        total_bytes = 0
        with open(input_path, "wb") as f:
            while True:
                chunk = await file.read(1024 * 1024)  # 1MB chunks
                if not chunk:
                    break
                total_bytes += len(chunk)
                if total_bytes > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File too large. Maximum allowed size is {MAX_UPLOAD_BYTES // (1024*1024)}MB."
                    )
                f.write(chunk)
        logger.info(f"File saved: {filename} ({total_bytes / 1024 / 1024:.2f} MB)")

        image_dir_name = "images"
        image_dir_path = os.path.join(temp_dir, image_dir_name)
        os.makedirs(image_dir_path, exist_ok=True)

        markdown_content = ""

        # Check engine mode
        if not MINERU_AVAILABLE:
            logger.info("MinerU not available. Running lightweight fallback engine...")
            if not LIGHTWEIGHT_AVAILABLE:
                raise HTTPException(status_code=500, detail="No parsing engines are available on the server.")
            
            try:
                if suffix == ".docx":
                    markdown_content = parse_docx_light(input_path, image_dir_path)
                else:
                    markdown_content = parse_pdf_light(input_path, image_dir_path)
            except Exception as e:
                logger.error(f"Lightweight parser failed: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")

        else:
            # Run heavy MinerU pipeline
            pdf_path = input_path
            
            # If it's docx, convert to PDF via LibreOffice headless
            if suffix == ".docx":
                logger.info("Converting DOCX to PDF via LibreOffice...")
                try:
                    cmd = ["libreoffice", "--headless", "--convert-to", "pdf", "--outdir", temp_dir, input_path]
                    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
                    logger.info(f"LibreOffice stdout: {result.stdout}")
                    
                    pdf_filename = os.path.splitext(filename)[0] + ".pdf"
                    pdf_path = os.path.join(temp_dir, pdf_filename)
                    if not os.path.exists(pdf_path):
                        raise HTTPException(status_code=500, detail="LibreOffice conversion failed to produce PDF output.")
                except Exception as e:
                    logger.error(f"LibreOffice exception: {str(e)}")
                    raise HTTPException(status_code=500, detail=f"Failed to run LibreOffice: {str(e)}")

            try:
                logger.info(f"Starting MinerU parse on {pdf_path}")
                with open(pdf_path, "rb") as f:
                    pdf_bytes = f.read()
                
                jso_useful_key = {"_pdf_type": "", "model_list": []}
                image_writer = FileBasedDataWriter(image_dir_path)
                
                pipe = UNIPipe(pdf_bytes, jso_useful_key, image_writer)
                pipe.pipe_classify()
                pipe.pipe_analyze()
                pipe.pipe_parse()
                
                markdown_content = pipe.pipe_mk_markdown(image_dir_name, drop_mode="none")
            except Exception as e:
                logger.error(f"MinerU parsing failed: {str(e)}")
                raise HTTPException(status_code=500, detail=f"MinerU parsing failed: {str(e)}")

        # Read and encode extracted images (works for both MinerU and Lightweight parser)
        images_payload = []
        if os.path.exists(image_dir_path):
            for img_name in os.listdir(image_dir_path):
                img_path = os.path.join(image_dir_path, img_name)
                if os.path.isfile(img_path) and img_name.lower().endswith((".png", ".jpg", ".jpeg", ".gif")):
                    with open(img_path, "rb") as img_file:
                        encoded_img = base64.b64encode(img_file.read()).decode("utf-8")
                        images_payload.append({
                            "name": img_name,
                            "content": encoded_img
                        })
        
        logger.info(f"Returning parsed Markdown and {len(images_payload)} images.")
        return {
            "markdown": markdown_content,
            "images": images_payload
        }
