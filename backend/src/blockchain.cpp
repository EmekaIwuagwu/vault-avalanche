#include "vault.hpp"
#include "../external/httplib.h"
#include "../external/json.hpp"
#include <iostream>
#include <array>
#include <cstdio>

using json = nlohmann::json;

namespace vault {

// Implementation of BlockchainHelper declared in vault.hpp

static std::string callRpc(const std::string& method, const json& params) {
    const char* rpc_url = std::getenv("AVALANCHE_FUJI_RPC_URL");
    if (!rpc_url) rpc_url = "https://api.avax-test.network/ext/bc/C/rpc";

    // Parse host and path from URL
    std::string url_str(rpc_url);
    size_t host_start = url_str.find("://") + 3;
    size_t path_start = url_str.find("/", host_start);
    std::string host = url_str.substr(host_start, path_start - host_start);
    std::string path = url_str.substr(path_start);

    httplib::Client cli(host.c_str());
    json body = {
        {"jsonrpc", "2.0"},
        {"id", 1},
        {"method", method},
        {"params", params}
    };

    auto res = cli.Post(path.c_str(), body.dump(), "application/json");
    if (res && res->status == 200) {
        return res->body;
    }
    return "";
}

static std::string exec(const std::string& cmd) {
    std::array<char, 128> buffer;
    std::string result;
#ifdef _WIN32
    FILE* pipe = _popen(cmd.c_str(), "r");
#else
    FILE* pipe = popen(cmd.c_str(), "r");
#endif
    if (!pipe) return "";
    while (fgets(buffer.data(), buffer.size(), pipe) != nullptr) {
        result += buffer.data();
    }
#ifdef _WIN32
    _pclose(pipe);
#else
    pclose(pipe);
#endif
    return result;
}

std::string BlockchainHelper::registerFileOnChain(const std::string& owner, const std::string& fileId, const std::string& hashStr, uint64_t size, uint32_t shards) {
    std::string cmd = "node scripts/blockchain_proxy.js register " + owner + " " + fileId + " " + hashStr + " " + std::to_string(size) + " " + std::to_string(shards);
    std::cout << "[Blockchain] Executing: " << cmd << std::endl;
    
    std::string output = exec(cmd);
    std::cout << "[Blockchain] Output: " << output << std::endl;
    
    try {
        auto j = json::parse(output);
        if (j.contains("txHash")) {
            return j["txHash"].get<std::string>();
        }
    } catch (...) {
        return "";
    }
    return "";
}

std::string BlockchainHelper::getOnChainRecord(const std::string& fileId) {
    std::string cmd = "node scripts/blockchain_proxy.js read " + fileId;
    std::string output = exec(cmd);
    return output;
}

} // namespace vault
