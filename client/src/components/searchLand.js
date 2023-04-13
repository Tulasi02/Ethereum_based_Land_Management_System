import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';

const SearchLand = () => {
            
    // const [user, setUser] = useState({name: '', id: '', email: '', isMember: false});
    // // const [lands, setLands] = useState([]);
    // // const [buyable, setBuyable] = useState([]);
    
    // useEffect(() => {
    //     const func = async () => {
    //         const web3 = new Web3(window.ethereum);
    //         const account = await window.ethereum.request({method: 'eth_requestAccounts'});
    //         const networkId = await web3.eth.net.getId()
    //         const address = Land.networks[networkId].address;
    //         const contract = new web3.eth.Contract(Land.abi, address);
    //         let userData = await contract.methods.Users(account[0]).call();
    //         userData = {name: userData.name, id: userData.id, email: userData.email, isMember: userData.isMember};
    //         setUser({...user, ...userData});
    //         // const landData = await contract.methods.getAllLandsforSale().call();
    //         // setBuyable([...buyable, landData]);
    //         // console.log(landData);
    //         // console.log(buyable);
    //         // setLands(landData);
    //         // console.log(lands)
    //     }
    //     func();
    // }, []);
    
    // if (user.isMember) {
    //     document.getElementById("navbar").innerHTML = '<li className="nav-item"><p>' + user.id + '</p></li>';
    // }

    // const handleRequest = async() => {
    //     const web3 = new Web3(window.ethereum);
    //     const account = await window.ethereum.request({method: 'eth_requestAccounts'});
    //     const networkId = await web3.eth.net.getId();
    //     const address = Land.networks[networkId].address;
    //     const contract = new web3.eth.Contract(Land.abi, address);
    //     // const user = await contract.methods.Users(account[0]).call();
    // }

    return (
        <div>
            <h1>Available Lands</h1>
            
        </div>
    );
};

export default SearchLand;