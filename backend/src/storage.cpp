#include "vault.hpp"
#include <iostream>
#include <fstream>
#include <filesystem>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <cstring>

namespace fs = std::filesystem;

namespace vault {

// --- VaultDatabase Implementation (Our Custom Engine) ---

VaultDatabase::VaultDatabase(const std::string& db_path) : path(db_path) {
    std::memset(&header, 0, sizeof(header));
}

VaultDatabase::~VaultDatabase() {}

bool VaultDatabase::open() {
    std::lock_guard<std::mutex> lock(mtx);
    std::ifstream file(path, std::ios::binary);
    
    if (!file) {
        // Create new DB
        std::memcpy(header.magic, "VAULT_DB", 8);
        header.version = 1;
        header.record_count = 0;
        saveHeader();
        return true;
    }

    file.read(reinterpret_cast<char*>(&header), sizeof(header));
    if (std::memcmp(header.magic, "VAULT_DB", 8) != 0) {
        std::cerr << "Database corruption: Invalid magic bytes" << std::endl;
        return false;
    }
    return true;
}

void VaultDatabase::saveHeader() {
    if (!fs::exists(path)) {
        std::ofstream file(path, std::ios::binary | std::ios::trunc);
        file.write(reinterpret_cast<const char*>(&header), sizeof(header));
        return;
    }

    std::ofstream file(path, std::ios::binary | std::ios::in | std::ios::out);
    if (!file) {
        std::cerr << "Error: Could not open database for updating header." << std::endl;
        return;
    }
    file.seekp(0, std::ios::beg);
    file.write(reinterpret_cast<const char*>(&header), sizeof(header));
}

uint32_t VaultDatabase::insert(const FileMetadata& meta) {
    std::lock_guard<std::mutex> lock(mtx);
    
    FileMetadata record = meta;
    record.id = header.record_count + 1;

    {
        std::ofstream file(path, std::ios::binary | std::ios::app);
        file.write(reinterpret_cast<const char*>(&record), sizeof(record));
    }
    
    header.record_count++;
    saveHeader();
    
    return record.id;
}

std::vector<FileMetadata> VaultDatabase::selectAll() {
    std::lock_guard<std::mutex> lock(mtx);
    std::vector<FileMetadata> results;
    
    std::ifstream file(path, std::ios::binary);
    file.seekg(sizeof(header), std::ios::beg);

    for (uint32_t i = 0; i < header.record_count; ++i) {
        FileMetadata meta;
        if (file.read(reinterpret_cast<char*>(&meta), sizeof(meta))) {
            if (meta.id != 0) {
                results.push_back(meta);
            }
        }
    }
    return results;
}

FileMetadata VaultDatabase::selectById(uint32_t id) {
    auto all = selectAll();
    for (const auto& m : all) {
        if (m.id == id) return m;
    }
    return {};
}

bool VaultDatabase::remove(uint32_t id) {
    std::lock_guard<std::mutex> lock(mtx);
    std::fstream file(path, std::ios::binary | std::ios::in | std::ios::out);
    file.seekg(sizeof(header), std::ios::beg);

    for (uint32_t i = 0; i < header.record_count; ++i) {
        std::streampos pos = file.tellg();
        FileMetadata meta;
        if (file.read(reinterpret_cast<char*>(&meta), sizeof(meta))) {
            if (meta.id == id) {
                meta.id = 0; // Semantic delete
                file.seekp(pos, std::ios::beg);
                file.write(reinterpret_cast<const char*>(&meta), sizeof(meta));
                return true;
            }
        }
    }
    return false;
}

void VaultDatabase::execute(const std::string& query) {
    // Reserved for future VaultSQL query parsing
    std::cout << "[VaultSQL] Executing: " << query << std::endl;
}

// --- ActivityDatabase Implementation ---

ActivityDatabase::ActivityDatabase(const std::string& db_path) : path(db_path), record_count(0) {}

bool ActivityDatabase::open() {
    std::lock_guard<std::mutex> lock(mtx);
    std::ifstream file(path, std::ios::binary);
    
    if (!file) {
        // Create new activity log
        record_count = 0;
        std::ofstream out(path, std::ios::binary);
        out.write(reinterpret_cast<const char*>(&record_count), sizeof(record_count));
        return true;
    }

    file.read(reinterpret_cast<char*>(&record_count), sizeof(record_count));
    return true;
}

uint32_t ActivityDatabase::logActivity(const ActivityLog& log) {
    std::lock_guard<std::mutex> lock(mtx);
    
    ActivityLog record = log;
    record.id = ++record_count;

    std::ofstream file(path, std::ios::binary | std::ios::app);
    file.write(reinterpret_cast<const char*>(&record), sizeof(record));
    
    // Update header
    std::fstream header_file(path, std::ios::binary | std::ios::in | std::ios::out);
    header_file.write(reinterpret_cast<const char*>(&record_count), sizeof(record_count));
    
    return record.id;
}

std::vector<ActivityLog> ActivityDatabase::getRecentActivity(uint32_t limit) {
    std::lock_guard<std::mutex> lock(mtx);
    std::vector<ActivityLog> results;
    
    std::ifstream file(path, std::ios::binary);
    file.seekg(sizeof(record_count), std::ios::beg);

    std::vector<ActivityLog> all;
    for (uint32_t i = 0; i < record_count; ++i) {
        ActivityLog log;
        if (file.read(reinterpret_cast<char*>(&log), sizeof(log))) {
            all.push_back(log);
        }
    }
    
    // Return last 'limit' entries in reverse order (most recent first)
    uint32_t start = all.size() > limit ? all.size() - limit : 0;
    for (size_t i = all.size(); i > start; --i) {
        results.push_back(all[i - 1]);
    }
    
    return results;
}

std::vector<ActivityLog> ActivityDatabase::getActivityByWallet(const std::string& wallet) {
    auto all = getRecentActivity(1000);
    std::vector<ActivityLog> results;
    for (const auto& log : all) {
        if (std::string(log.wallet_address) == wallet) {
            results.push_back(log);
        }
    }
    return results;
}

// --- StorageManager Implementation (Middleware) ---

StorageManager::StorageManager(const std::string& db_path) 
    : storage_dir("vault_storage"), key_file("vault.keys") {
    vdb = std::make_unique<VaultDatabase>(db_path);
    activityDb = std::make_unique<ActivityDatabase>("activity.vdb");
}

bool StorageManager::init() {
    if (!fs::exists(storage_dir)) {
        fs::create_directory(storage_dir);
    }
    loadApiKeys();
    return vdb->open() && activityDb->open();
}

int StorageManager::storeFile(const std::string& filename, const std::vector<uint8_t>& data, const std::string& hash, const std::string& content_type) {
    std::string internal_name = std::to_string(std::chrono::system_clock::now().time_since_epoch().count());
    std::string path = storage_dir + "/" + internal_name + ".dat";

    std::ofstream outfile(path, std::ios::binary);
    outfile.write(reinterpret_cast<const char*>(data.data()), data.size());
    outfile.close();

    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::localtime(&in_time_t), "%Y-%m-%d %X");

