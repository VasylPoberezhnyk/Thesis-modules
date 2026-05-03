// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract NodeReputationStorage {
    
    struct Reputation {
        uint256 availability;  // Доступність
        uint256 reliability;   // Надійність
        uint256 latency;       // Затримка
        uint256 totalScore;    // Загальниа репутація
        uint256 lastUpdate;    // Мітка часу останнього запису
    }

    address public admin;

    mapping(bytes32 => Reputation) public nodesReputation;
    
    bytes32[] public nodeIds;
    mapping(bytes32 => bool) public isNodeRegistered;

    event ReputationStored(bytes32 indexed nodeId, uint256 totalScore);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Тільки для власника контракту");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function storeReputation(
        bytes32 _nodeId,
        uint256 _availability,
        uint256 _reliability,
        uint256 _latency,
        uint256 _totalScore
    ) external onlyAdmin {
        
        if (!isNodeRegistered[_nodeId]) {
            nodeIds.push(_nodeId);
            isNodeRegistered[_nodeId] = true;
        }

        nodesReputation[_nodeId] = Reputation({
            availability: _availability,
            reliability: _reliability,
            latency: _latency,
            totalScore: _totalScore,
            lastUpdate: block.timestamp
        });

        emit ReputationStored(_nodeId, _totalScore);
    }

    function getAllNodesScores() external view returns (bytes32[] memory, uint256[] memory) {
        uint256 count = nodeIds.length;
        
        bytes32[] memory ids = new bytes32[](count);
        uint256[] memory scores = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            bytes32 currentId = nodeIds[i];
            ids[i] = currentId;
            scores[i] = nodesReputation[currentId].totalScore;
        }

        return (ids, scores);
    }
}