import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../sdks/python')))
from vault_sdk import VaultClient

def main():
    # Configuration
    BASE_URL = "http://localhost:8081"
    API_KEY = "your_jwt_here"
    WALLET = "0xYourWalletAddress"

    client = VaultClient(BASE_URL, API_KEY, WALLET)

    print("--- Vault Protocol Python Example ---")
    
    # 1. Create a Folder
    print("[1] Creating 'Production' folder...")
    folder = client.create_folder("Production")
    folder_id = folder.get("id")
    print(f"Success! Folder ID: {folder_id}")

    # 2. Upload a shard to that folder
    print(f"[2] Uploading shard to folder {folder_id}...")
    # Create a dummy file for the example
    with open("vault_test.txt", "w") as f:
        f.write("Highly confidential protocol sharding metadata.")
    
    upload_res = client.upload("vault_test.txt", folder_id=folder_id)
    file_id = upload_res.get("id")
    print(f"Success! Shard ID: {file_id}")

    # 3. List files in the root to verify
    print("[3] Verifying file list...")
    files = client.list_files()
    for f in files:
        print(f"- {f.get('name')} (ID: {f.get('id')}, Size: {f.get('size')} bytes)")

if __name__ == "__main__":
    main()
