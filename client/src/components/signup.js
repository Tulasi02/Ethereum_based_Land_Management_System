import React, { useState } from 'react';
import Land from '../contracts/Land.json';
import Web3 from 'web3';

const SignUp = () => {

  const [account, setAccount] = useState('');
  
  const callAddUser = async (name, email, account, govtId) => {
    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId()
    const address = Land.networks[networkId].address;
    const contract = new web3.eth.Contract(Land.abi, address);
    const user = await contract.methods.Users(account).call();
    if (user.isMember) {
      document.getElementById("output").innerHTML = 'Already a Registered User , try <a href="/login">Login</a> instead';
    }
    else {
      await contract.methods.addUser(account, name, email, govtId).send({from: account});
      document.getElementById("output").innerHTML = 'Successfully registered <a href="/login">Login</a>';
      document.getElementById("submit").disabled = true;
    }
  };

  const handleWallet = async () => {
    console.log("Connect to Metamask");
    if (window.ethereum) {
      await window.ethereum.request({method: 'eth_requestAccounts'}).then (response => {
        if (response) {
          document.getElementById("walletcn").innerHTML = "Connected";
          setAccount(String(response));
          console.log(account);
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
    const {name, email, govtId} = e.target.elements;
    callAddUser(name.value, email.value, account, govtId.value);
  }

  return (
    <form style={{width: '300px'}} onSubmit={handleSubmit}>
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