#ifndef VAULT_HPP
#define VAULT_HPP

#include <string>
#include <vector>
#include <memory>
#include <map>
#include <mutex>
#include <cstdint>
#include <fstream>

namespace vault {

// --- VaultDB Engine: Our Custom Database ---

struct DbHeader {
    char magic[8]; // "VAULT_DB"
    uint32_t version;
    uint32_t record_count;
};

struct FileMetadata {
    uint32_t id;
    char filename[256];
    uint64_t size;
    char upload_date[32];
    char hash[65]; // Hex SHA-256
    char storage_path[512];
    uint32_t shard_count;
    char content_type[64];  // For PDF preview support
    uint32_t folder_id;     // Parent folder ID (0 for root)
    char owner_wallet[64];
    uint32_t is_public;     // 0=private, 1=public link active
    char share_token[65];   // Token for public sharing
    uint64_t share_expiry;  // Expiry for public link
    uint32_t team_id;       // Associated team ID (0 for personal)
};

// Folder Metadata
struct FolderMetadata {
    uint32_t id;
    char name[256];
    uint32_t parent_id;
    char owner_wallet[64];
    char created_at[32];
};

// File Version Metadata
struct VersionMetadata {
    uint32_t id;
    uint32_t file_id;
    char hash[65];
    uint64_t size;
    char uploaded_at[32];
    char uploader_wallet[64];
    char storage_path[512];
};

// Team Metadata
struct TeamMetadata {
    uint32_t id;
    char name[256];
    char owner_wallet[64];
    char created_at[32];
};

// Team Member Metadata
struct TeamMemberMetadata {
    uint32_t id;
    uint32_t team_id;
    char member_wallet[64];
    char role[16]; // "admin", "member"
};

// Activity Log Entry
struct ActivityLog {
    uint32_t id;
    char event_type[32];    // Upload, Sharding, Auth, Deploy, Access, Delete, Team
    char status[16];        // Success, Warning, Error, Verifying
    char resource_name[256];
    char node_info[64];
    char timestamp[32];
    char hash[65];
    char wallet_address[64];
};

// User Capacity Info
struct UserCapacity {
    char wallet_address[64];
    uint64_t used_bytes;
    uint64_t max_bytes;
    uint32_t tier;  // 0=Free, 1=Pro, 2=Enterprise
};

// --- Generic Database Template for VaultDB ---
template<typename T>
class VaultGenericDatabase {
public:
    VaultGenericDatabase(const std::string& db_path, const std::string& magic_str = "VAULT_DB") 
        : path(db_path), magic(magic_str) {
        std::memset(&header, 0, sizeof(header));
    }

    bool open() {
        std::lock_guard<std::mutex> lock(mtx);
        std::ifstream file(path, std::ios::binary);
        
        if (!file) {
            std::memcpy(header.magic, magic.c_str(), std::min((size_t)8, magic.size()));
            header.version = 1;
            header.record_count = 0;
            saveHeaderInternal();
            return true;
        }

        file.read(reinterpret_cast<char*>(&header), sizeof(header));
        if (std::memcmp(header.magic, magic.c_str(), std::min((size_t)8, magic.size())) != 0) {
            return false;
        }
        return true;
    }

    uint32_t insert(const T& record) {
        std::lock_guard<std::mutex> lock(mtx);
        T item = record;
        item.id = ++header.record_count;

        std::ofstream file(path, std::ios::binary | std::ios::app);
        file.write(reinterpret_cast<const char*>(&item), sizeof(T));
        
        saveHeaderInternal();
        return item.id;
    }

    std::vector<T> selectAll() {
        std::lock_guard<std::mutex> lock(mtx);
        std::vector<T> results;
        std::ifstream file(path, std::ios::binary);
        if (!file) return results;
        file.seekg(sizeof(header), std::ios::beg);

        for (uint32_t i = 0; i < header.record_count; ++i) {
            T item;
            if (file.read(reinterpret_cast<char*>(&item), sizeof(T))) {
                if (item.id != 0) results.push_back(item);
            }
        }
        return results;
    }

    T selectById(uint32_t id) {
        auto all = selectAll();
        for (const auto& item : all) {
            if (item.id == id) return item;
        }
        return {};
    }

    bool update(uint32_t id, const T& record) {
        std::lock_guard<std::mutex> lock(mtx);
        std::fstream file(path, std::ios::binary | std::ios::in | std::ios::out);
        if (!file) return false;
        file.seekg(sizeof(header), std::ios::beg);

        for (uint32_t i = 0; i < header.record_count; ++i) {
            std::streampos pos = file.tellg();
            T item;
            if (file.read(reinterpret_cast<char*>(&item), sizeof(T))) {
                if (item.id == id) {
                    file.seekp(pos, std::ios::beg);
                    file.write(reinterpret_cast<const char*>(&record), sizeof(T));
                    return true;
                }
            }
        }
        return false;
    }

