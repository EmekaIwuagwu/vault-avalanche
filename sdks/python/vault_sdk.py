import requests
import os

class VaultClient:
    def __init__(self, base_url, api_key, wallet):
        self.base_url = base_url.strip('/')
        self.api_key = api_key
        self.wallet = wallet
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'X-Wallet-Address': wallet
        }

    def list_files(self):
        resp = requests.get(f'{self.base_url}/api/files', headers=self.headers)
        resp.raise_for_status()
        return resp.json()

    def upload(self, file_path, folder_id=0):
        filename = os.path.basename(file_path)
        with open(file_path, 'rb') as f:
            files = {'file': (filename, f)}
            resp = requests.post(
                f'{self.base_url}/api/upload', 
                headers=self.headers, 
                files=files,
                params={'folder_id': folder_id}
            )
        resp.raise_for_status()
        return resp.json()

    def download(self, file_id, dest_path):
        resp = requests.get(f'{self.base_url}/api/download/{file_id}', headers=self.headers, stream=True)
        resp.raise_for_status()
        with open(dest_path, 'wb') as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        return True

    def delete(self, file_id):
        resp = requests.delete(f'{self.base_url}/api/files/{file_id}', headers=self.headers)
        resp.raise_for_status()
        return resp.json()

    def create_folder(self, name, parent_id=0):
        resp = requests.post(
            f'{self.base_url}/api/folders',
            headers=self.headers,
            json={'name': name, 'parent_id': parent_id}
        )
        resp.raise_for_status()
        return resp.json()

    def list_versions(self, file_id):
        resp = requests.get(f'{self.base_url}/api/files/{file_id}/versions', headers=self.headers)
        resp.raise_for_status()
        return resp.json()

    def restore_version(self, file_id, version_id):
        resp = requests.post(f'{self.base_url}/api/files/{file_id}/restore/{version_id}', headers=self.headers)
        resp.raise_for_status()
        return resp.json()

    def get_share_link(self, file_id, hours=24):
        resp = requests.post(
            f'{self.base_url}/api/files/{file_id}/share-link',
            headers=self.headers,
            json={'expires_in_hours': hours}
        )
        resp.raise_for_status()
        return resp.json()
