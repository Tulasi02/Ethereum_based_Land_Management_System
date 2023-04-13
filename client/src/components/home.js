import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';

const Home = () => {

    const [user, setUser] = useState({name: '', id: '', email: '', isMember: false});

    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const account = await window.ethereum.request({method: 'eth_requestAccounts'});
            const networkId = await web3.eth.net.getId()
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const userData = await contract.methods.Users(account[0]).call();
            setUser(userData);
        }
        func();
    }, []);

    const handleProcess = () => {
        console.log("Process");
        window.location = "/process";
    }

    const handleRegister = () => {
        console.log("Register");
        window.location = '/register';
    };

    const handleSearch = () => {
        console.log("Search");
        window.location = '/search';
    };

    const handleSell = () => {
        console.log("Sell");
        window.location = '/sell';
    };

    if (user.isMember) {
        document.getElementById("navbar").innerHTML = '<li className="nav-item"><p>' + user.id + '</p></li>';

        return (
            <div>
                {user.isOfficial && 
                    (<div>
                       <h4>Process Land requests</h4>
                        <button type="button" className="btn btn-primary" onClick={handleProcess}>Process</button> 
                    </div>)
                } 
                <div>
                    <h4>Register a property</h4>
                    <button type="button" className="btn btn-primary" onClick={handleRegister}>Register</button>
                </div>
                <div>
                    <h4>Buy Property</h4>
                    <button type="button" className="btn btn-primary" onClick={handleSearch}>Search</button>
                </div>
                <div>
                    <h4>Sell a property</h4>
                    <button type="button" className="btn btn-primary" onClick={handleSell}>Sell</button>
                </div>
            </div>
        );

    }
    else {
        return (
            <div>
                <h1>Land Management System</h1>
                <br />
                <p>This is a Ethereum based application which helps in property management. It connects to the users Metamask account which can be given during signup and cannot be changed further.</p>
            </div>
        );
    }
};

export default Home;