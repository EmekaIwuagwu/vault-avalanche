const API_BASE_URL = 'http://localhost:8081';

export interface VaultFile {
    id: number;
    name: string;
    size: number;
    date: string;
    hash: string;
    shards: number;
    contentType?: string;
}

export interface ActivityLog {
    id: number;
    type: string;
    status: string;
    name: string;
    nodes: string;
    time: string;
    hash: string;
    wallet: string;
}

export interface CapacityInfo {
    usedBytes: number;
    maxBytes: number;
    tier: number;
    tierName: string;
}

export interface HealthStatus {
    status: string;
    engine: string;
}

export async function fetchFiles(): Promise<VaultFile[]> {
    const response = await fetch(`${API_BASE_URL}/api/files`);
    if (!response.ok) throw new Error('Failed to fetch files');
    return response.json();
}

export async function uploadFile(file: File, walletAddress: string): Promise<{ status: string; id: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
            'X-Wallet-Address': walletAddress
        },
        body: formData,
    });

    if (!response.ok) throw new Error('Failed to upload file');
    return response.json();
}

export async function downloadFile(fileId: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/download/${fileId}`);
    if (!response.ok) throw new Error('Failed to download file');
    return response.blob();
}

export async function deleteFile(fileId: number, walletAddress: string): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
            'X-Wallet-Address': walletAddress
        }
    });
    if (!response.ok) throw new Error('Failed to delete file');
    return response.json();
}

export async function fetchActivity(limit: number = 50): Promise<ActivityLog[]> {
    const response = await fetch(`${API_BASE_URL}/api/activity?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch activity');
    return response.json();
}

export async function fetchCapacity(walletAddress: string): Promise<CapacityInfo> {
    const response = await fetch(`${API_BASE_URL}/api/capacity`, {
        headers: {
            'X-Wallet-Address': walletAddress
        }
    });
    if (!response.ok) throw new Error('Failed to fetch capacity');
    return response.json();
}

export async function upgradeCapacity(walletAddress: string, tier: number): Promise<CapacityInfo> {
    const response = await fetch(`${API_BASE_URL}/api/capacity/upgrade`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ wallet: walletAddress, tier })
    });
    if (!response.ok) throw new Error('Failed to upgrade capacity');
    return response.json();
}

export async function getPreviewUrl(fileId: number): Promise<string> {
    // For PDF preview, we can either use a tokenized URL or just the direct ID if authenticated
    // For simplicity in this MVP, we'll return the direct preview endpoint
    return `${API_BASE_URL}/api/preview/${fileId}`;
}

export async function checkHealth(): Promise<HealthStatus> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Backend is not responding');
    return response.json();
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function generateApiKey(walletAddress: string): Promise<{ status: string; key: string, created: number }> {
    const response = await fetch(`${API_BASE_URL}/api/keys/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ wallet: walletAddress })
    });
    if (!response.ok) throw new Error('Failed to generate API Key');
    return response.json();
}
