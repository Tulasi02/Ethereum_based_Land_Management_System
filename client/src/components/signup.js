import React, { useState } from 'react';
import Land from '../contracts/Land.json';
import Web3 from 'web3';
import { create as ipfsHttpClient} from 'ipfs-http-client';

const SignUp = () => {

  const {REACT_APP_PROJECT_ID, REACT_APP_PROJECT_SECRET, REACT_APP_IPFS_API_ENDPOINT} = process.env;
  const authorization = "Basic " + btoa(REACT_APP_PROJECT_ID + ":" + REACT_APP_PROJECT_SECRET);

  const ipfs = ipfsHttpClient({
    url: "" + REACT_APP_IPFS_API_ENDPOINT,
    headers: {
        authorization
    }
  });
  
  const callAddUser = async (image, name, email, aadhaar, pan, phone, govtId) => {
    const web3 = new Web3(window.ethereum);
    const account = await window.ethereum.request({method: 'eth_requestAccounts'});
    const networkId = await web3.eth.net.getId();
    const address = Land.networks[networkId].address;
    const contract = new web3.eth.Contract(Land.abi, address);
    const user = await contract.methods.Users(aadhaar).call();
    if (user.isMember) {
      document.getElementById("output").innerHTML = 'Already a Registered User , try <a href="/login">Login</a> instead';
    }
    else {
      await contract.methods.registerUser(account[0], name, email, aadhaar, pan, image, phone, govtId).send({from: account[0]});
      document.getElementById("output").innerHTML = 'Successfully registered <a href="/login">Login</a>';
      document.getElementById("submit").disabled = true;
    }
  };

  const handleWallet = async () => {
    if (window.ethereum) {
      await window.ethereum.request({method: 'eth_requestAccounts'}).then (response => {
        if (response) {
          document.getElementById("walletcn").innerHTML = "Connected";
        }
        else {
          alert("Some error occured try again.");
        }
      });
    }
    else {
      alert("Please install Metamask");
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {name, email, aadhaar, pan, phone, govtId} = e.target.elements;
    const form = e.target;
    const files = (form[0]).files;
    if (!files || files.length === 0) {
        alert("No files detected");
    }
    const file = files[0];
    const result = await ipfs.add(file);
    callAddUser(result.path, name.value, email.value, aadhaar.value, pan.value, phone.value, govtId.value);
  }

  return (
    <form style={{width: '300px'}} onSubmit={handleSubmit}>
      <h3>Sign Up</h3>
      <div className="mb-3">
        <label>Photo</label>
        <input
          id="photo"
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          className="form-control"
          required
        />
      </div>
      <div className="mb-3">
        <label>Name</label>
        <input
          id="name"
          type="text"
          className="form-control"
          placeholder="Name"
          required
        />
      </div>
      <div className="mb-3">
        <label>Email address</label>
        <input
          id="email"
          type="email"
          className="form-control"
          placeholder="Email"
          required
        />
      </div>
      <div className="mb-3">
        <label>Aadhaar</label>
        <input
          id="aadhaar"
          type="text"
          className="form-control"
          placeholder="Enter Aadhaar"
          required
        />
      </div>
      <div className="mb-3">
        <label>PAN NO</label>
        <input
          id="pan"
          type="text"
          className="form-control"
          placeholder="PAN No."
          required
        />
      </div>
      <div className="mb-3">
        <label>Phone No</label>
        <input
          id="phone"
          type="tel"
          className="form-control"
          pattern="[0-9]{10}"
          placeholder="Phone Number"
          required
        />
      </div>
      <div className="mb-3">
        <label>Government Id (optional)</label>
        <input
          id="govtId"
          type="text"
          className="form-control"
          placeholder="Enter Government Id if official"
        />
      </div>
      <div className="mb-3 d-grid">
        <button type="button" id="walletcn" className="btn btn-dark" onClick={handleWallet}>Connect to Metamask</button>
      </div>
      <div className="d-grid">
        <button type="submit" id="submit" className="btn btn-primary">
          Sign Up
        </button>
      </div>
      <p id="output" className="mb-3" />
    </form>
  )
};

export default SignUp;