    bool remove(uint32_t id) {
        std::lock_guard<std::mutex> lock(mtx);
        std::fstream file(path, std::ios::binary | std::ios::in | std::ios::out);
        if (!file) return false;
        file.seekg(sizeof(header), std::ios::beg);

        for (uint32_t i = 0; i < header.record_count; ++i) {
            std::streampos pos = file.tellg();
            T item;
            if (file.read(reinterpret_cast<char*>(&item), sizeof(T))) {
                if (item.id == id) {
                    item.id = 0; // Semantic delete
                    file.seekp(pos, std::ios::beg);
                    file.write(reinterpret_cast<const char*>(&item), sizeof(T));
                    return true;
                }
            }
        }
        return false;
    }

private:
    void saveHeaderInternal() {
        std::ofstream file(path, std::ios::binary | std::ios::in | std::ios::out);
        if (!file) {
            file.open(path, std::ios::binary | std::ios::trunc);
        }
        file.seekp(0, std::ios::beg);
        file.write(reinterpret_cast<const char*>(&header), sizeof(header));
    }

    std::string path;
    std::string magic;
    std::mutex mtx;
    DbHeader header;
};

// --- Storage & Higher Level Logic ---

class StorageManager {
public:
    StorageManager(const std::string& db_path);
    
    bool init();
    int storeFile(const std::string& filename, const std::vector<uint8_t>& data, const std::string& hash, const std::string& wallet = "unknown", const std::string& content_type = "application/octet-stream", uint32_t folder_id = 0, uint32_t team_id = 0);
    std::vector<uint8_t> getFile(int file_id);
    std::vector<FileMetadata> listFiles(const std::string& wallet = "");
    bool deleteFile(int file_id);
    FileMetadata getFileMetadata(int file_id);
    bool updateFileMetadata(const FileMetadata& meta);
    
    // Folders
    uint32_t createFolder(const std::string& name, uint32_t parent_id, const std::string& wallet);
    std::vector<FolderMetadata> listFolders(const std::string& wallet);
    bool deleteFolder(uint32_t folder_id);
    
    // Versions
    std::vector<VersionMetadata> listVersions(uint32_t file_id);
    bool restoreVersion(uint32_t file_id, uint32_t version_id);
    
    // Sharing
    std::string createShareLink(uint32_t file_id, uint32_t expires_in_hours);
    FileMetadata getFileByToken(const std::string& token);
    
    // Teams
    uint32_t createTeam(const std::string& name, const std::string& owner_wallet);
    bool inviteToTeam(uint32_t team_id, const std::string& member_wallet, const std::string& role);
    std::vector<TeamMetadata> listTeams(const std::string& wallet);
    std::vector<FileMetadata> listTeamFiles(uint32_t team_id);
    
    // Activity logging
    void logActivity(const std::string& type, const std::string& status, const std::string& resource, const std::string& node, const std::string& hash, const std::string& wallet);
    std::vector<ActivityLog> getActivityLog(uint32_t limit = 50);
    
    // Capacity management
    UserCapacity getCapacity(const std::string& wallet);
    bool upgradeCapacity(const std::string& wallet, uint32_t tier);
    uint64_t calculateUsedSpace();
    
    // API Key management
    void storeApiKey(const std::string& wallet, const std::string& key);
    std::string getApiKey(const std::string& wallet);
    bool validateApiKey(const std::string& key, std::string& out_wallet);

private:
    std::unique_ptr<VaultGenericDatabase<FileMetadata>> vdb;
    std::unique_ptr<VaultGenericDatabase<FolderMetadata>> folderDb;
    std::unique_ptr<VaultGenericDatabase<VersionMetadata>> versionDb;
    std::unique_ptr<VaultGenericDatabase<TeamMetadata>> teamDb;
    std::unique_ptr<VaultGenericDatabase<TeamMemberMetadata>> teamMemberDb;
    std::unique_ptr<VaultGenericDatabase<ActivityLog>> activityDb;
    
    std::string storage_dir;
    std::string key_file;
    std::map<std::string, UserCapacity> capacityCache;
    std::map<std::string, std::string> apiKeys; // wallet -> key
    std::map<std::string, std::string> keyToWallet; // key -> wallet
    
    void loadApiKeys();
    void saveApiKeys();
};

class CryptoHelper {
public:
    static std::string hashData(const std::vector<uint8_t>& data);
    static std::vector<uint8_t> encrypt(const std::vector<uint8_t>& data, const std::string& key);
    static std::vector<uint8_t> decrypt(const std::vector<uint8_t>& data, const std::string& key);
    static std::string generatePreviewToken(uint32_t file_id, uint64_t expiry);
    static bool validatePreviewToken(const std::string& token, uint32_t& file_id);
};

class VaultServer {
public:
    VaultServer(int port = 8081);
    void run();

private:
    int port;
    std::unique_ptr<StorageManager> storage;
};

class AuthProvider {
public:
    static bool verify_signature(const std::string& message, const std::string& signature, const std::string& address);
    static std::string generate_jwt(const std::string& address);
};

class BlockchainHelper {
public:
    static bool registerFileOnChain(const std::string& owner, const std::string& fileId, const std::string& hashStr, uint64_t size, uint32_t shards);
    static std::string getOnChainRecord(const std::string& fileId);
};

} // namespace vault

#endif
