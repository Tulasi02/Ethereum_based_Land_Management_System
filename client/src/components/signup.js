import React, { useState } from 'react'

const SignUp = () => {

  const [walletConnected, setWalletConnected] = useState(false);
  
  const handleWallet = async () => {
    console.log("Connect to Metamask");
    if (window.ethereum) {
      await window.ethereum.request({method: 'eth_requestAccounts'}).then (response => {
        if (response) {
          document.getElementById("walletcn").innerHTML = "Connected";
          setWalletConnected(true);
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
    console.log("Submit");
    e.preventDefault();
    const {name, email, password} = e.target.elements;
    console.log(name.value, email.value, password.value, walletConnected);
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
        <button type="submit" className="btn btn-primary">
          Sign Up
        </button>
      </div>
      <p className="forgot-password text-right">
        Already registered <a href="/sign-in">sign in?</a>
      </p>
    </form>
  )
};

export default SignUp;