import React from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';

const Login = () => {

  const handleWallet = async () => {
    console.log("Login");
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const account = await window.ethereum.request({method: 'eth_requestAccounts'});
      const networkId = await web3.eth.net.getId()
      const address = Land.networks[networkId].address;
      const contract = new web3.eth.Contract(Land.abi, address);
      const user = await contract.methods.Users(account[0].toString()).call();
      if (user.isMember) {
        window.location = '/';
      }
    }
    else {
      alert("Please install Metamask");
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <button type="button" id="walletcn" className="btn btn-dark md-3" onClick={handleWallet}>Connect to Metamask to Login</button>
      <p className="md-3">
        Haven't registered? <a href="/signup">Sign Up</a>
      </p>
    </div>
  )
}

export default Login;