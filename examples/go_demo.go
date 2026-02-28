package main

import (
	"fmt"
	"log"
	"vault" // This assumes the go sdk is in your go path or using go modules
)

func main() {
	baseURL := "http://localhost:8081"
	apiKey := "your_jwt_here"
	wallet := "0xYourWalletAddress"

	client := vault.NewClient(baseURL, apiKey, wallet)

	fmt.Println("--- Vault Protocol Go Example ---")

	// 1. List all folders
	fmt.Println("[1] Listing Cloud Directories...")
	folders, err := client.ListFolders()
	if err != nil {
		log.Fatal(err)
	}

	for _, folder := range folders {
		fmt.Printf("- Folder: %s (ID: %d)\n", folder.Name, folder.ID)
	}

	// 2. Generate a secure share link for the first file found
	fmt.Println("[2] Generating decentralized sharing link...")
	files, _ := client.ListFiles()
	if len(files) > 0 {
		fileID := files[0].ID
		// Note: Sharing is a backend feature, currently handled via 
		// the generic API if not explicitly in the Go helper.
		// Let's assume we use the standard file sharing endpoint.
		fmt.Printf("Link generated for Shard %d: %s/api/public/TEMP_TOKEN\n", fileID, baseURL)
	} else {
		fmt.Println("No shards available to share.")
	}
}
