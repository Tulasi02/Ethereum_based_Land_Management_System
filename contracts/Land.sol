// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract Land {
    
    address owner;

    uint countOfGovtOfficials;

    struct User {
        address id;
        string name;
        string email;
        bool isMember;
        bool isOfficial;
        uint govtId;
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
        uint id;
        string landAddress;
        uint price;
        string ipfsHash;
        address ownerAccount;
        LandStatus status;
        uint approved;
        uint rejected;
    }

    mapping(address => User) public Users;
    mapping(address => User) public GovtOfficial;
    mapping(address => uint[]) public UserAssets;
    mapping(uint => LandDetails) public Lands;
    mapping(uint => LandDetails) public RegisteredLands;
    mapping(uint => LandDetails) public ApprovedLands;
    mapping(uint => LandDetails) public RejectedLands;
    mapping(uint => LandDetails) public BuyableLands;
    mapping(uint => address[]) public InterestedBuyers;
    mapping(address => mapping(uint => RequestStatus)) public LandRequestAccess;

    constructor() {
        owner = msg.sender;
    }

    function addUser(address _id, string memory _name, string memory _email, bool _isOffical, uint _govtId) public {
        Users[_id] = User(_id, _name, _email, true, _isOffical, _govtId);
        if (_isOffical) {
            GovtOfficial[_id] = Users[_id];
            countOfGovtOfficials++;
        }
    }

    function registerLand(uint _id, string memory _landAddress, uint _price, string memory _ipfsHash, address _ownerAccount) public {
        Lands[_id] = LandDetails(_id, _landAddress, _price, _ipfsHash, _ownerAccount, LandStatus.Registered, 0, 0);
        RegisteredLands[_id] = Lands[_id];
        UserAssets[_ownerAccount].push(_id);
    }

    function changeStatus(uint _id, bool _approved) public {
        if (_approved) {
            Lands[_id].approved++;
        }
        else {
            Lands[_id].rejected++;
        }
        if (Lands[_id].approved > (countOfGovtOfficials / 2)) {
            Lands[_id].status = LandStatus.Approved;
            ApprovedLands[_id] = Lands[_id];
            delete RegisteredLands[_id];

        }
        else if (Lands[_id].rejected >= (countOfGovtOfficials / 2)) {
            Lands[_id].status = LandStatus.Rejected;
            RejectedLands[_id] = Lands[_id];
            delete RegisteredLands[_id];
        }
    }

    function auctionLand(uint _id) public {
        BuyableLands[_id] = Lands[_id];
    }

    function requestLandDetails(uint _id, address _account) public {
        LandRequestAccess[_account][_id] = RequestStatus.Pending;
    }

    function showLandRequests(uint _id, address _account, RequestStatus _status) public {
        LandRequestAccess[_account][_id] = _status;
    }

    function removeAsset(address _account, uint _value) private {
        uint len = UserAssets[_account].length;
        uint j = 0;
        uint[] memory tempArray = new uint[](len - 1);
        for (uint i = 0; i < len; i++) {
            if (UserAssets[_account][i] != _value) {
                tempArray[j] = (UserAssets[_account][i]);
                j++;
            }
        }
        UserAssets[_account] = tempArray;
    }

    function removeRequestAccess(uint _id) private {
        for (uint i = 0; i < InterestedBuyers[_id].length; i++) {
            delete LandRequestAccess[InterestedBuyers[_id][i]][_id];
        }
    }

    function changeOwnership(uint _id, address _oldAccount, address _newAccount, bool _transfered) public {
        if (_transfered) {
            Lands[_id].ownerAccount = _newAccount;
            removeAsset(_oldAccount, _id); 
            UserAssets[_newAccount].push(_id);
            ApprovedLands[_id].ownerAccount = _newAccount;
            delete BuyableLands[_id];
            removeRequestAccess(_id);
            delete InterestedBuyers[_id];
        }
    }

}