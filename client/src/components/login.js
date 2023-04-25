import React, { useState } from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';
import {useNavigate} from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {formaadhaar} = e.target.elements;
    const web3 = new Web3(window.ethereum);
    const account = await window.ethereum.request({method: 'eth_requestAccounts'});
    const networkId = await web3.eth.net.getId();
    const address = Land.networks[networkId].address;
    const contract = new web3.eth.Contract(Land.abi, address);
    const user = await contract.methods.Users(formaadhaar.value).call();
    console.log(user);
    if (user && user.isMember) {
      if (user.account.toLowerCase() == account[0].toLowerCase()) { 
        navigate("/", {state: {aadhaar: formaadhaar.value}});
      }
      else {
        document.getElementById("output").innerHTML = "Metamask account and aadhar do not match";
      }
    }
    else {
      document.getElementById("output").innerHTML = (user.registered ? "User Registered. Request for access pending" : "User not registered. Try signup instead");
    }
  }

  return (
    <div>
      <form style={{width: '300px'}} onSubmit={handleSubmit}>
        <h3>Login</h3>
        <div className="mb-3">
          <label>Aadhaar</label>
          <input
            id="formaadhaar"
            type="text"
            className="form-control"
            placeholder="Enter Aadhaar"
            required
          />
        </div>
        <div className="mb-3 d-grid">
          <button type="button" id="walletcn" className="btn btn-dark" onClick={handleWallet}>Connect to Metamask</button>
        </div>
        <div className="d-grid">
          <button type="submit" id="submit" className="btn btn-primary">
            Login
          </button>
        </div>
        <p id="output" className="mb-3" />
      </form>
    </div>
  );
}

export default Login;