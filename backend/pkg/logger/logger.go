package logger

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type Logger struct {
	infoLog     *log.Logger
	errorLog    *log.Logger
	isJSON      bool
	infoWriter  io.Writer
	errorWriter io.Writer
}

type JSONLogEntry struct {
	Time    string                 `json:"time"`
	Level   string                 `json:"level"`
	Message string                 `json:"msg"`
	Context map[string]interface{} `json:"context,omitempty"`
}

func New() *Logger {
	infoWriter := io.Writer(os.Stdout)
	errorWriter := io.Writer(os.Stderr)

	logDir := "./storages/logs"
	// Ensure log directory exists
	if err := os.MkdirAll(logDir, 0755); err == nil {
		logFile, err := os.OpenFile(filepath.Join(logDir, "app.log"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err == nil {
			infoWriter = io.MultiWriter(os.Stdout, logFile)
			errorWriter = io.MultiWriter(os.Stderr, logFile)
		}
	}

	isJSON := os.Getenv("LOG_FORMAT") == "json"

	return &Logger{
		infoLog:     log.New(infoWriter, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile),
		errorLog:    log.New(errorWriter, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile),
		isJSON:      isJSON,
		infoWriter:  infoWriter,
		errorWriter: errorWriter,
	}
}

func (l *Logger) writeJSON(w io.Writer, level, msg string, ctx map[string]interface{}) {
	entry := JSONLogEntry{
		Time:    time.Now().Format(time.RFC3339),
		Level:   level,
		Message: strings.TrimSuffix(msg, "\n"),
		Context: ctx,
	}
	bytes, err := json.Marshal(entry)
	if err == nil {
		_, _ = w.Write(append(bytes, '\n'))
	}
}

func (l *Logger) Info(format string, v ...interface{}) {
	msg := fmt.Sprintf(format, v...)
	if l.isJSON {
		l.writeJSON(l.infoWriter, "info", msg, nil)
	} else {
		// Output with call depth 2 to preserve line info
		_ = l.infoLog.Output(2, msg)
	}
}

func (l *Logger) Error(format string, v ...interface{}) {
	msg := fmt.Sprintf(format, v...)
	if l.isJSON {
		l.writeJSON(l.errorWriter, "error", msg, nil)
	} else {
		_ = l.errorLog.Output(2, msg)
	}
}

func (l *Logger) InfoCtx(ctx map[string]interface{}, format string, v ...interface{}) {
	msg := fmt.Sprintf(format, v...)
	if l.isJSON {
		l.writeJSON(l.infoWriter, "info", msg, ctx)
	} else {
		_ = l.infoLog.Output(2, fmt.Sprintf("%s | Context: %v", msg, ctx))
	}
}

func (l *Logger) ErrorCtx(ctx map[string]interface{}, format string, v ...interface{}) {
	msg := fmt.Sprintf(format, v...)
	if l.isJSON {
		l.writeJSON(l.errorWriter, "error", msg, ctx)
	} else {
		_ = l.errorLog.Output(2, fmt.Sprintf("%s | Context: %v", msg, ctx))
	}
}
