#include "vault.hpp"
#include "../external/httplib.h"
#include "../external/json.hpp"
#include <iostream>
#include <regex>
#include <ctime>

using json = nlohmann::json;

namespace vault {

// AES-256 encryption key (32 bytes / 256 bits)
// For production deployments, set VAULT_ENCRYPTION_KEY environment variable
static std::string getEncryptionKey() {
    const char* env_key = std::getenv("VAULT_ENCRYPTION_KEY");
    if (env_key && std::strlen(env_key) == 32) {
        return std::string(env_key);
    }
    // Default key for local development - MUST be 32 bytes for AES-256
    return "VaultSecure256BitKeyForAES!!!!!!";
}

VaultServer::VaultServer(int port) : port(port) {
    storage = std::make_unique<StorageManager>("vault.vdb");
    storage->init();
}

void VaultServer::run() {
    httplib::Server svr;

    // CORS Preflight
    svr.Options("/(.*)", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, X-Filename, X-Wallet-Address, Authorization");
        res.status = 204;
    });

    // Health Check
    svr.Get("/health", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_content("{\"status\": \"operational\", \"engine\": \"VaultDB v1.0\"}", "application/json");
    });

    // List Files
    svr.Get("/api/files", [this](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto files = storage->listFiles();
        json j = json::array();
        for (const auto& f : files) {
            j.push_back({
                {"id", f.id},
                {"name", std::string(f.filename)},
                {"size", f.size},
                {"date", std::string(f.upload_date)},
                {"hash", std::string(f.hash)},
                {"shards", f.shard_count},
                {"contentType", std::string(f.content_type)}
            });
        }
        res.set_content(j.dump(), "application/json");
    });

    // Upload File
    svr.Post("/api/upload", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        std::string wallet = "unknown";
        bool authenticated = false;

        // Check for API Key Authentication
        if (req.has_header("Authorization")) {
            std::string auth = req.get_header_value("Authorization");
            if (auth.find("Bearer ") == 0) {
                std::string key = auth.substr(7);
                std::string keyWallet;
                if (storage->validateApiKey(key, keyWallet)) {
                    wallet = keyWallet;
                    authenticated = true;
                }
            }
        }

        // Fallback to Header for Dev/Legacy (if not authenticated via Key)
        if (!authenticated && req.has_header("X-Wallet-Address")) {
            wallet = req.get_header_value("X-Wallet-Address");
        }
        
        if (req.form.has_file("file")) {
            auto file = req.form.get_file("file");
            std::vector<uint8_t> data(file.content.begin(), file.content.end());
            std::string hash = CryptoHelper::hashData(data);
            auto encrypted = CryptoHelper::encrypt(data, getEncryptionKey());
            
            std::string fname = file.filename.empty() ? "uploaded_file" : file.filename;
            std::string content_type = file.content_type.empty() ? "application/octet-stream" : file.content_type;
            
            int id = storage->storeFile(fname, encrypted, hash, content_type);
            
            // Log activity
            std::string nodeInfo = authenticated ? "API Node (Auth)" : "Dev Node (Public)";
            storage->logActivity("Upload", "Success", fname, nodeInfo, hash, wallet);
            
            res.set_content(json({{"status", "success"}, {"id", id}}).dump(), "application/json");
        } else if (!req.body.empty()) {
            std::vector<uint8_t> data(req.body.begin(), req.body.end());
            std::string hash = CryptoHelper::hashData(data);
            auto encrypted = CryptoHelper::encrypt(data, getEncryptionKey());
            
            std::string filename = req.has_header("X-Filename") ? req.get_header_value("X-Filename") : "uploaded_file";
            
            int id = storage->storeFile(filename, encrypted, hash);
            std::string nodeInfo = authenticated ? "API Node (Auth)" : "Dev Node (Public)";
            storage->logActivity("Upload", "Success", filename, nodeInfo, hash, wallet);
            
            res.set_content(json({{"status", "success"}, {"id", id}}).dump(), "application/json");
        } else {
            res.status = 400;
            res.set_content("{\"error\": \"No file uploaded\"}", "application/json");
        }
    });

    // Download File
    svr.Get("/api/download/(\\d+)", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        std::string path = req.path;
        std::regex re("/api/download/(\\d+)");
        std::smatch match;
        
        if (std::regex_match(path, match, re) && match.size() > 1) {
            int id = std::stoi(match[1].str());
            auto encrypted = storage->getFile(id);
            auto meta = storage->getFileMetadata(id);
            
            if (!encrypted.empty()) {
                auto decrypted = CryptoHelper::decrypt(encrypted, getEncryptionKey());
                std::string content_type = std::string(meta.content_type).empty() ? "application/octet-stream" : std::string(meta.content_type);
                res.set_header("Content-Disposition", "attachment; filename=\"" + std::string(meta.filename) + "\"");
                res.set_content(reinterpret_cast<const char*>(decrypted.data()), decrypted.size(), content_type.c_str());
            } else {
                res.status = 404;
                res.set_content("{\"error\": \"File not found\"}", "application/json");
            }
        } else {
            res.status = 400;
            res.set_content("{\"error\": \"Invalid file ID\"}", "application/json");
        }
    });

    // Preview PDF (encrypted URL with token)
    svr.Get("/api/preview/(\\d+)", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        std::string path = req.path;
        std::regex re("/api/preview/(\\d+)");
        std::smatch match;
        
        if (std::regex_match(path, match, re) && match.size() > 1) {
            int id = std::stoi(match[1].str());
            auto encrypted = storage->getFile(id);
            auto meta = storage->getFileMetadata(id);
            
            std::string filename = std::string(meta.filename);
            bool isPdf = filename.size() > 4 && filename.substr(filename.size() - 4) == ".pdf";
            
            if (!encrypted.empty() && isPdf) {
                auto decrypted = CryptoHelper::decrypt(encrypted, getEncryptionKey());
                res.set_header("Content-Type", "application/pdf");
                res.set_header("Content-Disposition", "inline; filename=\"" + filename + "\"");
                res.set_content(reinterpret_cast<const char*>(decrypted.data()), decrypted.size(), "application/pdf");
            } else if (!encrypted.empty()) {
                res.status = 400;
                res.set_content("{\"error\": \"File is not a PDF\"}", "application/json");
            } else {
                res.status = 404;
                res.set_content("{\"error\": \"File not found\"}", "application/json");
            }
        }
    });

    // Generate Preview Token
    svr.Post("/api/preview-token/(\\d+)", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        std::string path = req.path;
        std::regex re("/api/preview-token/(\\d+)");
        std::smatch match;
        
        if (std::regex_match(path, match, re) && match.size() > 1) {
            int id = std::stoi(match[1].str());
            uint64_t expiry = std::time(nullptr) + 3600; // 1 hour
            std::string token = CryptoHelper::generatePreviewToken(id, expiry);
            
            res.set_content(json({
                {"token", token},
                {"url", "/api/preview/" + std::to_string(id) + "?token=" + token},
                {"expires", expiry}
            }).dump(), "application/json");
        }
    });

    // Delete File
    svr.Delete("/api/files/(\\d+)", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        std::string wallet = req.has_header("X-Wallet-Address") ? req.get_header_value("X-Wallet-Address") : "unknown";
        std::string path = req.path;
        std::regex re("/api/files/(\\d+)");
        std::smatch match;
        
        if (std::regex_match(path, match, re) && match.size() > 1) {
            int id = std::stoi(match[1].str());
            auto meta = storage->getFileMetadata(id);
            
            if (storage->deleteFile(id)) {
                storage->logActivity("Delete", "Success", std::string(meta.filename), "System", std::string(meta.hash), wallet);
                res.set_content("{\"status\": \"deleted\"}", "application/json");
            } else {
                res.status = 404;
                res.set_content("{\"error\": \"File not found\"}", "application/json");
            }
        }
    });

    // Activity Log
    svr.Get("/api/activity", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        uint32_t limit = 50;
        if (req.has_param("limit")) {
            limit = std::stoi(req.get_param_value("limit"));
        }
        
        auto logs = storage->getActivityLog(limit);
        json j = json::array();
        for (const auto& log : logs) {
            j.push_back({
                {"id", log.id},
                {"type", std::string(log.event_type)},
                {"status", std::string(log.status)},
                {"name", std::string(log.resource_name)},
                {"nodes", std::string(log.node_info)},
                {"time", std::string(log.timestamp)},
                {"hash", std::string(log.hash)},
                {"wallet", std::string(log.wallet_address)}
            });
        }
        res.set_content(j.dump(), "application/json");
    });

    // Get Capacity
    svr.Get("/api/capacity", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        std::string wallet = req.has_header("X-Wallet-Address") ? req.get_header_value("X-Wallet-Address") : "default";
        auto cap = storage->getCapacity(wallet);
        
        res.set_content(json({
            {"usedBytes", cap.used_bytes},
            {"maxBytes", cap.max_bytes},
            {"tier", cap.tier},
            {"tierName", cap.tier == 0 ? "Free" : cap.tier == 1 ? "Pro" : "Enterprise"}
        }).dump(), "application/json");
    });

    // Upgrade Capacity
    svr.Post("/api/capacity/upgrade", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        try {
            auto body = json::parse(req.body);
            std::string wallet = body.value("wallet", "default");
            uint32_t tier = body.value("tier", 1);
            
            if (storage->upgradeCapacity(wallet, tier)) {
                auto cap = storage->getCapacity(wallet);
                res.set_content(json({
                    {"status", "success"},
                    {"usedBytes", cap.used_bytes},
                    {"maxBytes", cap.max_bytes},
                    {"tier", cap.tier},
                    {"tierName", cap.tier == 0 ? "Free" : cap.tier == 1 ? "Pro" : "Enterprise"}
                }).dump(), "application/json");
            } else {
                res.status = 500;
                res.set_content("{\"error\": \"Upgrade failed\"}", "application/json");
            }
        } catch (...) {
            res.status = 400;
            res.set_content("{\"error\": \"Invalid request body\"}", "application/json");
        }
    });
    
    // Generate API Key
    svr.Post("/api/keys/generate", [this](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        try {
            auto body = json::parse(req.body);
            std::string wallet = body.value("wallet", "");
            
            if (wallet.empty()) {
                res.status = 400;
                res.set_content("{\"error\": \"Wallet address required\"}", "application/json");
                return;
            }
            
            std::string apiKey = AuthProvider::generate_jwt(wallet);
            
            // Persist the key
            storage->storeApiKey(wallet, apiKey);
            
            // Log this security event
            storage->logActivity("KeyGen", "Success", "New API Secret", "Auth Node", "******", wallet);
            
            res.set_content(json({
                {"status", "success"},
                {"key", apiKey},
                {"type", "live_secret"},
                {"created", std::time(nullptr)}
            }).dump(), "application/json");
        } catch (...) {
            res.status = 400;
            res.set_content("{\"error\": \"Invalid request\"}", "application/json");
        }
    });

    std::cout << "==================================" << std::endl;
    std::cout << "  VAULT Engine v1.0" << std::endl;
    std::cout << "  Listening on port " << port << std::endl;
    std::cout << "==================================" << std::endl;
    std::cout << "Endpoints:" << std::endl;
    std::cout << "  GET    /health" << std::endl;
    std::cout << "  GET    /api/files" << std::endl;
    std::cout << "  POST   /api/upload" << std::endl;
    std::cout << "  GET    /api/download/:id" << std::endl;
    std::cout << "  GET    /api/preview/:id" << std::endl;
    std::cout << "  DELETE /api/files/:id" << std::endl;
    std::cout << "  GET    /api/activity" << std::endl;
    std::cout << "  GET    /api/capacity" << std::endl;
    std::cout << "  POST   /api/capacity/upgrade" << std::endl;
    std::cout << "==================================" << std::endl;
    
    svr.listen("0.0.0.0", port);
}

} // namespace vault
