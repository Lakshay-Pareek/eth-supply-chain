// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ProduceRegistry
 *
 * A role-gated registry to trace agricultural produce batches from farm to consumer.
 * Roles: Admin (deployer), Farmer, Distributor, Retailer.
 * Tracks: origin, quality, price, current owner, and transfer history.
 */
contract ProduceRegistry {
    // ----- Roles -----
    enum Role {
        None,
        Farmer,
        Distributor,
        Retailer
    }

    address public immutable admin;

    mapping(address => Role) public userRoles;

    // ----- Produce Batch -----
    struct TransferRecord {
        address from;
        address to;
        Role toRole;
        uint256 timestamp;
        string note; // e.g., location, handling notes
    }

    struct Batch {
        uint256 id;
        string metadataCID; // IPFS/HTTPS pointer for rich metadata
        string originFarm; // human-readable origin
        string cropType; // e.g., "Tomatoes"
        uint256 harvestDate; // unix time
        uint256 qualityScore; // 0-100
        uint256 unitPriceWei; // current asking price per unit in wei
        address currentOwner;
        Role currentOwnerRole;
        bool finalized; // if true, batch no longer transferable (sold to consumer)
        TransferRecord[] history;
    }

    uint256 public nextBatchId = 1;
    mapping(uint256 => Batch) private batches;

    // ----- Events -----
    event UserRoleUpdated(address indexed user, Role role);
    event BatchCreated(
        uint256 indexed batchId,
        address indexed creator,
        string cropType,
        string originFarm
    );
    event BatchTransferred(
        uint256 indexed batchId,
        address indexed from,
        address indexed to,
        Role toRole,
        string note
    );
    event BatchUpdated(
        uint256 indexed batchId,
        uint256 qualityScore,
        uint256 unitPriceWei
    );
    event BatchFinalized(uint256 indexed batchId, address indexed retailer);

    // ----- Modifiers -----
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyRole(Role r) {
        require(userRoles[msg.sender] == r, "Invalid role");
        _;
    }

    modifier onlyOwner(uint256 batchId) {
        require(batches[batchId].currentOwner == msg.sender, "Not owner");
        _;
    }

    constructor() {
        admin = msg.sender;
        userRoles[msg.sender] = Role.Farmer; // Admin may also operate as a Farmer if desired
        emit UserRoleUpdated(msg.sender, Role.Farmer);
    }

    // ----- Admin: manage roles -----
    function setUserRole(address user, Role role) external onlyAdmin {
        userRoles[user] = role;
        emit UserRoleUpdated(user, role);
    }

    // ----- Farmer: create batches -----
    function createBatch(
        string calldata metadataCID,
        string calldata originFarm,
        string calldata cropType,
        uint256 harvestDate,
        uint256 qualityScore,
        uint256 unitPriceWei
    ) external onlyRole(Role.Farmer) returns (uint256 batchId) {
        require(qualityScore <= 100, "quality 0-100");
        batchId = nextBatchId++;

        Batch storage b = batches[batchId];
        b.id = batchId;
        b.metadataCID = metadataCID;
        b.originFarm = originFarm;
        b.cropType = cropType;
        b.harvestDate = harvestDate;
        b.qualityScore = qualityScore;
        b.unitPriceWei = unitPriceWei;
        b.currentOwner = msg.sender;
        b.currentOwnerRole = Role.Farmer;

        b.history.push(
            TransferRecord({
                from: address(0),
                to: msg.sender,
                toRole: Role.Farmer,
                timestamp: block.timestamp,
                note: "Batch created"
            })
        );

        emit BatchCreated(batchId, msg.sender, cropType, originFarm);
    }

    // ----- Owner actions: update quality/price -----
    function updateQualityAndPrice(
        uint256 batchId,
        uint256 qualityScore,
        uint256 unitPriceWei
    ) external onlyOwner(batchId) {
        require(qualityScore <= 100, "quality 0-100");
        Batch storage b = batches[batchId];
        require(!b.finalized, "finalized");
        b.qualityScore = qualityScore;
        b.unitPriceWei = unitPriceWei;
        emit BatchUpdated(batchId, qualityScore, unitPriceWei);
    }

    // ----- Transfer ownership along the chain -----
    function transferBatch(
        uint256 batchId,
        address to,
        string calldata note
    ) external onlyOwner(batchId) {
        require(to != address(0), "to required");
        Batch storage b = batches[batchId];
        require(!b.finalized, "finalized");

        Role toRole = userRoles[to];
        require(toRole != Role.None, "recipient unregistered");

        // enforce forward-only flow: Farmer -> Distributor -> Retailer
        if (b.currentOwnerRole == Role.Farmer) {
            require(toRole == Role.Distributor, "must go to distributor");
        } else if (b.currentOwnerRole == Role.Distributor) {
            require(toRole == Role.Retailer, "must go to retailer");
        } else if (b.currentOwnerRole == Role.Retailer) {
            revert("retailer is end of chain");
        } else {
            revert("invalid state");
        }

        address from = b.currentOwner;
        b.currentOwner = to;
        b.currentOwnerRole = toRole;
        b.history.push(
            TransferRecord({
                from: from,
                to: to,
                toRole: toRole,
                timestamp: block.timestamp,
                note: note
            })
        );

        emit BatchTransferred(batchId, from, to, toRole, note);
    }

    // ----- Retailer finalizes: sold to consumer -----
    function finalizeToConsumer(
        uint256 batchId,
        string calldata note
    ) external onlyOwner(batchId) {
        Batch storage b = batches[batchId];
        require(b.currentOwnerRole == Role.Retailer, "only retailer");
        require(!b.finalized, "already finalized");
        b.finalized = true;
        b.history.push(
            TransferRecord({
                from: b.currentOwner,
                to: address(0),
                toRole: Role.None,
                timestamp: block.timestamp,
                note: note
            })
        );
        emit BatchFinalized(batchId, msg.sender);
    }

    // ----- Views -----
    function getBatch(
        uint256 batchId
    )
        external
        view
        returns (
            uint256 id,
            string memory metadataCID,
            string memory originFarm,
            string memory cropType,
            uint256 harvestDate,
            uint256 qualityScore,
            uint256 unitPriceWei,
            address currentOwner,
            Role currentOwnerRole,
            bool finalized
        )
    {
        Batch storage b = batches[batchId];
        require(b.id != 0, "not found");
        return (
            b.id,
            b.metadataCID,
            b.originFarm,
            b.cropType,
            b.harvestDate,
            b.qualityScore,
            b.unitPriceWei,
            b.currentOwner,
            b.currentOwnerRole,
            b.finalized
        );
    }

    function getHistoryLength(uint256 batchId) external view returns (uint256) {
        Batch storage b = batches[batchId];
        require(b.id != 0, "not found");
        return b.history.length;
    }

    function getHistoryRecord(
        uint256 batchId,
        uint256 index
    )
        external
        view
        returns (
            address from,
            address to,
            Role toRole,
            uint256 timestamp,
            string memory note
        )
    {
        Batch storage b = batches[batchId];
        require(b.id != 0, "not found");
        TransferRecord storage r = b.history[index];
        return (r.from, r.to, r.toRole, r.timestamp, r.note);
    }
}
