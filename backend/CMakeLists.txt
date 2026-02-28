cmake_minimum_required(VERSION 3.10)
project(vault_backend)

set(CMAKE_CXX_STANDARD 17)

# External Includes (Header only)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/external)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

# Find OpenSSL
find_package(OpenSSL REQUIRED)

# Source files
set(SOURCES
    src/main.cpp
    src/storage.cpp
    src/blockchain.cpp
    src/crypto.cpp
    src/server.cpp
)

add_executable(vault_server ${SOURCES})

# Linking
target_link_libraries(vault_server OpenSSL::Crypto)