    FileMetadata meta;
    std::memset(&meta, 0, sizeof(meta));
    std::strncpy(meta.filename, filename.c_str(), 255);
    meta.size = data.size();
    std::strncpy(meta.upload_date, ss.str().c_str(), 31);
    std::strncpy(meta.hash, hash.c_str(), 64);
    std::strncpy(meta.storage_path, path.c_str(), 511);
    std::strncpy(meta.content_type, content_type.c_str(), 63);
    meta.shard_count = 12;

    return vdb->insert(meta);
}

std::vector<uint8_t> StorageManager::getFile(int file_id) {
    FileMetadata meta = vdb->selectById(file_id);
    if (meta.id == 0) return {};

    std::ifstream infile(meta.storage_path, std::ios::binary | std::ios::ate);
    if (!infile) return {};
    
    std::streamsize size = infile.tellg();
    infile.seekg(0, std::ios::beg);

    std::vector<uint8_t> buffer(size);
    if (infile.read(reinterpret_cast<char*>(buffer.data()), size)) {
        return buffer;
    }
    return {};
}

std::vector<FileMetadata> StorageManager::listFiles() {
    return vdb->selectAll();
}

FileMetadata StorageManager::getFileMetadata(int file_id) {
    return vdb->selectById(file_id);
}

bool StorageManager::deleteFile(int file_id) {
    FileMetadata meta = vdb->selectById(file_id);
    if (meta.id != 0) {
        fs::remove(meta.storage_path);
    }
    return vdb->remove(file_id);
}

