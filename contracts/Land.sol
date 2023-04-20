// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.1 <0.9.0;

contract Land {

    address owner;

    uint countOfGovtOfficials;

    struct User {
        address id;
        string name;
        string email;
        bool isMember;
        bool isOfficial;
        string govtId;
    }

    enum LandStatus {
        Registered,
        Approved,
        Rejected
    }

    enum RequestStatus {
        Pending,
        Accepted,
        Rejected,
        Sell
    }

    struct LandDetails {
        string id;
        string landAddress;
        uint price;
        string ipfsHash;
        string ownerName;
        address ownerAccount;
        LandStatus status;
        bool sell;
    }

    mapping(address => User) public Users;
    mapping(address => User) public GovtOfficial;
    mapping(address => string[]) public UserAssets;
    mapping(string => LandDetails) public Lands;
    mapping(string => address[]) public InterestedBuyers;
    mapping(address => mapping(string => RequestStatus)) public LandRequestAccess;
    mapping(LandStatus => string[]) Status;
    mapping(address => string[]) public requestedLands;
    mapping(string => bool) public ipfs;

    string[] public LandsforSale;

    constructor() {
        owner = msg.sender;
    }

    function addUser(address _id, string memory _name, string memory _email, string memory _govtId) public {
        bool isofficial = keccak256(abi.encodePacked(_govtId)) == keccak256(abi.encodePacked('')) ? false : true;
        Users[_id] = User(_id, _name, _email, true, isofficial, _govtId);
        if (isofficial) {
            GovtOfficial[_id] = Users[_id];
            countOfGovtOfficials++;
        }
    }

    function getRegisteredLands() public view returns (string[] memory) {
        return Status[LandStatus.Registered];
    }

    function registerLand(string memory _id, string memory _landAddress, uint _price, string memory _ipfsHash, address _ownerAccount) public {
        Lands[_id] = LandDetails(_id, _landAddress, _price, _ipfsHash, Users[_ownerAccount].name, _ownerAccount, LandStatus.Registered, false);
        ipfs[_ipfsHash] = true;
        UserAssets[_ownerAccount].push(_id);
        Status[LandStatus.Registered].push(_id);
    }

    function removeFromRegistered(string memory _id) private {
        for (uint i = 0; i < Status[LandStatus.Registered].length; i++) {
            if (keccak256(abi.encodePacked(Status[LandStatus.Registered][i])) == keccak256(abi.encodePacked(_id))) {
                Status[LandStatus.Registered][i] = Status[LandStatus.Registered][Status[LandStatus.Registered].length - 1];
                break;
            }
        }
        Status[LandStatus.Registered].pop();
    }

    function changeStatus(string[] memory _approvedLands, string[] memory _rejectedLands) public {
        for (uint i = 0; i < _approvedLands.length; i++) {
            Lands[_approvedLands[i]].status = LandStatus.Approved;
            Status[LandStatus.Approved].push(_approvedLands[i]);
            removeFromRegistered(_approvedLands[i]);
        }
        for (uint i = 0; i < _rejectedLands.length; i++) {
            Lands[_rejectedLands[i]].status = LandStatus.Rejected;
            Status[LandStatus.Rejected].push(_rejectedLands[i]);
            removeFromRegistered(_rejectedLands[i]);
        }
    }

    function auctionLand(string memory _id) public {
        if (Lands[_id].status == LandStatus.Approved) {
            Lands[_id].sell = true;
            LandsforSale.push(_id);
        }
    }

    function getAllLandsforSale() public view returns (string[] memory) {
        return LandsforSale;
    }

    function getUserAssets(address _id) public view returns (string[] memory) {
        return UserAssets[_id];
    }

    function requestLandDetails(string memory _id, address _account) public {
        LandRequestAccess[_account][_id] = RequestStatus.Pending;
        requestedLands[_account].push(_id);
        InterestedBuyers[_id].push(_account);
    }

    function getLandRequestAccess(string[] memory _id, address _account) public view returns (string[] memory) {
        string[] memory access = new string[](_id.length);
        for (uint i = 0; i < _id.length; i++) {
            RequestStatus x = LandRequestAccess[_account][_id[i]];
            access[i] = (x == RequestStatus.Pending ? "Pending" : (x == RequestStatus.Accepted ? "Accepted" : (x == RequestStatus.Rejected ? "Pending" : "Sell")));
        }
        return access;
    }

    function getRequestedLands(address _account) public view returns (string[] memory) {
        return requestedLands[_account];
    }

    function sellLand(string memory _id, address _account) public {
        LandRequestAccess[_account][_id] = RequestStatus.Sell;
    }

    function interested(string memory _id) public view returns (string[] memory, address[] memory) {
        string[] memory userNames = new string[](InterestedBuyers[_id].length);
        address[] memory userIds = new address[](InterestedBuyers[_id].length);
        for (uint i = 0; i < InterestedBuyers[_id].length; i++) {
            userNames[i] = Users[InterestedBuyers[_id][i]].name;
            userIds[i] = InterestedBuyers[_id][i];
        }
        return (userNames, userIds);
    }

    function requestApprove(address _account, string memory _id) public {
        LandRequestAccess[_account][_id] = RequestStatus.Accepted;
    }

    function requestReject(address _account, string memory _id) public {
        LandRequestAccess[_account][_id] = RequestStatus.Rejected;
    }

    function removeAsset(address _account, string memory _id) private {
        for (uint i = 0; i < UserAssets[_account].length; i++) {
            if (keccak256(abi.encodePacked(UserAssets[_account][i])) == keccak256(abi.encodePacked(_id))) {
                UserAssets[_account][i] = UserAssets[_account][UserAssets[_account].length - 1];
                break;
            }
        }
        UserAssets[_account].pop();
    }

    function removeRequestAccess(string memory _id) private {
        for (uint i = 0; i < InterestedBuyers[_id].length; i++) {
            delete LandRequestAccess[InterestedBuyers[_id][i]][_id];
        }
    }

    function removeFromLandForSale(string memory _id) private {
        if (LandsforSale.length == 1 && keccak256(abi.encodePacked(LandsforSale[0])) == keccak256(abi.encodePacked(_id))) {
            LandsforSale = new string[](0);
        }
        else {
            for (uint i = 0; i < LandsforSale.length; i++) {
                if (keccak256(abi.encodePacked(LandsforSale[i])) == keccak256(abi.encodePacked(_id))) {
                    LandsforSale[i] = LandsforSale[LandsforSale.length - 1];
                    break;
                }
            }
            LandsforSale.pop();
        }
    }

    function changeOwnership(string memory _id, address _newAccount) public {
        removeAsset(Lands[_id].ownerAccount, _id);
        Lands[_id].sell = false;
        Lands[_id].ownerName = Users[_newAccount].name;
        Lands[_id].ownerAccount = _newAccount;
        UserAssets[_newAccount].push(_id);
        removeRequestAccess(_id);
        delete InterestedBuyers[_id];
        removeFromLandForSale(_id);
    }
}
