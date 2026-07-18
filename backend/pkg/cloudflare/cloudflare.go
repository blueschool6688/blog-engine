package cloudflare

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type PurgeRequest struct {
	Files []string `json:"files"`
}

// PurgeCacheAsync triggers a Cloudflare cache purge request in a non-blocking goroutine.
func PurgeCacheAsync(zoneID, apiToken string, urls []string) {
	if zoneID == "" || apiToken == "" || len(urls) == 0 {
		return
	}

	go func() {
		reqBody := PurgeRequest{Files: urls}
		bodyBytes, err := json.Marshal(reqBody)
		if err != nil {
			fmt.Printf("[Cloudflare Purge Error] Marshal request body: %v\n", err)
			return
		}

		apiUrl := fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%s/purge_cache", zoneID)
		req, err := http.NewRequest("POST", apiUrl, bytes.NewBuffer(bodyBytes))
		if err != nil {
			fmt.Printf("[Cloudflare Purge Error] Construct request: %v\n", err)
			return
		}

		req.Header.Set("Authorization", "Bearer "+apiToken)
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{Timeout: 10 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			fmt.Printf("[Cloudflare Purge Error] Send request: %v\n", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			fmt.Printf("[Cloudflare Purge Warning] API returned non-OK status: %s\n", resp.Status)
		} else {
			fmt.Printf("[Cloudflare Purge Success] Purged %d URLs\n", len(urls))
		}
	}()
}
