#!/bin/sh

# Check if air is installed
if ! command -v air >/dev/null 2>&1; then
    echo "Air is not installed or not in PATH."
    echo "Installing Air via 'go install github.com/air-verse/air@latest'..."
    go install github.com/air-verse/air@latest
    
    # Try adding GOPATH/bin to PATH
    GOPATH=$(go env GOPATH)
    export PATH="$PATH:$GOPATH/bin"
    
    if ! command -v air >/dev/null 2>&1; then
        echo "Error: air could not be installed or added to PATH."
        echo "Please install it manually: go install github.com/air-verse/air@latest"
        exit 1
    fi
fi

echo "Starting application with Air hot reload..."
air -c .air.toml
