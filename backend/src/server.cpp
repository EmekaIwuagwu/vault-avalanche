#include "vault.hpp"
#include "../external/httplib.h"
#include "../external/json.hpp"
#include <iostream>
#include <regex>
#include <ctime>
#include <thread>
#include <chrono>
#include <cstdlib>

using json = nlohmann::json;

namespace vault {

static std::string getEncryptionKey() {
    const char* env_key = std::getenv("VAULT_ENCRYPTION_KEY");
    if (env_key && std::strlen(env_key) == 32) {
        return std::string(env_key);
    }
    return "VaultSecure256BitKeyForAES!!!!!!";
}

VaultServer::VaultServer(int port) : port(port) {
    storage = std::make_unique<StorageManager>("vault.vdb");
    storage->init();
}

void VaultServer::run() {
    httplib::Server svr;

    auto get_wallet = [this](const httplib::Request& req) -> std::string {
        if (req.has_header("Authorization")) {
            std::string auth = req.get_header_value("Authorization");
            if (auth.find("Bearer ") == 0) {
                std::string key = auth.substr(7);
                std::string wallet;
                if (storage->validateApiKey(key, wallet)) return wallet;
            }
        }
        if (req.has_header("X-Wallet-Address")) {
            return req.get_header_value("X-Wallet-Address");
        }
        return "unknown";
    };

    // CORS Preflight
    svr.Options("/(.*)", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, DELETE, PATCH, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, X-Filename, X-Wallet-Address, Authorization");
        res.status = 204;
    });

