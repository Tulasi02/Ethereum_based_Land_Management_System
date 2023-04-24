import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';
import { useNavigate , useLocation } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();

    let aadhaar;

    if (location.state) {
        aadhaar = location.state.aadhaar;
    }

    const [user, setUser] = useState();

    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const account = await window.ethereum.request({method: 'eth_requestAccounts'});
            const networkId = await web3.eth.net.getId()
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const userData = await contract.methods.Users(aadhaar).call();
            setUser(userData);
        }
        func();
    }, []);

    const handleRegister = () => {
        navigate("/register", {state: {aadhaar: aadhaar}});
    };

    const handleSearch = () => {
        navigate("/search", {state: {aadhaar: aadhaar}});
    };

    const handleSell = () => {
        navigate("/sell", {state: {aadhaar: aadhaar}});
    };

    const handleRequest = () => {
        navigate("/requested", {state: {aadhaar: aadhaar}});
    }

    const handleSale = () => {
        navigate("/onsale", {state: {aadhaar: aadhaar}});
    }

    const handleProcess = () => {
        navigate("/process", {state: {aadhaar: aadhaar}});
    }

    const handleAdd = () => {
        navigate("/add", {state: {aadhaar: aadhaar}});
    }

    if (user && user.isMember) {
        document.getElementById("navbar").innerHTML="";
        return (
            <div style={{width: '300px'}}>
                {user.isOfficial &&
                    (<div>
                        <h4>Add User</h4>
                        <button type="button" className="btn btn-primary" onClick={() => handleAdd()}>Add</button>
                    </div>)}
                {user.isOfficial && <br></br>}
                {user.isOfficial && 
                    (<div>
                        <h4>Register a property</h4>
                        <button type="button" className="btn btn-primary" onClick={() => handleRegister()}>Register</button>
                    </div>)}
                {user.isOfficial && <br></br>}
                {user.isOfficial &&
                    (<div>
                        <h4>Process change of ownership transactions</h4>
                        <button type="button" className="btn btn-primary" onClick={() => handleProcess()}>Process</button>
                    </div>)}
                <br></br> 
                <div>
                    <h4>Buy Property</h4>
                    <button type="button" className="btn btn-primary" onClick={() => handleSearch()}>Search</button>
                </div>
                <br></br>
                <div>
                    <h4>My properties</h4>
                    <button type="button" className="btn btn-primary" onClick={() => handleSell()}>Properties</button>
                </div>
                <br></br>
                <div>
                    <h4>Requested Lands</h4>
                    <button type="button" className="btn btn-primary" onClick={() => handleRequest()}>Requested</button>
                </div>
                <br></br>
                <div>
                    <h4>My Lands on Sale</h4>
                    <button type="button" className="btn btn-primary" onClick={() => handleSale()}>Lands</button>
                </div>
            </div>
        );

    }
    else {
        return (
            <div style={{width: '300px'}}>
                <h1>Land Management System</h1>
                <br />
                <p>This is a Ethereum based application which helps in property management. It connects to the users Metamask account which can be given during signup and cannot be changed further. You can register your land and then after it is approved transfer ownership online. You can also buy a land</p>
            </div>
        );
    }
};

export default Home;