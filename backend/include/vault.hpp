#ifndef VAULT_HPP
#define VAULT_HPP

#include <string>
#include <vector>
#include <memory>
#include <map>
#include <mutex>
#include <cstdint>

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
};

// Activity Log Entry
struct ActivityLog {
    uint32_t id;
    char event_type[32];    // Upload, Sharding, Auth, Deploy, Access, Delete
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

class VaultDatabase {
public:
    VaultDatabase(const std::string& db_path);
    ~VaultDatabase();

    bool open();
    uint32_t insert(const FileMetadata& meta);
    std::vector<FileMetadata> selectAll();
    FileMetadata selectById(uint32_t id);
    bool remove(uint32_t id);
    
    // Custom "VaultSQL" interface
    void execute(const std::string& query);

private:
    std::string path;
    std::mutex mtx;
    void saveHeader();
    DbHeader header;
};

// Activity Log Database
class ActivityDatabase {
public:
    ActivityDatabase(const std::string& db_path);
    bool open();
    uint32_t logActivity(const ActivityLog& log);
    std::vector<ActivityLog> getRecentActivity(uint32_t limit = 50);
    std::vector<ActivityLog> getActivityByWallet(const std::string& wallet);
    
private:
    std::string path;
    std::mutex mtx;
    uint32_t record_count;
};

// --- Storage & Higher Level Logic ---

class StorageManager {
public:
    StorageManager(const std::string& db_path);
    
    bool init();
    int storeFile(const std::string& filename, const std::vector<uint8_t>& data, const std::string& hash, const std::string& content_type = "application/octet-stream");
    std::vector<uint8_t> getFile(int file_id);
    std::vector<FileMetadata> listFiles();
    bool deleteFile(int file_id);
    FileMetadata getFileMetadata(int file_id);
    
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
    std::unique_ptr<VaultDatabase> vdb;
    std::unique_ptr<ActivityDatabase> activityDb;
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

} // namespace vault

#endif
