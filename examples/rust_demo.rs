// This example assumes you are using the vault_sdk crate
// Add tracker = { path = "../sdks/rust" } to your Cargo.toml

use vault_sdk::{VaultClient, VaultError};

fn main() -> Result<(), VaultError> {
    let base_url = "http://localhost:8081";
    let api_key = "your_jwt_here";
    let wallet = "0xYourWalletAddress";

    let client = VaultClient::new(base_url, api_key, wallet);

    println!("--- Vault Protocol Rust Example ---");

    // 1. Fetch all files
    println!("[1] Fetching shards for wallet {}...", wallet);
    let files = client.list_files()?;
    
    if let Some(first_file) = files.first() {
        println!("Found shard: {} (ID: {})", first_file.name, first_file.id);

        // 2. View version history
        println!("[2] Accessing version history for ID {}...", first_file.id);
        let versions = client.list_versions(first_file.id)?;
        for v in versions {
            println!("  - Version: {} (Date: {}, Hash: {})", v.id, v.date, v.hash);
        }

        // 3. Restore the most recent backup if available
        if versions.len() > 1 {
            let backup_id = versions[0].id;
            println!("[3] Restoring shard to previous state (Version {})", backup_id);
            client.restore_version(first_file.id, backup_id)?;
            println!("Protocol State Restored.");
        }
    } else {
        println!("No files found. Run the Python demo first!");
    }

    Ok(())
}
