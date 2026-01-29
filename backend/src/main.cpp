#include "vault.hpp"
#include <iostream>

int main() {
    try {
        vault::VaultServer server(8081);
        server.run();
    } catch (const std::exception& e) {
        std::cerr << "Fatal error: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}
