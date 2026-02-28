#include "vault.hpp"
#include <iostream>
#include <fstream>
#include <filesystem>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <cstring>
#include <random>

namespace fs = std::filesystem;

namespace vault {

// --- Helper for generating random tokens ---
static std::string generateRandomToken(size_t len) {
    const char charset[] = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    std::string res;
    std::default_random_engine rng(std::chrono::system_clock::now().time_since_epoch().count());
    std::uniform_int_distribution<int> dist(0, sizeof(charset) - 2);
    for (size_t i = 0; i < len; ++i) res += charset[dist(rng)];
    return res;
}

// --- StorageManager Implementation (Middleware) ---

StorageManager::StorageManager(const std::string& db_path) 
    : storage_dir("vault_storage"), key_file("vault.keys") {
    vdb = std::make_unique<VaultGenericDatabase<FileMetadata>>(db_path);
    folderDb = std::make_unique<VaultGenericDatabase<FolderMetadata>>("folders.vdb");
    versionDb = std::make_unique<VaultGenericDatabase<VersionMetadata>>("versions.vdb");
    teamDb = std::make_unique<VaultGenericDatabase<TeamMetadata>>("teams.vdb");
    teamMemberDb = std::make_unique<VaultGenericDatabase<TeamMemberMetadata>>("team_members.vdb");
    activityDb = std::make_unique<VaultGenericDatabase<ActivityLog>>("activity.vdb", "VAULT_ACT");
}

bool StorageManager::init() {
    if (!fs::exists(storage_dir)) {
        fs::create_directory(storage_dir);
    }
    loadApiKeys();
    return vdb->open() && folderDb->open() && versionDb->open() && teamDb->open() && teamMemberDb->open() && activityDb->open();
}

int StorageManager::storeFile(const std::string& filename, const std::vector<uint8_t>& data, const std::string& hash, const std::string& wallet, const std::string& content_type, uint32_t folder_id, uint32_t team_id) {
    // Check for existing file to handle versioning
    auto allFiles = vdb->selectAll();
    uint32_t existingId = 0;
    for (const auto& f : allFiles) {
        if (std::string(f.filename) == filename && std::string(f.owner_wallet) == wallet && f.folder_id == folder_id && f.team_id == team_id) {
            existingId = f.id;
            break;
        }
    }

    if (existingId != 0) {
        // Create version for the existing file before updating
        FileMetadata existing = vdb->selectById(existingId);
        VersionMetadata version;
        std::memset(&version, 0, sizeof(version));
        version.file_id = existingId;
        std::strncpy(version.hash, existing.hash, 64);
        version.size = existing.size;
        std::strncpy(version.uploaded_at, existing.upload_date, 31);
        std::strncpy(version.uploader_wallet, existing.owner_wallet, 63);
        std::strncpy(version.storage_path, existing.storage_path, 511);
        versionDb->insert(version);
        
        // Log versioning
        logActivity("Versioning", "Success", filename, "System", hash, wallet);
    }

    std::string internal_name = std::to_string(std::chrono::system_clock::now().time_since_epoch().count());
    std::string path = storage_dir + "/" + internal_name + ".dat";

    std::ofstream outfile(path, std::ios::binary);
    outfile.write(reinterpret_cast<const char*>(data.data()), data.size());
    outfile.close();

    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::localtime(&in_time_t), "%Y-%m-%d %X");

