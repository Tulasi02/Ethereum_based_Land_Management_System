// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract Land {
    
    address owner;

    struct User {
        address id;
        string name;
        uint age;
        string email;
        bool isMember;
    }

    struct Details {
        string landAddress;
        uint price;
        string coordinates;
        string surveyNumber;
        string ipfsHash;
    }

    mapping(address => User) public Users;

    constructor() {
        owner = msg.sender;
    }

    function addUser(address _id, string memory _name, uint _age, string memory _email) public {
        Users[_id] = User(_id, _name, _age, _email, true);
    }

    function getUser(address _id) public view returns (User memory) {//address, string memory, uint, string memory, bool) {
        if (Users[_id].isMember) {
            // return (Users[_id].id, Users[_id].name, Users[_id].age, Users[_id].email, Users[_id].isMember);
            return Users[_id];
        }
        revert("Member does not exist");
    }



}