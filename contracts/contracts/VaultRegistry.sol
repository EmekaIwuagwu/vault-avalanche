// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VaultRegistry is Ownable {
    struct FileRecord {
        address owner;
        string fileId;
        bytes32 sha256Hash;
        uint256 fileSize;
        uint256 shardCount;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => FileRecord) private _records;

    event FileRegistered(
        string indexed fileId,
        address indexed owner,
        bytes32 hash
    );
    event FileRevoked(string indexed fileId);
    event FileVerified(string indexed fileId, bool success);

    constructor() Ownable(msg.sender) {}

    function registerFile(
        address owner,
        string memory fileId,
        bytes32 sha256Hash,
        uint256 fileSize,
        uint256 shardCount,
        uint256 timestamp
    ) external {
        _records[fileId] = FileRecord({
            owner: owner,
            fileId: fileId,
            sha256Hash: sha256Hash,
            fileSize: fileSize,
            shardCount: shardCount,
            timestamp: timestamp,
            exists: true
        });
        emit FileRegistered(fileId, owner, sha256Hash);
    }

    function verifyFile(
        string memory fileId,
        bytes32 providedHash
    ) external returns (bool) {
        bool success = _records[fileId].exists &&
            _records[fileId].sha256Hash == providedHash;
        emit FileVerified(fileId, success);
        return success;
    }

    function getFileRecord(
        string memory fileId
    ) external view returns (FileRecord memory) {
        require(_records[fileId].exists, "File does not exist");
        return _records[fileId];
    }

    function revokeFile(string memory fileId) external {
        require(_records[fileId].exists, "File does not exist");
        require(
            _records[fileId].owner == msg.sender || msg.sender == owner(),
            "Not authorized"
        );
        _records[fileId].exists = false;
        emit FileRevoked(fileId);
    }
}
