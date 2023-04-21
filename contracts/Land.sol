// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.1 <0.9.0;

contract Land {

    address owner;
    uint countOfGovtOfficials;
    
    struct User {
        address account;
        string name;
        string email;
        string aadhaar;
        string pan;
        string image;
        string phoneno;
        bool registered;
        bool isMember;
        bool isOfficial;
        string govtId;
    }
    
    enum ChangeStatus {
        None,
        Pending,
        Accepted, 
        Rejected
    }
    
    enum RequestStatus {
        None,
        Pending,
        Accepted,
        Rejected,
        Sell
    }
    
    struct LandDetails {
        string id;
        string landAddress;
        string registeredBy;
        string registrationTime;
        uint price;
        string ipfsHash;
        string[] ownerAadhaar;
        uint[] share;
        bool jointOwnership;
        ChangeStatus[] status;
        string[] saleBy;
    }
    
    struct changeDetails {
        string id;
        string oldAadhaar;
        string newAadhaar;
        string time;
        string approvedBy;
    }
    
    mapping(string => User) public Users;
    mapping(string => User) public GovtOfficial;
    mapping(string => string[]) public UserAssets;
    mapping(string => LandDetails) public Lands;
    mapping(string => string[]) public InterestedBuyers;
    mapping(string => mapping(string => RequestStatus[])) public LandRequestAccess;
    mapping(bool => string[]) public checkMembership;
    mapping(string => string[]) public requestedLands;
    mapping(uint => changeDetails) public changeMap;
    
    string[] public UsersRegistered;
    string[] public LandsforSale;
    uint[] public change;
    
    constructor() {
        owner = msg.sender;
    }
    
    function findIndex(string[] memory array, string memory value) private pure returns (uint) {
        for (uint i = 0; i < array.length; i++) {
            if (keccak256(abi.encodePacked(array[i])) == keccak256(abi.encodePacked(value))) {
                return i;
            }
        }
        return 0;
    }

    function checkInArray(string memory _array, string memory _id) public view returns (bool) {
        for (uint i = 0; i < _array.length; i++) {
            if (keccak256(abi.encodePacked(array[i])) == keccak256(abi.encodePacked(value))) {
                return true;
            }
        }
        return false;
    }

    function getLandOwners(string memory _id) public view returns(string[] memory) {
        return Lands[_id].ownerAadhaar;
    }
    
    function getShares(string memory _id) public view returns (uint[] memory) {
        return Lands[_id].share;
    }
    
    function getStatus(string memory _id) public view returns (string[] memory) {
        string[] memory statusList = new string[](Lands[_id].status.length);
        for (uint i = 0; i < Lands[_id].status.length; i++) {
            statusList[i] = (Lands[_id].status[i] == ChangeStatus.None ? "None" : (Lands[_id].status[i] == ChangeStatus.Pending ? "Pending" : (Lands[_id].status[i] == ChangeStatus.Accepted ? "Accepted" : "Rejected")));
        }
        return statusList;
    }

    function getOwnerNames(string memory _id) public view returns (string[] memory) {
        string[] memory names = new string[](Lands[_id].ownerAadhaar.length);
        for (uint i = 0; i < Lands[_id].ownerAadhaar.length; i++) {
            names[i] = Users[Lands[_id].ownerAadhaar[i]].name;
        }
        return names;
    }

    function getSellerNames(string memory _id) public view returns (string[] memory) {
        string[] memory names = new string[](Lands[_id].saleBy.length);
        for (uint i = 0; i < Lands[_id].saleBy.length; i++) {
            names[i] = Users[Lands[_id].saleBy[i]].name;
        }
        return names;
    }

    function getSellerEmail(string memory _id) public view returns (string[] memory) {
        string[] memory emails = new string[](Lands[_id].ownerAadhaar.length);
        for (uint i = 0; i < Lands[_id].ownerAadhaar.length; i++) {
            emails[i] = Users[Lands[_id].ownerAadhaar[i]].name;
        }
        return emails;
    }
    
    function getSaleBy(string memory _id) public view returns (string[] memory) {
        return Lands[_id].saleBy;
    }
    
    function registerUser(address _account, string memory _name, string memory _email, string memory _aadhaar, string memory _pan, string memory _image, string memory _phoneno, string memory _govtId) public {
        bool isofficial = keccak256(abi.encodePacked(_govtId)) == keccak256(abi.encodePacked('')) ? false : true;
        Users[_aadhaar] = User(_account, _name, _email, _aadhaar, _pan, _image, _phoneno, true, (isofficial ? true : false), isofficial, _govtId);
        if (isofficial) {
            GovtOfficial[_aadhaar] = Users[_aadhaar];
            countOfGovtOfficials++;
        }
        else {
            UsersRegistered.push(_aadhaar);
        }
    }
    
    function removeFromRegistered(string memory _aadhaar) private {
        uint i = findIndex(UsersRegistered, _aadhaar);
        UsersRegistered[i] = UsersRegistered[UsersRegistered.length - 1];
        UsersRegistered.pop();
    }
    
    function addUser(string memory _aadhaar) public {
        removeFromRegistered(_aadhaar);
        Users[_aadhaar].isMember = true;
    }
    
    function getRegisteredUsers() public view returns (string[] memory) {
        return UsersRegistered;
    }
    
    function registerLand(string memory _id, string memory _landAddress, string memory _registeredBy, string memory _registrationTime, uint _price, string memory _ipfsHash, string[] memory _ownerAadhaar, uint[] memory _share, bool _jointOwnerShip) public {
        Lands[_id] = LandDetails(_id, _landAddress, _registeredBy, _registrationTime, _price, _ipfsHash, _ownerAadhaar, _share, _jointOwnerShip, new ChangeStatus[](0), new string[](0));
        for (uint i = 0; i < _ownerAadhaar.length; i++) {
            UserAssets[_ownerAadhaar[i]].push(_id);
        }
    }
    
    function auctionLand(string memory _aadhaar, string memory _id) public {
        for (uint i = 0; i < Lands[_id].status.length; i++) {
            if (Lands[_id].status[i] == ChangeStatus.None || Lands[_id].status[i] == ChangeStatus.Rejected) {
                bool k = checkInArray(LandsforSale, _id);
                if (k == false) {
                    LandsforSale.push(_id);
                }
                Lands[_id].saleBy.push(_aadhaar);
                Lands[_id].status.push(ChangeStatus.None);
            }
        }
    }
    
    function getAllLandsforSale() public view returns (string[] memory) {
        return LandsforSale;
    }
    
    function getUserAssets(string memory _aadhaar) public view returns (string[] memory) {
        return UserAssets[_aadhaar];
    }

    
    
    function requestLandDetails(string memory _id, string memory _aadhaar, string memory _seller) public {
        RequestStatus[] memory access = new RequestStatus[](Lands[_id].saleBy.length);
        for (uint i = 0; i < Lands[_id].saleBy.length; i++) {
            if (LandRequestAccess[_aadhaar][_id][i] != RequestStatus.Pending) {
                access[i] = LandRequestAccess[_aadhaar][_id][i];
            }
            else {
                access[i] = RequestStatus.Pending;
            }
        }
        LandRequestAccess[_aadhaar][_id] = access;
        requestedLands[_aadhaar].push(_id);
        InterestedBuyers[_id].push(_aadhaar);
    }
    
    function getLandRequestAccess(string memory _id, string memory _aadhaar) public view returns (string[] memory) {
        string[] memory access = new string[](Lands[_id].saleBy.length);
        for (uint i = 0; i < LandRequestAccess[_aadhaar][_id].length; i++) {
            RequestStatus x = LandRequestAccess[_aadhaar][_id][i];
            access[i] = (x == RequestStatus.Pending ? "Pending" : (x == RequestStatus.Accepted ? "Accepted" : (x == RequestStatus.Rejected ? "Pending" : "Sell")));
        }
        return access;
    }
    
    function getRequestedLands(string memory _aadhaar) public view returns (string[] memory) {
        return requestedLands[_aadhaar];
    }
    
    function sellLand(string memory _id, string memory _aadhaar, string memory _seller) public {
        uint i = findIndex(Lands[_id].saleBy, _seller);
        LandRequestAccess[_aadhaar][_id][i] = RequestStatus.Sell;
    }
    
    function interested(string memory _id) public view returns (string[] memory, string[] memory) {
        string[] memory usersNames = new string[](InterestedBuyers[_id].length);
        string[] memory usersAadhaar = new string[](InterestedBuyers[_id].length);
        for (uint i = 0; i < InterestedBuyers[_id].length; i++) {
            usersNames[i] = Users[InterestedBuyers[_id][i]].name;
            usersAadhaar[i] = InterestedBuyers[_id][i];
        }
        return (usersNames, usersAadhaar);
    }
    
    function requestApprove(string memory _aadhaar, string memory _id, string memory _seller) public {
        uint i = findIndex(Lands[_id].saleBy, _seller);
        LandRequestAccess[_aadhaar][_id][i] = RequestStatus.Accepted;
    }
    
    function requestReject(string memory _aadhaar, string memory _id, string memory _seller) public {
        uint i = findIndex(Lands[_id].saleBy, _seller);
        LandRequestAccess[_aadhaar][_id][i] = RequestStatus.Rejected;
    }
    
    function removeAsset(string memory _aadhaar, string memory _id) private {
        uint i = findIndex(UserAssets[_aadhaar], _id);
        UserAssets[_aadhaar][i] = UserAssets[_aadhaar][UserAssets[_aadhaar].length - 1];
        UserAssets[_aadhaar].pop();
    }
    
    function removeRequestAccess(string memory _id, string memory _seller) private {
        for (uint i = 0; i < InterestedBuyers[_id].length; i++) {
            uint j = findIndex(Lands[_id].saleBy, _seller);
            LandRequestAccess[InterestedBuyers[_id][i]][_id][j] = LandRequestAccess[InterestedBuyers[_id][i]][_id][LandRequestAccess[InterestedBuyers[_id][i]][_id].length - 1];
            LandRequestAccess[InterestedBuyers[_id][i]][_id].pop();
        }
    }
    
    function changeInLandDetails(string memory _id, string memory _aadhaar) private {
        uint i = findIndex(Lands[_id].ownerAadhaar, _aadhaar);
        Lands[_id].saleBy[i] = Lands[_id].saleBy[Lands[_id].saleBy.length - 1];
        Lands[_id].saleBy.pop();
        Lands[_id].status[i] = Lands[_id].status[Lands[_id].status.length - 1];
        Lands[_id].status.pop();
    }
    
    function check(string memory _id, string memory _aadhaar, uint i) private {
        bool exist = false;
        for (uint j = 0; j < Lands[_id].ownerAadhaar.length; j++) {
            if (keccak256(abi.encodePacked(Lands[_id].ownerAadhaar[j])) == keccak256(abi.encodePacked(_aadhaar))) {
                Lands[_id].share[j] += Lands[_id].share[i];
                exist = true;
                break;
            }
        }
        if (exist) {
            Lands[_id].ownerAadhaar[i] = Lands[_id].ownerAadhaar[Lands[_id].ownerAadhaar.length - 1];
            Lands[_id].ownerAadhaar.pop();
            Lands[_id].share[i] = Lands[_id].share[Lands[_id].share.length - 1];
            Lands[_id].share.pop();
        }
        else {
            Lands[_id].ownerAadhaar[i] = _aadhaar;
            UserAssets[_aadhaar].push(_id);
        }
    }
    
    function removeFromLandForSale(string memory _id) private {
        uint i = findIndex(LandsforSale, _id);
        LandsforSale[i] = LandsforSale[LandsforSale.length - 1];
        LandsforSale.pop();
    }
    
    function removeFromRequestedLands(string memory _id, string memory _aadhaar) private {
        uint i = findIndex(requestedLands[_aadhaar], _id);
        requestedLands[_aadhaar][i] = requestedLands[_aadhaar][requestedLands[_aadhaar].length - 1];
        requestedLands[_aadhaar].pop();
    }
    
    function transfer(string memory _id, string memory _newAadhaar, string memory _oldAadhaar, bool _status, string memory _time, string memory approver) public {
        if (_status == true) {
            changeOwnership(_id, _newAadhaar, _oldAadhaar, _time, approver);
        }
        else {
            uint i = findIndex(Lands[_id].saleBy, _oldAadhaar);
            Lands[_id].status[i] = ChangeStatus.Rejected;
        }
    }
    
    function changeOwnership(string memory _id, string memory _newAadhaar, string memory _oldAadhaar, string memory _time, string memory _approver) private {
        uint i = findIndex(Lands[_id].ownerAadhaar, _oldAadhaar);
        check(_id, _newAadhaar, i);
        removeAsset(_oldAadhaar, _id);
        removeRequestAccess(_id, _oldAadhaar);
        removeFromRequestedLands(_id, _newAadhaar);
        changeInLandDetails(_id, _oldAadhaar);
        if (Lands[_id].saleBy.length == 0) {
            removeFromLandForSale(_id);
            delete InterestedBuyers[_id];
        }
        change.push(change.length);
        changeMap[change[change.length - 1]] = changeDetails(_id, _oldAadhaar, _newAadhaar, _time, _approver);
    }
}