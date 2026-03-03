const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8081'
        : '');

export interface VaultFile {
    id: number;
    name: string;
    size: number;
    date: string;
    hash: string;
    shards: number;
    contentType?: string;
    folderId?: number;
    isPublic?: boolean;
    shareToken?: string;
}

export interface Folder {
    id: number;
    name: string;
    parentId: number;
    createdAt: string;
}

export interface Version {
    id: number;
    hash: string;
    size: number;
    date: string;
}

export interface ActivityLog {
    id: number;
    type: string;
    status: string;
    name: string;
    time: string;
    wallet: string;
    hash: string;
    nodes: string;
}

export interface CapacityInfo {
    usedBytes: number;
    maxBytes: number;
    tier: number;
    tierName: string;
}

export interface Team {
    id: number;
    name: string;
    owner: string;
    createdAt: string;
}

export interface TeamMember {
    id: number;
    teamId: number;
    wallet: string;
    role: string;
}

export interface HealthStatus {
    status: string;
    engine: string;
}

export async function fetchFiles(walletAddress?: string): Promise<VaultFile[]> {
    const headers: any = {};
    if (walletAddress) headers['X-Wallet-Address'] = walletAddress;
    const response = await fetch(`${API_BASE_URL}/api/files`, { headers });
    if (!response.ok) throw new Error('Failed to fetch files');
    return response.json();
}

export async function uploadFile(file: File, walletAddress: string, folderId: number = 0, teamId: number = 0): Promise<{ status: string; id: number; txHash?: string; explorer?: string; warning?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload?folder_id=${folderId}&team_id=${teamId}`, {
        method: 'POST',
        headers: {
            'X-Wallet-Address': walletAddress
        },
        body: formData,
    });

    if (!response.ok) throw new Error('Failed to upload file');
    return response.json();
}

export async function downloadFile(fileId: number, filename?: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/download/${fileId}`);
    if (!response.ok) throw new Error('Failed to download file');
    const blob = await response.blob();

    if (filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    }

    return blob;
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

// Folders
export async function fetchFolders(walletAddress: string): Promise<Folder[]> {
    const response = await fetch(`${API_BASE_URL}/api/folders`, {
        headers: { 'X-Wallet-Address': walletAddress }
    });
    return response.json();
}

export async function createFolder(name: string, parentId: number, walletAddress: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/folders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Wallet-Address': walletAddress
        },
        body: JSON.stringify({ name, parent_id: parentId })
    });
    return response.json();
}

// Versioning
export async function fetchVersions(fileId: number): Promise<Version[]> {
    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/versions`);
    return response.json();
}

export async function restoreVersion(fileId: number, versionId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/restore/${versionId}`, {
        method: 'POST'
    });
    return response.json();
}

// Sharing
export async function createShareLink(fileId: number, hours: number = 24): Promise<{ token: string }> {
    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/share-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expires_in_hours: hours })
    });
    return response.json();
}

// Teams
export async function fetchTeams(walletAddress: string): Promise<Team[]> {
    const response = await fetch(`${API_BASE_URL}/api/teams`, {
        headers: { 'X-Wallet-Address': walletAddress }
    });
    return response.json();
}

export async function createTeam(name: string, walletAddress: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/teams`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Wallet-Address': walletAddress
        },
        body: JSON.stringify({ name })
    });
    return response.json();
}

export async function inviteToTeam(teamId: number, memberWallet: string, role: string, walletAddress: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/teams/invite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Wallet-Address': walletAddress
        },
        body: JSON.stringify({ team_id: teamId, wallet: memberWallet, role })
    });
    return response.json();
}

export async function fetchTeamFiles(teamId: number): Promise<VaultFile[]> {
    const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/files`);
    return response.json();
}

export async function fetchTeamMembers(teamId: number): Promise<TeamMember[]> {
    const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members`);
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

export async function fetchPublicFile(token: string): Promise<VaultFile> {
    const response = await fetch(`${API_BASE_URL}/api/public/file?token=${token}`);
    if (!response.ok) throw new Error('File not found');
    return response.json();
}

export async function getPreviewUrl(fileId: number): Promise<string> {
    return `${API_BASE_URL}/api/preview/${fileId}`;
}

export async function checkHealth(): Promise<HealthStatus> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Backend is not responding');
    return response.json();
}

export async function generateApiKey(walletAddress: string): Promise<{ status: string; key: string; type: string; created: number }> {
    const response = await fetch(`${API_BASE_URL}/api/keys/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ wallet: walletAddress })
    });
    if (!response.ok) throw new Error('Failed to generate API key');
    return response.json();
}

export async function moveFile(fileId: number, targetFolderId: number): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/move`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folder_id: targetFolderId })
    });
    if (!response.ok) throw new Error('Failed to move file');
    return response.json();
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
