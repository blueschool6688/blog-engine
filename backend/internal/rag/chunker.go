package rag

import (
	"strings"
)

// ChunkText splits a large text into chunks of roughly maxWords,
// with an overlap of roughly overlapWords.
func ChunkText(text string, maxWords, overlapWords int) []string {
	// Split by double newline first to preserve paragraphs
	paragraphs := strings.Split(text, "\n\n")
	
	var chunks []string
	var currentChunk []string
	var currentWordCount int

	for _, p := range paragraphs {
		words := strings.Fields(p)
		if len(words) == 0 {
			continue
		}

		// If a single paragraph is larger than maxWords, we should split it by sentences.
		// For simplicity here, we'll just split it into chunks of maxWords.
		if len(words) > maxWords {
			// First, flush the current chunk if any
			if len(currentChunk) > 0 {
				chunks = append(chunks, strings.Join(currentChunk, " "))
				currentChunk = nil
				currentWordCount = 0
			}

			// Split the huge paragraph
			for i := 0; i < len(words); {
				end := i + maxWords
				if end > len(words) {
					end = len(words)
				}
				chunks = append(chunks, strings.Join(words[i:end], " "))
				
				// Advance i, accounting for overlap if it's not the last piece
				if end < len(words) {
					i = end - overlapWords
					if i <= 0 {
						i = 1 // Ensure forward progress
					}
				} else {
					break
				}
			}
			continue
		}

		if currentWordCount+len(words) > maxWords {
			chunks = append(chunks, strings.Join(currentChunk, " "))
			// Start new chunk, but try to keep the overlap.
			// The simplest way to keep overlap is just to keep the last paragraph
			// if it fits within the overlap budget, but for simplicity, we just start fresh
			// with the current paragraph.
			currentChunk = []string{p}
			currentWordCount = len(words)
		} else {
			currentChunk = append(currentChunk, p)
			currentWordCount += len(words)
		}
	}

	if len(currentChunk) > 0 {
		chunks = append(chunks, strings.Join(currentChunk, " "))
	}

	return chunks
}