    if (existingId != 0) {
        FileMetadata meta = vdb->selectById(existingId);
        meta.size = data.size();
        std::strncpy(meta.upload_date, ss.str().c_str(), 31);
        std::strncpy(meta.hash, hash.c_str(), 64);
        std::strncpy(meta.storage_path, path.c_str(), 511);
        vdb->update(existingId, meta);
        return existingId;
    } else {
        FileMetadata meta;
        std::memset(&meta, 0, sizeof(meta));
        std::strncpy(meta.filename, filename.c_str(), 255);
        meta.size = data.size();
        std::strncpy(meta.upload_date, ss.str().c_str(), 31);
        std::strncpy(meta.hash, hash.c_str(), 64);
        std::strncpy(meta.storage_path, path.c_str(), 511);
        std::strncpy(meta.content_type, content_type.c_str(), 63);
        meta.folder_id = folder_id;
        meta.team_id = team_id;
        std::strncpy(meta.owner_wallet, wallet.c_str(), 63);
        meta.shard_count = 12; // Default sharding

        return vdb->insert(meta);
    }
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

std::vector<FileMetadata> StorageManager::listFiles(const std::string& wallet) {
    auto all = vdb->selectAll();
    if (wallet.empty()) return all;
    
    std::vector<FileMetadata> filtered;
    for (const auto& f : all) {
        if (std::string(f.owner_wallet) == wallet) filtered.push_back(f);
    }
    return filtered;
}

FileMetadata StorageManager::getFileMetadata(int file_id) {
    return vdb->selectById(file_id);
}

bool StorageManager::updateFileMetadata(const FileMetadata& meta) {
    return vdb->update(meta.id, meta);
}

bool StorageManager::deleteFile(int file_id) {
    FileMetadata meta = vdb->selectById(file_id);
    if (meta.id != 0) {
        if (fs::exists(meta.storage_path)) {
            fs::remove(meta.storage_path);
        }
        
        // Also delete associated versions
        auto versions = listVersions(file_id);
        for (const auto& v : versions) {
            if (fs::exists(v.storage_path)) fs::remove(v.storage_path);
            versionDb->remove(v.id);
        }
    }
    return vdb->remove(file_id);
}

// Folders
uint32_t StorageManager::createFolder(const std::string& name, uint32_t parent_id, const std::string& wallet) {
    FolderMetadata meta;
    std::memset(&meta, 0, sizeof(meta));
    std::strncpy(meta.name, name.c_str(), 255);
    meta.parent_id = parent_id;
    std::strncpy(meta.owner_wallet, wallet.c_str(), 63);
    
    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::localtime(&in_time_t), "%Y-%m-%d %X");
    std::strncpy(meta.created_at, ss.str().c_str(), 31);

    return folderDb->insert(meta);
}

std::vector<FolderMetadata> StorageManager::listFolders(const std::string& wallet) {
    auto all = folderDb->selectAll();
    std::vector<FolderMetadata> filtered;
    for (const auto& f : all) {
        if (std::string(f.owner_wallet) == wallet) filtered.push_back(f);
    }
    return filtered;
}

bool StorageManager::deleteFolder(uint32_t folder_id) {
    // Recursive delete would be better, but for now just delete the folder and move children to root
    // or delete them. The brief says "delete folder (and contents)".
    
    auto files = vdb->selectAll();
    for (const auto& f : files) {
        if (f.folder_id == folder_id) deleteFile(f.id);
    }

    auto folders = folderDb->selectAll();
    for (const auto& f : folders) {
        if (f.parent_id == folder_id) deleteFolder(f.id);
    }

    return folderDb->remove(folder_id);
}

// Versions
std::vector<VersionMetadata> StorageManager::listVersions(uint32_t file_id) {
    auto all = versionDb->selectAll();
    std::vector<VersionMetadata> filtered;
    for (const auto& v : all) {
        if (v.file_id == file_id) filtered.push_back(v);
    }
    return filtered;
}

bool StorageManager::restoreVersion(uint32_t file_id, uint32_t version_id) {
    FileMetadata meta = vdb->selectById(file_id);
    VersionMetadata version = versionDb->selectById(version_id);
    if (meta.id == 0 || version.id == 0 || version.file_id != file_id) return false;

    // Swipe storage paths
    // Keep old current as a new version
    VersionMetadata oldCurrent;
    std::memset(&oldCurrent, 0, sizeof(oldCurrent));
    oldCurrent.file_id = file_id;
    std::strncpy(oldCurrent.hash, meta.hash, 64);
    oldCurrent.size = meta.size;
    std::strncpy(oldCurrent.uploaded_at, meta.upload_date, 31);
    std::strncpy(oldCurrent.uploader_wallet, meta.owner_wallet, 63);
    std::strncpy(oldCurrent.storage_path, meta.storage_path, 511);
    versionDb->insert(oldCurrent);

    // Update current
    std::strncpy(meta.hash, version.hash, 64);
    meta.size = version.size;
    std::strncpy(meta.upload_date, version.uploaded_at, 31);
    std::strncpy(meta.storage_path, version.storage_path, 511);
    vdb->update(file_id, meta);

    // Remove the version record that we just restored
    versionDb->remove(version_id);

    return true;
}