    // Health Check
    svr.Get("/health", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_content("{\"status\": \"operational\", \"engine\": \"VaultDB v2.0\"}", "application/json");
    });

    // List Files
    svr.Get("/api/files", [this, get_wallet](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        std::string wallet = get_wallet(req);
        auto files = storage->listFiles(wallet == "unknown" ? "" : wallet);
        json j = json::array();
        for (const auto& f : files) {
            j.push_back({
                {"id", f.id},
                {"name", std::string(f.filename)},
                {"size", f.size},
                {"date", std::string(f.upload_date)},
                {"hash", std::string(f.hash)},
                {"shards", f.shard_count},
                {"contentType", std::string(f.content_type)},
                {"folderId", f.folder_id},
                {"isPublic", f.is_public == 1},
                {"shareToken", std::string(f.share_token)}
            });
        }
        res.set_content(j.dump(), "application/json");
    });

    // Upload File
    svr.Post("/api/upload", [this, get_wallet](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        std::string wallet = get_wallet(req);
        uint32_t folder_id = req.has_param("folder_id") ? std::stoi(req.get_param_value("folder_id")) : 0;
        uint32_t team_id = req.has_param("team_id") ? std::stoi(req.get_param_value("team_id")) : 0;
        
        if (req.form.has_file("file")) {
            auto file = req.form.get_file("file");
            std::vector<uint8_t> data(file.content.begin(), file.content.end());
            std::string hash = CryptoHelper::hashData(data);
            auto encrypted = CryptoHelper::encrypt(data, getEncryptionKey());
            
            std::string fname = file.filename.empty() ? "uploaded_file" : file.filename;
            std::string content_type = file.content_type.empty() ? "application/octet-stream" : file.content_type;
            
            int id = storage->storeFile(fname, encrypted, hash, wallet, content_type, folder_id, team_id);
            storage->logActivity("Upload", "Success", fname, "Vault Node", hash, wallet);
            
            // Register file on Avalanche blockchain
            std::string txHash = BlockchainHelper::registerFileOnChain(wallet, std::to_string(id), hash, data.size(), 12);
            if (!txHash.empty()) {
                std::cout << "[Blockchain] File registered on-chain successfully. TxHash: " << txHash << std::endl;
                storage->logActivity("Blockchain", "Success", fname, "Avalanche Fuji", txHash, wallet);
                res.set_content(json({
                    {"status", "success"}, 
                    {"id", id},
                    {"txHash", txHash},
                    {"explorer", "https://testnet.snowtrace.io/tx/" + txHash}
                }).dump(), "application/json");
            } else {
                std::cout << "[Blockchain] Warning: On-chain registration failed, file stored locally" << std::endl;
                storage->logActivity("Blockchain", "Warning", fname, "Avalanche Fuji", hash, wallet);
                res.set_content(json({
                    {"status", "success"}, 
                    {"id", id},
                    {"txHash", ""},
                    {"warning", "File stored locally, blockchain registration failed"}
                }).dump(), "application/json");
            }
        } else if (!req.body.empty()) {
            std::vector<uint8_t> data(req.body.begin(), req.body.end());
            std::string hash = CryptoHelper::hashData(data);
            auto encrypted = CryptoHelper::encrypt(data, getEncryptionKey());
            
            std::string filename = req.has_header("X-Filename") ? req.get_header_value("X-Filename") : "uploaded_file";
            
            int id = storage->storeFile(filename, encrypted, hash, wallet, "application/octet-stream", folder_id, team_id);
            storage->logActivity("Upload", "Success", filename, "Vault Node", hash, wallet);
            
            // Register file on Avalanche blockchain
            std::string txHash = BlockchainHelper::registerFileOnChain(wallet, std::to_string(id), hash, data.size(), 12);
            if (!txHash.empty()) {
                std::cout << "[Blockchain] File registered on-chain successfully. TxHash: " << txHash << std::endl;
                storage->logActivity("Blockchain", "Success", filename, "Avalanche Fuji", txHash, wallet);
                res.set_content(json({
                    {"status", "success"}, 
                    {"id", id},
                    {"txHash", txHash},
                    {"explorer", "https://testnet.snowtrace.io/tx/" + txHash}
                }).dump(), "application/json");
            } else {
                std::cout << "[Blockchain] Warning: On-chain registration failed, file stored locally" << std::endl;
                storage->logActivity("Blockchain", "Warning", filename, "Avalanche Fuji", hash, wallet);
                res.set_content(json({
                    {"status", "success"}, 
                    {"id", id},
                    {"txHash", ""},
                    {"warning", "File stored locally, blockchain registration failed"}
                }).dump(), "application/json");
            }
        } else {
            res.status = 400;
            res.set_content("{\"error\": \"No file uploaded\"}", "application/json");
        }
    });

    // Folders
    svr.Post("/api/folders", [this, get_wallet](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto body = json::parse(req.body);
        std::string name = body.value("name", "New Folder");
        uint32_t parent_id = body.value("parent_id", 0);
        std::string wallet = get_wallet(req);
        
        uint32_t id = storage->createFolder(name, parent_id, wallet);
        res.set_content(json({{"status", "success"}, {"id", id}}).dump(), "application/json");
    });

    svr.Get("/api/folders", [this, get_wallet](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        std::string wallet = get_wallet(req);
        auto folders = storage->listFolders(wallet);
        
        json j = json::array();
        for (const auto& f : folders) {
            j.push_back({
                {"id", f.id},
                {"name", std::string(f.name)},
                {"parentId", f.parent_id},
                {"createdAt", std::string(f.created_at)}
            });
        }
        res.set_content(j.dump(), "application/json");
    });

    svr.Delete("/api/folders/(\\d+)", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        uint32_t id = std::stoi(req.matches[1]);
        if (storage->deleteFolder(id)) {
            res.set_content("{\"status\": \"deleted\"}", "application/json");
        } else {
            res.status = 404;
            res.set_content("{\"error\": \"Folder not found\"}", "application/json");
        }
    });

    // File Move
    svr.Patch("/api/files/(\\d+)/move", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        uint32_t id = std::stoi(req.matches[1]);
        auto body = json::parse(req.body);
        uint32_t folder_id = body.value("folder_id", 0);
        
        auto meta = storage->getFileMetadata(id);
        if (meta.id != 0) {
            meta.folder_id = folder_id;
            storage->updateFileMetadata(meta);
            res.set_content("{\"status\": \"moved\"}", "application/json");
        } else {
            res.status = 404;
        }
    });

    // Versions
    svr.Get("/api/files/(\\d+)/versions", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        uint32_t id = std::stoi(req.matches[1]);
        auto versions = storage->listVersions(id);
        
        json j = json::array();
        for (const auto& v : versions) {
            j.push_back({
                {"id", v.id},
                {"hash", std::string(v.hash)},
                {"size", v.size},
                {"date", std::string(v.uploaded_at)}
            });
        }
        res.set_content(j.dump(), "application/json");
    });

    svr.Post("/api/files/(\\d+)/restore/(\\d+)", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        uint32_t file_id = std::stoi(req.matches[1]);
        uint32_t version_id = std::stoi(req.matches[2]);
        
        if (storage->restoreVersion(file_id, version_id)) {
            res.set_content("{\"status\": \"restored\"}", "application/json");
        } else {
            res.status = 400;
        }
    });

    // Public Sharing
    svr.Post("/api/files/(\\d+)/share-link", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        uint32_t file_id = std::stoi(req.matches[1]);
        auto body = json::parse(req.body);
        uint32_t hours = body.value("expires_in_hours", 24);
        
        std::string token = storage->createShareLink(file_id, hours);
        res.set_content(json({{"status", "success"}, {"token", token}}).dump(), "application/json");
    });

    svr.Get("/api/public/(\\w+)", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        std::string token = req.matches[1];
        auto meta = storage->getFileByToken(token);
        
        if (meta.id != 0) {
            auto encrypted = storage->getFile(meta.id);
            auto decrypted = CryptoHelper::decrypt(encrypted, getEncryptionKey());
            res.set_header("Content-Disposition", "attachment; filename=\"" + std::string(meta.filename) + "\"");
            res.set_content(reinterpret_cast<const char*>(decrypted.data()), decrypted.size(), "application/octet-stream");
        } else {
            res.status = 404;
            res.set_content("{\"error\": \"Link expired or invalid\"}", "application/json");
        }
    });

    // Download File (Standard)
    svr.Get("/api/download/(\\d+)", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        int id = std::stoi(req.matches[1]);
        auto encrypted = storage->getFile(id);
        auto meta = storage->getFileMetadata(id);
        
        if (!encrypted.empty()) {
            auto decrypted = CryptoHelper::decrypt(encrypted, getEncryptionKey());
            res.set_header("Content-Disposition", "attachment; filename=\"" + std::string(meta.filename) + "\"");
            res.set_content(reinterpret_cast<const char*>(decrypted.data()), decrypted.size(), "application/octet-stream");
        } else {
            res.status = 404;
        }
    });

    // Preview File (Inline)
    svr.Get("/api/preview/(\\d+)", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        int id = std::stoi(req.matches[1]);
        auto meta = storage->getFileMetadata(id);
        
        if (meta.id != 0) {
            auto encrypted = storage->getFile(id);
            if (!encrypted.empty()) {
                auto decrypted = CryptoHelper::decrypt(encrypted, getEncryptionKey());
                std::string content_type = std::string(meta.content_type);
                if (content_type.empty() || content_type == "application/octet-stream") {
                    // Heuristic for common types if missing
                    std::string fname = meta.filename;
                    if (fname.find(".pdf") != std::string::npos) content_type = "application/pdf";
                    else if (fname.find(".png") != std::string::npos) content_type = "image/png";
                    else if (fname.find(".jpg") != std::string::npos) content_type = "image/jpeg";
                }
                
                res.set_header("Content-Disposition", "inline; filename=\"" + std::string(meta.filename) + "\"");
                res.set_content(reinterpret_cast<const char*>(decrypted.data()), decrypted.size(), content_type.c_str());
                return;
            }
        }
        res.status = 404;
    });

    // Teams
    svr.Post("/api/teams", [this, get_wallet](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto body = json::parse(req.body);
        std::string name = body.value("name", "New Team");
        std::string wallet = get_wallet(req);
        
        uint32_t id = storage->createTeam(name, wallet);
        res.set_content(json({{"status", "success"}, {"id", id}}).dump(), "application/json");
    });

    svr.Get("/api/teams", [this, get_wallet](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        std::string wallet = get_wallet(req);
        auto teams = storage->listTeams(wallet);
        
        json j = json::array();
        for (const auto& t : teams) {
            j.push_back({
                {"id", t.id},
                {"name", std::string(t.name)},
                {"owner", std::string(t.owner_wallet)}
            });
        }
        res.set_content(j.dump(), "application/json");
    });

    svr.Post("/api/teams/invite", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto body = json::parse(req.body);
        uint32_t team_id = body.value("team_id", 0);
        std::string wallet = body.value("wallet", "");
        std::string role = body.value("role", "member");
        
        if (storage->inviteToTeam(team_id, wallet, role)) {
            res.set_content("{\"status\": \"success\"}", "application/json");
        } else {
            res.status = 400;
        }
    });

    svr.Get("/api/teams/(\\d+)/members", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        uint32_t team_id = std::stoi(req.matches[1]);
        auto members = storage->listTeamMembers(team_id);
        
        json j = json::array();
        for (const auto& m : members) {
            j.push_back({
                {"wallet", std::string(m.member_wallet)},
                {"role", std::string(m.role)}
            });
        }
        res.set_content(j.dump(), "application/json");
    });

    svr.Get("/api/teams/(\\d+)/files", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        uint32_t team_id = std::stoi(req.matches[1]);
        auto files = storage->listTeamFiles(team_id);
        
        json j = json::array();
        for (const auto& f : files) {
            j.push_back({
                {"id", f.id},
                {"name", std::string(f.filename)},
                {"size", f.size},
                {"date", std::string(f.upload_date)},
                {"hash", std::string(f.hash)},
                {"shards", f.shard_count},
                {"contentType", std::string(f.content_type)},
                {"team_id", f.team_id}
            });
        }
        res.set_content(j.dump(), "application/json");
    });

    // Search
    svr.Get("/api/search", [this, get_wallet](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        std::string q = req.get_param_value("q");
        std::string wallet = get_wallet(req);
        
        auto all = storage->listFiles(wallet);
        json j = json::array();
        for (const auto& f : all) {
            std::string name = f.filename;
            if (name.find(q) != std::string::npos) {
                j.push_back({
                    {"id", f.id},
                    {"name", name},
                    {"size", f.size},
                    {"hash", std::string(f.hash)}
                });
            }
        }
        res.set_content(j.dump(), "application/json");
    });

    // Deletion
    svr.Delete("/api/files/(\\d+)", [this, get_wallet](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        int id = std::stoi(req.matches[1]);
        std::string wallet = get_wallet(req);
        auto meta = storage->getFileMetadata(id);
        
        if (storage->deleteFile(id)) {
            storage->logActivity("Delete", "Success", std::string(meta.filename), "System", std::string(meta.hash), wallet);
            res.set_content("{\"status\": \"deleted\"}", "application/json");
        } else {
            res.status = 404;
        }
    });

    svr.Post("/api/files/(\\d+)/move", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        uint32_t file_id = std::stoi(req.matches[1]);
        auto body = json::parse(req.body);
        uint32_t folder_id = body.value("folder_id", 0);
        
        FileMetadata meta = storage->getFileMetadata(file_id);
        if (meta.id != 0) {
            meta.folder_id = folder_id;
            if (storage->updateFileMetadata(meta)) {
                res.set_content("{\"status\": \"success\"}", "application/json");
            } else {
                res.status = 500;
            }
        } else {
            res.status = 404;
        }
    });

    // Capacity & Keys
    svr.Get("/api/capacity", [this, get_wallet](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        std::string wallet = get_wallet(req);
        auto cap = storage->getCapacity(wallet);
        res.set_content(json({
            {"usedBytes", cap.used_bytes},
            {"maxBytes", cap.max_bytes},
            {"tier", cap.tier},
            {"tierName", "Enterprise"}
        }).dump(), "application/json");
    });

    svr.Post("/api/keys/generate", [this, get_wallet](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        std::string wallet = get_wallet(req);
        if (wallet == "unknown") {
            auto body = json::parse(req.body);
            wallet = body.value("wallet", "");
        }
        
        if (wallet.empty()) { res.status = 400; return; }
        
        std::string key = AuthProvider::generate_jwt(wallet);
        storage->storeApiKey(wallet, key);
        res.set_content(json({{"status", "success"}, {"key", key}}).dump(), "application/json");
    });

    svr.Get("/api/activity", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        uint32_t limit = req.has_param("limit") ? std::stoi(req.get_param_value("limit")) : 50;
        auto logs = storage->getActivityLog(limit);
        json j = json::array();
        for (const auto& log : logs) {
            j.push_back({
                {"id", log.id},
                {"type", std::string(log.event_type)},
                {"status", std::string(log.status)},
                {"name", std::string(log.resource_name)},
                {"time", std::string(log.timestamp)},
                {"wallet", std::string(log.wallet_address)},
                {"hash", std::string(log.hash)},
                {"nodes", std::string(log.node_info)}
            });
        }
        res.set_content(j.dump(), "application/json");
    });

    // On-Chain Integration
    svr.Get("/api/verify/(\\d+)", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        uint32_t id = std::stoi(req.matches[1]);
        auto meta = storage->getFileMetadata(id);
        if (meta.id != 0) {
            // Mock check for now
            res.set_content(json({
                {"onChain", true},
                {"match", true},
                {"hash", std::string(meta.hash)}
            }).dump(), "application/json");
        } else {
            res.status = 404;
        }
    });

    svr.Get("/api/onchain/(\\d+)", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        uint32_t id = std::stoi(req.matches[1]);
        auto meta = storage->getFileMetadata(id);
        if (meta.id != 0) {
            res.set_content(json({
                {"owner", std::string(meta.owner_wallet)},
                {"fileId", std::to_string(meta.id)},
                {"hash", std::string(meta.hash)},
                {"size", meta.size},
                {"timestamp", meta.upload_date}
            }).dump(), "application/json");
        } else {
            res.status = 404;
        }
    });

    svr.Get("/api/public/file", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        std::string token = req.get_param_value("token");
        auto f = storage->getFileByToken(token);
        if (f.id != 0) {
            res.set_content(json({
                {"id", f.id},
                {"name", std::string(f.filename)},
                {"size", f.size},
                {"hash", std::string(f.hash)},
                {"date", std::string(f.upload_date)}
            }).dump(), "application/json");
        } else {
            res.status = 404;
            res.set_content("{\"error\": \"Invalid token\"}", "application/json");
        }
    });

    // Render.com Keep-Alive: Ping itself and frontend every 13 mins to prevent sleeping
    std::thread([]() {
        const char* backend_url = std::getenv("PUBLIC_BACKEND_URL");
        const char* frontend_url = std::getenv("PUBLIC_FRONTEND_URL");
        
        if (backend_url || frontend_url) {
            std::cout << "[Keep-Alive] Started monitoring thread" << std::endl;
            std::cout.flush();
            while (true) {
                // Wait 13 minutes (Render's limit is 15 mins)
                std::this_thread::sleep_for(std::chrono::minutes(13));
                
                if (backend_url) {
                    std::cout << "[Keep-Alive] Pinging backend: " << backend_url << std::endl;
                    std::cout.flush();
                    std::string cmd = "curl -s " + std::string(backend_url) + "/health > /dev/null &";
                    (void)std::system(cmd.c_str());
                }
                
                if (frontend_url) {
                    std::cout << "[Keep-Alive] Pinging frontend: " << frontend_url << std::endl;
                    std::cout.flush();
                    std::string cmd = "curl -s " + std::string(frontend_url) + "/api/health > /dev/null &";
                    (void)std::system(cmd.c_str());
                }
            }
        } else {
            std::cout << "[Keep-Alive] No URLs provided (PUBLIC_BACKEND_URL/PUBLIC_FRONTEND_URL), skipping ping thread" << std::endl;
            std::cout.flush();
        }
    }).detach();

    std::cout << "VAULT Engine v2.0 running on port " << port << std::endl;
    std::cout.flush();
    svr.listen("0.0.0.0", port);
}
} // namespace vault
