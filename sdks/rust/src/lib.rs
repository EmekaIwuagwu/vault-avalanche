use std::fs;
use std::path::Path;
use reqwest::blocking::{Client, multipart};
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum VaultError {
    #[error("API request failed: {0}")]
    ApiError(String),
    #[error("File error: {0}")]
    FileError(String),
    #[error("Network error: {0}")]
    NetworkError(#[from] reqwest::Error),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct VaultFile {
    pub id: u32,
    pub name: String,
    pub size: u64,
    pub date: String,
    pub hash: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Folder {
    pub id: u32,
    pub name: String,
    pub parent_id: u32,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Version {
    pub id: u32,
    pub hash: String,
    pub size: u64,
    pub date: String,
}

pub struct VaultClient {
    base_url: String,
    api_key: String,
    wallet: String,
    client: Client,
}

impl VaultClient {
    pub fn new(base_url: &str, api_key: &str, wallet: &str) -> Self {
        Self {
            base_url: base_url.to_string(),
            api_key: api_key.to_string(),
            wallet: wallet.to_string(),
            client: Client::new(),
        }
    }

    pub fn list_files(&self) -> Result<Vec<VaultFile>, VaultError> {
        let url = format!("{}/api/files", self.base_url);
        let resp = self.client.get(url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("X-Wallet-Address", &self.wallet)
            .send()?;

        if resp.status().is_success() {
            resp.json().map_err(|e| VaultError::ApiError(e.to_string()))
        } else {
            Err(VaultError::ApiError(format!("Status: {}", resp.status())))
        }
    }

    pub fn upload(&self, file_path: &str, folder_id: u32) -> Result<u32, VaultError> {
        let path = Path::new(file_path);
        let filename = path.file_name()
            .ok_or_else(|| VaultError::FileError("Invalid file path".to_string()))?
            .to_string_lossy();

        let form = multipart::Form::new()
            .file("file", file_path)
            .map_err(|e| VaultError::FileError(e.to_string()))?;

        let url = format!("{}/api/upload?folder_id={}", self.base_url, folder_id);
        let resp = self.client.post(url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("X-Wallet-Address", &self.wallet)
            .multipart(form)
            .send()?;

        if resp.status().is_success() {
            let json: serde_json::Value = resp.json().map_err(|e| VaultError::ApiError(e.to_string()))?;
            Ok(json["id"].as_u64().ok_or(VaultError::ApiError("No ID returned".to_string()))? as u32)
        } else {
            Err(VaultError::ApiError(format!("Status: {}", resp.status())))
        }
    }

    pub fn create_folder(&self, name: &str, parent_id: u32) -> Result<u32, VaultError> {
        let url = format!("{}/api/folders", self.base_url);
        let body = serde_json::json!({ "name": name, "parent_id": parent_id });
        let resp = self.client.post(url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("X-Wallet-Address", &self.wallet)
            .json(&body)
            .send()?;

        if resp.status().is_success() {
            let json: serde_json::Value = resp.json().map_err(|e| VaultError::ApiError(e.to_string()))?;
            Ok(json["id"].as_u64().ok_or(VaultError::ApiError("No ID returned".to_string()))? as u32)
        } else {
            Err(VaultError::ApiError(format!("Status: {}", resp.status())))
        }
    }

    pub fn list_folders(&self) -> Result<Vec<Folder>, VaultError> {
        let url = format!("{}/api/folders", self.base_url);
        let resp = self.client.get(url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("X-Wallet-Address", &self.wallet)
            .send()?;

        if resp.status().is_success() {
            resp.json().map_err(|e| VaultError::ApiError(e.to_string()))
        } else {
            Err(VaultError::ApiError(format!("Status: {}", resp.status())))
        }
    }

    pub fn list_versions(&self, file_id: u32) -> Result<Vec<Version>, VaultError> {
        let url = format!("{}/api/files/{}/versions", self.base_url, file_id);
        let resp = self.client.get(url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("X-Wallet-Address", &self.wallet)
            .send()?;

        if resp.status().is_success() {
            resp.json().map_err(|e| VaultError::ApiError(e.to_string()))
        } else {
            Err(VaultError::ApiError(format!("Status: {}", resp.status())))
        }
    }

    pub fn restore_version(&self, file_id: u32, version_id: u32) -> Result<(), VaultError> {
        let url = format!("{}/api/files/{}/restore/{}", self.base_url, file_id, version_id);
        let resp = self.client.post(url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("X-Wallet-Address", &self.wallet)
            .send()?;

        if resp.status().is_success() {
            Ok(())
        } else {
            Err(VaultError::ApiError(format!("Status: {}", resp.status())))
        }
    }

    pub fn download(&self, file_id: u32, dest_path: &str) -> Result<(), VaultError> {
        let url = format!("{}/api/download/{}", self.base_url, file_id);
        let mut resp = self.client.get(url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("X-Wallet-Address", &self.wallet)
            .send()?;

        if resp.status().is_success() {
            let mut file = fs::File::create(dest_path)
                .map_err(|e| VaultError::FileError(e.to_string()))?;
            resp.copy_to(&mut file)?;
            Ok(())
        } else {
            Err(VaultError::ApiError(format!("Status: {}", resp.status())))
        }
    }

    pub fn delete(&self, file_id: u32) -> Result<(), VaultError> {
        let url = format!("{}/api/files/{}", self.base_url, file_id);
        let resp = self.client.delete(url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("X-Wallet-Address", &self.wallet)
            .send()?;

        if resp.status().is_success() {
            Ok(())
        } else {
            Err(VaultError::ApiError(format!("Status: {}", resp.status())))
        }
    }
}
