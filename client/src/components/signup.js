import React, { useState } from 'react';
import Land from '../contracts/Land.json';
import Web3 from 'web3';

const SignUp = () => {

  const [account, setAccount] = useState('');

  const addUser = async (name, email,account) => {
    console.log("Add User");
    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId()
    const address = Land.networks[networkId].address;
    const contract = new web3.eth.Contract(Land.abi, address);
    await contract.methods.addUser(account, name, email).send({from: account});
    document.getElementById("output").innerHTML = 'Successfully registered <a href="/login">Login</a>';
    document.getElementById("submit").disabled = true;
  };

  const handleWallet = async () => {
    console.log("Connect to Metamask");
    if (window.ethereum) {
      await window.ethereum.request({method: 'eth_requestAccounts'}).then (response => {
        if (response) {
          document.getElementById("walletcn").innerHTML = "Connected";
          setAccount(String(response));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const {name, email} = e.target.elements;
    if (!window.ethereum.isConnected()) {
      console.log("Error");
    }
    addUser(name.value, email.value, account);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Sign Up</h3>
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
          placeholder="Enter email"
          required
        />
      </div>
      {/* <div className="mb-3">
        <label>Password</label>
        <input
          id="password"
          type="password"
          className="form-control"
          placeholder="Enter password"
          required
        />
      </div> */}
      <div className="mb-3 d-grid">
        <button type="button" id="walletcn" className="btn btn-dark" onClick={handleWallet}>Connect to Metamask</button>
      </div>
      <div className="d-grid">
        <button type="submit" id="submit" className="btn btn-primary">
          Sign Up
        </button>
      </div>
      <p className="forgot-password text-right">
        Already registered? <a href="/login">Login</a>
      </p>
      <p id="output" className="mb-3" />
    </form>
  )
};

export default SignUp;