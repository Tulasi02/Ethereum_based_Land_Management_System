import React, {useState} from 'react'

const Login = () => {

  const [walletConnected, setWalletConnected] = useState(false);

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const {email, password} = e.target.elements;
  //   console.log(email.value, password.value);
  // }

  const handleWallet = async () => {
    console.log("Connect to Metamask");
    if (window.ethereum) {
      await window.ethereum.request({method: 'eth_requestAccounts'}).then (response => {
        if (response) {
          document.getElementById("walletcn").innerHTML = "Connected";
          setWalletConnected(true);
          window.location = '/';
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

  return (
    // <form onSubmit={handleSubmit}>
    //   <h3>Login In</h3>
    //   <div className="mb-3">
    //     <label>Email address</label>
    //     <input
    //       id="email"
    //       type="email"
    //       className="form-control"
    //       placeholder="Enter email"
    //     />
    //   </div>
    //   {/* <div className="mb-3">
    //     <label>Password</label>
    //     <input
    //       id="password"
    //       type="password"
    //       className="form-control"
    //       placeholder="Enter password"
    //     />
    //   </div> */}
    //   <div className="d-grid">
    //     <button type="submit" className="btn btn-primary">
    //       Submit
    //     </button>
    //   </div>
    //   <p className="forgot-password text-right">
    //     Forgot <a href="/#">password?</a>
    //   </p>
    //   <p>
    //     No account? <a href="/signup">Sign Up</a>
    //   </p>
    // </form>
    <div>
      <h2>Login</h2>
      <button type="button" id="walletcn" className="btn btn-dark" onClick={handleWallet}>Connect to Metamask to Login</button>
    </div>
  )
}

export default Login;