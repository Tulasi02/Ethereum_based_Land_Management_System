import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './components/home';
import SignUp from './components/signup';
import Login from './components/login';
import Register from './components/register';
import SearchLand from './components/searchLand';
import SellLand from './components/sellLand';
import Process  from './components/process';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-light fixed-top">
          <div className="container">
            <h1>
              <Link className="navbar-brand" to={'/'}>
                Land Management System
              </Link>
            </h1>
            <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
              <ul id = "navbar" className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link" style={{color: "black"}} to={'/login'}>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" style={{color: "black"}} to={'/signup'}>
                    Sign up
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="auth-wrapper">
          <div className="auth-inner">
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<SearchLand />} />
              <Route path="/sell" element={<SellLand />} />
              <Route path="/process" element={<Process />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
