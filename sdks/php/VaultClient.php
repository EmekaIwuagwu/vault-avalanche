<?php

class VaultClient {
    private $baseUrl;
    private $apiKey;
    private $wallet;

    public function __construct($baseUrl, $apiKey, $wallet) {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->apiKey = $apiKey;
        $this->wallet = $wallet;
    }

    public function listFiles() {
        return $this->request('GET', '/api/files');
    }

    public function upload($filePath, $folderId = 0) {
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => "{$this->baseUrl}/api/upload?folder_id={$folderId}",
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => ['file' => new CURLFile($filePath)],
            CURLOPT_HTTPHEADER => $this->getHeaders(),
            CURLOPT_RETURNTRANSFER => true
        ]);
        $resp = curl_exec($curl);
        curl_close($curl);
        return json_decode($resp, true);
    }

    public function createFolder($name, $parentId = 0) {
        $curl = curl_init("{$this->baseUrl}/api/folders");
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode(['name' => $name, 'parent_id' => $parentId]));
        curl_setopt($curl, CURLOPT_HTTPHEADER, array_merge($this->getHeaders(), ["Content-Type: application/json"]));
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        $resp = curl_exec($curl);
        curl_close($curl);
        return json_decode($resp, true);
    }

    public function listFolders() {
        return $this->request('GET', '/api/folders');
    }

    public function listVersions($fileId) {
        return $this->request('GET', "/api/files/{$fileId}/versions");
    }

    public function restoreVersion($fileId, $versionId) {
        return $this->request('POST', "/api/files/{$fileId}/restore/{$versionId}");
    }

    private function request($method, $path) {
        $curl = curl_init("{$this->baseUrl}{$path}");
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $this->getHeaders());
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        $resp = curl_exec($curl);
        curl_close($curl);
        return json_decode($resp, true);
    }

    private function getHeaders() {
        return [
            "Authorization: Bearer {$this->apiKey}",
            "X-Wallet-Address: {$this->wallet}"
        ];
    }
}
