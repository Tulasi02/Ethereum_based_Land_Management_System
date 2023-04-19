import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { create as ipfsHttpClient} from 'ipfs-http-client';
import { v4 as uuid } from 'uuid';
import Land from '../contracts/Land.json';

const Register = () => {

    const {REACT_APP_PROJECT_ID, REACT_APP_PROJECT_SECRET, REACT_APP_IPFS_API_ENDPOINT} = process.env;
    const [user, setUser] = useState({name: '', id: '', email: '', isMember: false});
    const [landDoc, setLandDoc] = useState('');
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
            const account = await window.ethereum.request({method: 'eth_requestAccounts'});
            const networkId = await web3.eth.net.getId()
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const userData = await contract.methods.Users(account[0]).call();
            setUser(userData);
        }
        func();
    }, []); 

    const handleUpload = async (e) => {
        e.preventDefault();
        const form = e.target;
        const files = (form[0]).files;
        if (!files || files.length === 0) {
            alert("No files detected");
        }
        const file = files[0];
        const result = await ipfs.add(file);
        setLandDoc(result.path);
        console.log(landDoc);
        document.getElementById("upload").innerHTML = "Uploaded";
    }

    const handleRegister = async (e) => {
        console.log("Register");
        e.preventDefault();
        const {formAddress, price, formAccount} = e.target.elements;
        const id = uuid();
        const web3 = new Web3(window.ethereum);
        const account = await window.ethereum.request({method: 'eth_requestAccounts'});
        const networkId = await web3.eth.net.getId()
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);
        console.log(id, formAddress.value, price.value, landDoc, formAccount.value);
        await contract.methods.registerLand(id.toString(), formAddress.value.toString(), price.value, landDoc, formAccount.value).send({from: account[0]});
        setOutput("Successfully registered");
        document.getElementById("submit").disabled = true;
    }

    return (
        <div>
            <h2>Register Land</h2>
            <form className="mb-3" onSubmit={handleUpload}>
                <label>Upload Land Document</label>
                <input
                id="file" 
                type="file" 
                name="file" 
                className="form-control"
                required />
                <button type="submit" id="upload" className="btn btn-primary">Upload</button>
            </form>
            <form onSubmit={handleRegister}>
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
                    placeholder="Price (in Rupees)"
                    required
                    />
                </div>
                <div className="mb-3">
                    <label>Metamask account</label>
                    <input
                    id="formAccount"
                    type="text"
                    className="form-control"
                    placeholder="Metamask account"
                    value={user.id}
                    disabled
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