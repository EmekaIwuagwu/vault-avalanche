// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VaultAccess is Ownable {
    // Roles: 0=view, 1=download, 2=manage
    mapping(string => mapping(address => uint8)) private _permissions;
    mapping(string => address[]) private _accessList;
    mapping(string => mapping(address => bool)) private _hasEntry;

    event AccessGranted(
        string indexed fileId,
        address indexed grantee,
        uint8 role
    );
    event AccessRevoked(string indexed fileId, address indexed grantee);

    constructor() Ownable(msg.sender) {}

    function grantAccess(
        string memory fileId,
        address grantee,
        uint8 role
    ) external {
        _permissions[fileId][grantee] = role;
        if (!_hasEntry[fileId][grantee]) {
            _accessList[fileId].push(grantee);
            _hasEntry[fileId][grantee] = true;
        }
        emit AccessGranted(fileId, grantee, role);
    }

    function revokeAccess(string memory fileId, address grantee) external {
        _permissions[fileId][grantee] = 0;
        _hasEntry[fileId][grantee] = false;
        // Note: For gas efficiency, we don't remove from _accessList array,
        // seekers should check hasAccess or we can filter in getter if needed.
        emit AccessRevoked(fileId, grantee);
    }

    function hasAccess(
        string memory fileId,
        address user,
        uint8 role
    ) external view returns (bool) {
        return _permissions[fileId][user] >= role && _hasEntry[fileId][user];
    }

    function getAccessList(
        string memory fileId
    ) external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < _accessList[fileId].length; i++) {
            if (_hasEntry[fileId][_accessList[fileId][i]]) {
                count++;
            }
        }

        address[] memory activeGrantees = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < _accessList[fileId].length; i++) {
            address grantee = _accessList[fileId][i];
            if (_hasEntry[fileId][grantee]) {
                activeGrantees[index] = grantee;
                index++;
            }
        }
        return activeGrantees;
    }
}
