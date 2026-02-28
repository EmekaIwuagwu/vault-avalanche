using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;
using System.IO;

namespace Vault;

public class VaultClient {
    private readonly HttpClient _client;
    private readonly string _baseUrl;
    private readonly string _apiKey;
    private readonly string _wallet;

    public VaultClient(string baseUrl, string apiKey, string wallet) {
        _baseUrl = baseUrl.TrimEnd('/');
        _apiKey = apiKey;
        _wallet = wallet;
        _client = new HttpClient();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        _client.DefaultRequestHeaders.Add("X-Wallet-Address", wallet);
    }

    public async Task<string> ListFilesAsync() {
        var response = await _client.GetAsync($"{_baseUrl}/api/files");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }

    public async Task<int> UploadAsync(string filePath, int folderId = 0) {
        using var form = new MultipartFormDataContent();
        using var fileContent = new ByteArrayContent(await File.ReadAllBytesAsync(filePath));
        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("application/octet-stream");
        form.Add(fileContent, "file", Path.GetFileName(filePath));

        var response = await _client.PostAsync($"{_baseUrl}/api/upload?folder_id={folderId}", form);
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        return doc.RootElement.GetProperty("id").GetInt32();
    }

    public async Task<int> CreateFolderAsync(string name, int parentId = 0) {
        var content = new StringContent(JsonSerializer.Serialize(new { name = name, parent_id = parentId }), System.Text.Encoding.UTF8, "application/json");
        var response = await _client.PostAsync($"{_baseUrl}/api/folders", content);
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        return doc.RootElement.GetProperty("id").GetInt32();
    }

    public async Task<string> ListFoldersAsync() {
        var response = await _client.GetAsync($"{_baseUrl}/api/folders");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> ListVersionsAsync(int fileId) {
        var response = await _client.GetAsync($"{_baseUrl}/api/files/{fileId}/versions");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }

    public async Task RestoreVersionAsync(int fileId, int versionId) {
        var response = await _client.PostAsync($"{_baseUrl}/api/files/{fileId}/restore/{versionId}", null);
        response.EnsureSuccessStatusCode();
    }
}
