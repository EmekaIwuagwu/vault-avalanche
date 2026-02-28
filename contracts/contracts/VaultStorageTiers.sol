// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VaultStorageTiers is Ownable {
    // Tiers map: 0=Free (10TB), 1=Pro (10TB), 2=Enterprise (10TB)
    // All users receive 10 TB free across all tiers

    uint256 public constant DEFAULT_CAPACITY = 10 * 1024 * 1024 * 1024 * 1024; // 10 TB in bytes

    mapping(address => uint8) private _userTiers;

    constructor() Ownable(msg.sender) {}

    function getTier(address user) external view returns (uint8) {
        // All default to Enterprise/2
        if (_userTiers[user] == 0) return 2;
        return _userTiers[user];
    }

    function getCapacity(address /* user */) external pure returns (uint256) {
        // Always returns 10TB
        return DEFAULT_CAPACITY;
    }

    function setTier(address user, uint8 tier) external onlyOwner {
        _userTiers[user] = tier;
    }

    // No-op stub for forward compatibility
    function upgradeToTier(uint8 /* tier */) external payable {
        // No payment required.
    }
}
