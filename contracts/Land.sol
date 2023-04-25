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

    struct TransferDetails {
        string id;
        string oldAadhaar;
        string newAadhaar;
    }

    struct OwnershipChange {
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
    mapping(string => mapping(string => mapping(string => RequestStatus))) public LandRequestAccess;
    mapping(string => string[]) public requestedLands;
    
    string[] public UsersRegistered;
    string[] public LandsforSale; 
    TransferDetails[] public TransferList;
    OwnershipChange[] public ApprovedList;
    
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

    function checkInArray(string[] memory _array, string memory _id) private pure returns (bool) {
        for (uint i = 0; i < _array.length; i++) {
            if (keccak256(abi.encodePacked(_array[i])) == keccak256(abi.encodePacked(_id))) {
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

    function getOwnerEmails(string memory _id) public view returns (string[] memory) {
        string[] memory emails = new string[](Lands[_id].ownerAadhaar.length);
        for (uint i = 0; i < Lands[_id].ownerAadhaar.length; i++) {
            emails[i] = Users[Lands[_id].ownerAadhaar[i]].email;
        }
        return emails;
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
            emails[i] = Users[Lands[_id].ownerAadhaar[i]].email;
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
        if (!checkInArray(LandsforSale, _aadhaar)) {
            LandsforSale.push(_id);
        }
        Lands[_id].saleBy.push(_aadhaar);
        Lands[_id].status.push(ChangeStatus.None);
    }
    
    function getAllLandsforSale() public view returns (string[] memory) {
        return LandsforSale;
    }
    
    function getUserAssets(string memory _aadhaar) public view returns (string[] memory) {
        return UserAssets[_aadhaar];
    }    
    
    function requestLandDetails(string memory _id, string memory _aadhaar, string memory _seller) public {
        LandRequestAccess[_aadhaar][_id][_seller] = RequestStatus.Pending;
        requestedLands[_aadhaar].push(_id);
        InterestedBuyers[_id].push(_aadhaar);
    }
    
    function getLandRequestAccess(string memory _id, string memory _aadhaar, string memory _seller) public view returns (string memory) {   
        RequestStatus x = LandRequestAccess[_aadhaar][_id][_seller];
        return (x == RequestStatus.None ? "None" : (x == RequestStatus.Pending ? "Pending" : (x == RequestStatus.Accepted ? "Accepted" : (x == RequestStatus.Rejected ? "Rejected" : "Sell"))));
    }
    
    function getRequestedLands(string memory _aadhaar) public view returns (string[] memory) {
        return requestedLands[_aadhaar];
    }
    
    function sellLand(string memory _id, string memory _aadhaar, string memory _seller) public {
        LandRequestAccess[_aadhaar][_id][_seller] = RequestStatus.Sell;
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
        LandRequestAccess[_aadhaar][_id][_seller] = RequestStatus.Accepted;
    }
    
    function requestReject(string memory _aadhaar, string memory _id, string memory _seller) public {
        LandRequestAccess[_aadhaar][_id][_seller] = RequestStatus.Rejected;
    }
    
    function removeAsset(string memory _aadhaar, string memory _id) private {
        uint i = findIndex(UserAssets[_aadhaar], _id);
        UserAssets[_aadhaar][i] = UserAssets[_aadhaar][UserAssets[_aadhaar].length - 1];
        UserAssets[_aadhaar].pop();
    }
    
    function removeRequestAccess(string memory _id, string memory _seller) private {
        for (uint i = 0; i < InterestedBuyers[_id].length; i++) {
            delete LandRequestAccess[InterestedBuyers[_id][i]][_id][_seller];
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

    function removeFromTransferList(string memory _id, string memory _oldAadhaar, string memory _newAadhaar) private {
        for (uint i = 0; i < TransferList.length; i++) {
            if (keccak256(abi.encodePacked(TransferList[i].id)) == keccak256(abi.encodePacked(_id)) && keccak256(abi.encodePacked(TransferList[i].oldAadhaar)) == keccak256(abi.encodePacked(_oldAadhaar)) && keccak256(abi.encodePacked(TransferList[i].newAadhaar)) == keccak256(abi.encodePacked(_newAadhaar))) {
                TransferList[i] = TransferList[TransferList.length - 1];
            }
        }
        TransferList.pop();
    }
    
    function transferRequest(string memory _id, string memory _newAadhaar, string memory _oldAadhaar) public {
        uint i = findIndex(Lands[_id].saleBy, _oldAadhaar);
        Lands[_id].status[i] = ChangeStatus.Pending;
        TransferList.push(TransferDetails(_id, _oldAadhaar, _newAadhaar));
    }

    function getAllTransferRequest() public view returns (string[] memory, string[] memory, string[] memory) {
        uint l = TransferList.length;
        string[] memory land = new string[](l);
        string[] memory oldA = new string[](l);
        string[] memory newA = new string[](l);
        for (uint i = 0; i < l; i++) {
            land[i] = TransferList[i].id;
            oldA[i] = TransferList[i].oldAadhaar;
            newA[i] = TransferList[i].newAadhaar;
        }
        return (land, oldA, newA);
    }

    function transfer(string memory _id, string memory _newAadhaar, string memory _oldAadhaar, bool _status, string memory _time, string memory _approver) public {
        if (_status == true) {
            uint i = findIndex(Lands[_id].saleBy, _oldAadhaar);
            Lands[_id].status[i] = ChangeStatus.Accepted;   
            removeFromTransferList(_id, _oldAadhaar, _newAadhaar);
            ApprovedList.push(OwnershipChange(_id, _oldAadhaar, _newAadhaar, _time, _approver));
        }
        else {
            uint i = findIndex(Lands[_id].saleBy, _oldAadhaar);
            Lands[_id].status[i] = ChangeStatus.Rejected;
        }
    }
    
    function changeOwnership(string memory _id, string memory _newAadhaar, string memory _oldAadhaar) public {
        uint i = findIndex(Lands[_id].ownerAadhaar, _oldAadhaar);
        check(_id, _newAadhaar, i);
        removeAsset(_oldAadhaar, _id);
        removeRequestAccess(_id, _oldAadhaar);
        removeFromRequestedLands(_id, _newAadhaar);
        changeInLandDetails(_id, _oldAadhaar);
        removeFromTransferList(_id, _oldAadhaar, _newAadhaar);
        if (Lands[_id].saleBy.length == 0) {
            removeFromLandForSale(_id);
            delete InterestedBuyers[_id];
        }
    }
}