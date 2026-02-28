package vault

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
)

type VaultClient struct {
	BaseURL string
	APIKey  string
	Wallet  string
	HTTP    *http.Client
}

type VaultFile struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Size int64  `json:"size"`
	Hash string `json:"hash"`
	Date string `json:"date"`
}

type Folder struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	ParentID  int    `json:"parentId"`
	CreatedAt string `json:"createdAt"`
}

type Version struct {
	ID   int    `json:"id"`
	Hash string `json:"hash"`
	Size int64  `json:"size"`
	Date string `json:"date"`
}

func NewClient(baseURL, apiKey, wallet string) *VaultClient {
	return &VaultClient{
		BaseURL: baseURL,
		APIKey:  apiKey,
		Wallet:  wallet,
		HTTP:    &http.Client{},
	}
}

func (c *VaultClient) ListFiles() ([]VaultFile, error) {
	req, _ := http.NewRequest("GET", c.BaseURL+"/api/files", nil)
	c.setHeaders(req)

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error: %s", resp.Status)
	}

	var files []VaultFile
	json.NewDecoder(resp.Body).Decode(&files)
	return files, nil
}

func (c *VaultClient) Upload(filePath string, folderID int) (int, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return 0, err
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", filepath.Base(filePath))
	io.Copy(part, file)
	writer.Close()

	url := fmt.Sprintf("%s/api/upload?folder_id=%d", c.BaseURL, folderID)
	req, _ := http.NewRequest("POST", url, body)
	c.setHeaders(req)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	var res struct {
		ID int `json:"id"`
	}
	json.NewDecoder(resp.Body).Decode(&res)
	return res.ID, nil
}

func (c *VaultClient) setHeaders(req *http.Request) {
	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("X-Wallet-Address", c.Wallet)
}

func (c *VaultClient) CreateFolder(name string, parentID int) (int, error) {
	body, _ := json.Marshal(map[string]interface{}{
		"name":      name,
		"parent_id": parentID,
	})
	req, _ := http.NewRequest("POST", c.BaseURL+"/api/folders", bytes.NewBuffer(body))
	c.setHeaders(req)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	var res struct {
		ID int `json:"id"`
	}
	json.NewDecoder(resp.Body).Decode(&res)
	return res.ID, nil
}

func (c *VaultClient) ListFolders() ([]Folder, error) {
	req, _ := http.NewRequest("GET", c.BaseURL+"/api/folders", nil)
	c.setHeaders(req)

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var folders []Folder
	json.NewDecoder(resp.Body).Decode(&folders)
	return folders, nil
}

func (c *VaultClient) ListVersions(fileID int) ([]Version, error) {
	url := fmt.Sprintf("%s/api/files/%d/versions", c.BaseURL, fileID)
	req, _ := http.NewRequest("GET", url, nil)
	c.setHeaders(req)

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var versions []Version
	json.NewDecoder(resp.Body).Decode(&versions)
	return versions, nil
}

func (c *VaultClient) RestoreVersion(fileID, versionID int) error {
	url := fmt.Sprintf("%s/api/files/%d/restore/%d", c.BaseURL, fileID, versionID)
	req, _ := http.NewRequest("POST", url, nil)
	c.setHeaders(req)

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("API error: %s", resp.Status)
	}
	return nil
}
