import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { create as ipfsHttpClient} from 'ipfs-http-client';
import { v4 as uuid } from 'uuid';
import Land from '../contracts/Land.json';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft } from 'react-bootstrap-icons';

const Register = () => {

    const navigate = useNavigate();
    const location = useLocation();
    let aadhaar;

    if (location.state) {
        aadhaar = location.state.aadhaar;
    }

    const {REACT_APP_PROJECT_ID, REACT_APP_PROJECT_SECRET, REACT_APP_IPFS_API_ENDPOINT} = process.env;
    const [user, setUser] = useState();
    const [output, setOutput] = useState('');
    const authorization = "Basic " + btoa(REACT_APP_PROJECT_ID + ":" + REACT_APP_PROJECT_SECRET);
    
    const ipfs = ipfsHttpClient({
        url: "" + REACT_APP_IPFS_API_ENDPOINT,
        headers: {
            authorization
        }
    });

    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const networkId = await web3.eth.net.getId()
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const userData = await contract.methods.Users(aadhaar).call();
            setUser(userData);
        }
        func();
    }, []); 

    const handleBack = () => {
        navigate("/", {state: {aadhaar: aadhaar}});
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        const {formAddress, price, formAadhaar, share} = e.target.elements;
        const form = e.target;
        const files = (form[0]).files;
        if (!files || files.length === 0) {
            alert("No files detected");
        }
        const file = files[0];
        const result = await ipfs.add(file);
        let owners = formAadhaar.value.split(' ').filter(d => d != '' || d != " ");
        let shares = share.value.split(' ').filter(d => d != '' || d != " ").map(Number);
        const id = uuid();
        const web3 = new Web3(window.ethereum);
        const account = await window.ethereum.request({method: 'eth_requestAccounts'});
        const networkId = await web3.eth.net.getId();
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);
        const time = new Date();
        await contract.methods.registerLand(id, formAddress.value, aadhaar, time.toString(), price.value, result.path, owners, shares, (owners.length > 1 ? true : false)).send({from: account[0]});
        setOutput("Successfully registered");
        document.getElementById("submit").disabled = true;
    }

    if (user && user.isMember) {
        document.getElementById("navbar").innerHTML="";
    }

    return (
        <div style={{width: '400px'}}>
            <button type="button" className="btn btn-primary" onClick={() => handleBack()}><ArrowLeft /></button>
            <br></br><br></br>
            <h2>Register Land</h2>
            <form onSubmit={handleRegister}>
                <div>
                    <label>Upload Land Document</label>
                    <input
                    id="file" 
                    type="file" 
                    name="file" 
                    className="form-control"
                    required />
                </div>
                <div className="mb-3">
                    <label>Address</label>
                    <input
                    id="formAddress"
                    type="text"
                    className="form-control"
                    placeholder="Address"
                    required
                    />
                </div>
                <div className="mb-3">
                    <label>Price</label>
                    <input
                    id="price"
                    type="text"
                    className="form-control"
                    placeholder="Price (in ETH)"
                    required
                    />
                </div>
                <div className="mb-3">
                    <label>Owners Aadhaar</label>
                    <input
                    id="formAadhaar"
                    type="text"
                    className="form-control"
                    placeholder="Owner aadhaar (if joint property use space to add all)"
                    required
                    />
                </div>
                <div className="mb-3">
                    <label>Share (if joint property)</label>
                    <input
                    id="share"
                    type="text"
                    className="form-control"
                    placeholder="Share in percentage (if joint property use space else 100)"
                    required
                    />
                </div>
                <button type="submit" id="submit" className="btn btn-primary">Register</button>
                <div className="mb-3">
                    <p id="register">{output}</p>
                </div>
            </form>
        </div>
    );
};

export default Register;