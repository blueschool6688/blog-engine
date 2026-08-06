#!/bin/bash
# Start script for MinerU Parser Service in WSL2
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

LIGHT_MODE=false
if [ "$1" == "--light" ]; then
    LIGHT_MODE=true
    echo "Starting in LIGHTWEIGHT mode. MinerU AI models will not be installed."
fi

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing requirements..."
pip install -r requirements.txt

if [ "$LIGHT_MODE" = false ]; then
    # Check if magic-pdf is installed, if not try to install mineru[pipeline]
    python3 -c "import magic_pdf" >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "magic-pdf not found. Installing mineru[pipeline] (this might take a while and consumes ~3GB disk)..."
        pip install "mineru[pipeline]"
    fi
fi

# Run the FastAPI app
echo "Starting FastAPI server on http://0.0.0.0:8082..."
exec uvicorn app:app --host 0.0.0.0 --port 8082 --log-level info