// Sharing
std::string StorageManager::createShareLink(uint32_t file_id, uint32_t expires_in_hours) {
    FileMetadata meta = vdb->selectById(file_id);
    if (meta.id == 0) return "";

    std::string token = generateRandomToken(32);
    meta.is_public = 1;
    std::strncpy(meta.share_token, token.c_str(), 64);
    meta.share_expiry = std::time(nullptr) + (expires_in_hours * 3600);
    
    vdb->update(file_id, meta);
    return token;
}

FileMetadata StorageManager::getFileByToken(const std::string& token) {
    auto all = vdb->selectAll();
    for (const auto& f : all) {
        if (f.is_public && std::string(f.share_token) == token) {
            if (f.share_expiry == 0 || f.share_expiry > (uint64_t)std::time(nullptr)) {
                return f;
            }
        }
    }
    return {};
}

// Teams
uint32_t StorageManager::createTeam(const std::string& name, const std::string& owner_wallet) {
    TeamMetadata meta;
    std::memset(&meta, 0, sizeof(meta));
    std::strncpy(meta.name, name.c_str(), 255);
    std::strncpy(meta.owner_wallet, owner_wallet.c_str(), 63);
    
    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::localtime(&in_time_t), "%Y-%m-%d %X");
    std::strncpy(meta.created_at, ss.str().c_str(), 31);

    uint32_t team_id = teamDb->insert(meta);
    inviteToTeam(team_id, owner_wallet, "admin");
    return team_id;
}

bool StorageManager::inviteToTeam(uint32_t team_id, const std::string& member_wallet, const std::string& role) {
    TeamMemberMetadata meta;
    std::memset(&meta, 0, sizeof(meta));
    meta.team_id = team_id;
    std::strncpy(meta.member_wallet, member_wallet.c_str(), 63);
    std::strncpy(meta.role, role.c_str(), 15);
    return teamMemberDb->insert(meta) > 0;
}

std::vector<TeamMetadata> StorageManager::listTeams(const std::string& wallet) {
    auto members = teamMemberDb->selectAll();
    std::vector<TeamMetadata> results;
    for (const auto& m : members) {
        if (std::string(m.member_wallet) == wallet) {
            results.push_back(teamDb->selectById(m.team_id));
        }
    }
    return results;
}

std::vector<FileMetadata> StorageManager::listTeamFiles(uint32_t team_id) {
    auto all = vdb->selectAll();
    std::vector<FileMetadata> results;
    for (const auto& f : all) {
        if (f.team_id == team_id) {
            results.push_back(f);
        }
    }
    return results;
}

std::vector<TeamMemberMetadata> StorageManager::listTeamMembers(uint32_t team_id) {
    auto all = teamMemberDb->selectAll();
    std::vector<TeamMemberMetadata> results;
    for (const auto& m : all) {
        if (m.team_id == team_id) results.push_back(m);
    }
    return results;
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
    
    activityDb->insert(log);
}

std::vector<ActivityLog> StorageManager::getActivityLog(uint32_t limit) {
    auto all = activityDb->selectAll();
    std::vector<ActivityLog> results;
    uint32_t start = all.size() > limit ? all.size() - limit : 0;
    for (size_t i = all.size(); i > start; --i) {
        results.push_back(all[i - 1]);
    }
    return results;
}

UserCapacity StorageManager::getCapacity(const std::string& wallet) {
    // Check cache first
    auto it = capacityCache.find(wallet);
    if (it != capacityCache.end()) {
        it->second.used_bytes = calculateUsedSpace();
        if (it->second.tier < 2) {
             it->second.tier = 2;
             it->second.max_bytes = 10240ULL * 1024 * 1024 * 1024; // 10 TB
        }
        return it->second;
    }
    
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
