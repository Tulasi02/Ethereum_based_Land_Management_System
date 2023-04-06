import React from 'react'

const Login = () => {

  const handleSubmit = (e) => {
    e.preventDefault();
    const {email, password} = e.target.elements;
    console.log(email.value, password.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Login In</h3>
      <div className="mb-3">
        <label>Email address</label>
        <input
          id="email"
          type="email"
          className="form-control"
          placeholder="Enter email"
        />
      </div>
      <div className="mb-3">
        <label>Password</label>
        <input
          id="password"
          type="password"
          className="form-control"
          placeholder="Enter password"
        />
      </div>
      <div className="d-grid">
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </div>
      <p className="forgot-password text-right">
        Forgot <a href="/#">password?</a>
      </p>
    </form>
  )
}

export default Login;