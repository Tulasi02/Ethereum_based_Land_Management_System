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
        Rejected
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
    }

    function showLandRequests(string memory _id, address _account, RequestStatus _status) public {
        LandRequestAccess[_account][_id] = _status;
    }

    function removeAsset(address _account, string memory _value) private {
        uint len = UserAssets[_account].length;
        uint j = 0;
        string[] memory tempArray = new string[](len - 1);
        for (uint i = 0; i < len; i++) {
            if (
                keccak256(abi.encodePacked(UserAssets[_account][i])) ==
                keccak256(abi.encodePacked(_value))
            ) {
                tempArray[j] = (UserAssets[_account][i]);
                j++;
            }
        }
        UserAssets[_account] = tempArray;
    }

    function removeRequestAccess(string memory _id) private {
        for (uint i = 0; i < InterestedBuyers[_id].length; i++) {
            delete LandRequestAccess[InterestedBuyers[_id][i]][_id];
        }
    }

    function removeFromLandForSale(string memory _id) private {
        for (uint i = 0; i < LandsforSale.length; i++) {
            if (keccak256(abi.encodePacked(LandsforSale[i])) == keccak256(abi.encodePacked(_id))) {
                LandsforSale[i] = LandsforSale[LandsforSale.length - 1];
                break;
            }
        }
        LandsforSale.pop();
    }

    function changeOwnership(string memory _id, address _oldAccount, address _newAccount, bool _transfered) public {
        if (_transfered) {
            Lands[_id].ownerAccount = _newAccount;
            removeAsset(_oldAccount, _id);
            UserAssets[_newAccount].push(_id);
            removeRequestAccess(_id);
            delete InterestedBuyers[_id];
            removeFromLandForSale(_id);
            Lands[_id].sell = false;
        }
    }
}