void StorageManager::logActivity(const std::string& type, const std::string& status, const std::string& resource, const std::string& node, const std::string& hash, const std::string& wallet) {
    ActivityLog log;
    std::memset(&log, 0, sizeof(log));
    
    std::strncpy(log.event_type, type.c_str(), 31);
    std::strncpy(log.status, status.c_str(), 15);
    std::strncpy(log.resource_name, resource.c_str(), 255);
    std::strncpy(log.node_info, node.c_str(), 63);
    std::strncpy(log.hash, hash.c_str(), 64);
    std::strncpy(log.wallet_address, wallet.c_str(), 63);
    
    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::localtime(&in_time_t), "%Y-%m-%d %X");
    std::strncpy(log.timestamp, ss.str().c_str(), 31);
    
    activityDb->logActivity(log);
}

std::vector<ActivityLog> StorageManager::getActivityLog(uint32_t limit) {
    return activityDb->getRecentActivity(limit);
}

UserCapacity StorageManager::getCapacity(const std::string& wallet) {
    // Check cache first
    auto it = capacityCache.find(wallet);
    if (it != capacityCache.end()) {
        it->second.used_bytes = calculateUsedSpace();
        if (it->second.tier < 2) {
             // Auto-upgrade existing cached users to free enterprise
             it->second.tier = 2;
             it->second.max_bytes = 10240ULL * 1024 * 1024 * 1024; // 10 TB
        }
        return it->second;
    }
    
    // Create default capacity - 100% Free Enterprise Plan for Everyone
    UserCapacity cap;
    std::memset(&cap, 0, sizeof(cap));
    std::strncpy(cap.wallet_address, wallet.c_str(), 63);
    cap.used_bytes = calculateUsedSpace();
    cap.max_bytes = 10240ULL * 1024 * 1024 * 1024; // 10 TB default
    cap.tier = 2; // Enterprise tier for all
    
    capacityCache[wallet] = cap;
    return cap;
}

bool StorageManager::upgradeCapacity(const std::string& wallet, uint32_t tier) {
    // Upgrades are free and automatic now, so this is just a confirmation
    UserCapacity& cap = capacityCache[wallet];
    std::strncpy(cap.wallet_address, wallet.c_str(), 63);
    cap.tier = 2; // Force max tier
    cap.max_bytes = 10240ULL * 1024 * 1024 * 1024; // 10 TB
    
    logActivity("Upgrade", "Success", "Free Enterprise Upgrade", "System", "", wallet);
    return true;
}

// --- API Key Persistence ---

static std::mutex g_apiKeyMtx;

void StorageManager::storeApiKey(const std::string& wallet, const std::string& key) {
    std::lock_guard<std::mutex> lock(g_apiKeyMtx);
    apiKeys[wallet] = key;
    keyToWallet[key] = wallet;
    saveApiKeys();
}

std::string StorageManager::getApiKey(const std::string& wallet) {
    std::lock_guard<std::mutex> lock(g_apiKeyMtx);
    if (apiKeys.find(wallet) != apiKeys.end()) {
        return apiKeys[wallet];
    }
    return "";
}

bool StorageManager::validateApiKey(const std::string& key, std::string& out_wallet) {
    if (key.empty()) return false;
    
    std::lock_guard<std::mutex> lock(g_apiKeyMtx);
    // Check key cache
    if (keyToWallet.find(key) != keyToWallet.end()) {
        out_wallet = keyToWallet[key];
        return true;
    }
    return false;
}

void StorageManager::loadApiKeys() {
    std::lock_guard<std::mutex> lock(g_apiKeyMtx);
    std::ifstream file(key_file);
    if (!file.is_open()) return;
    
    std::string line;
    while (std::getline(file, line)) {
        size_t pos = line.find('=');
        if (pos != std::string::npos) {
            std::string wallet = line.substr(0, pos);
            std::string key = line.substr(pos + 1);
            apiKeys[wallet] = key;
            keyToWallet[key] = wallet;
        }
    }
}

void StorageManager::saveApiKeys() {
    std::ofstream file(key_file);
    if (!file.is_open()) return;
    
    for (const auto& pair : apiKeys) {
        file << pair.first << "=" << pair.second << "\n";
    }
}

uint64_t StorageManager::calculateUsedSpace() {
    uint64_t total = 0;
    for (const auto& file : vdb->selectAll()) {
        total += file.size;
    }
    return total;
}

} // namespace vault
