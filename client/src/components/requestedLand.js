import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';
import { FileEarmarkFill } from 'react-bootstrap-icons';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft } from 'react-bootstrap-icons';

const RequestedLand = () => {
    const navigate = useNavigate();
    const location = useLocation();
    let aadhaar;

    if (location.state) {
        aadhaar = location.state.aadhaar;
    }
            
    const [user, setUser] = useState();
    const [lands, setLands] = useState([]);

    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const networkId = await web3.eth.net.getId();
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const userData = await contract.methods.Users(aadhaar).call();
            setUser(userData);
            const requested = await contract.methods.getRequestedLands(aadhaar).call();
            let landsList = [];
            let land, saleBy, sellerNames, sellerEmails, status, share, userAccount;
            for (let i = 0; i < requested.length; i++) {
                land = await contract.methods.Lands(requested[i]).call();
                saleBy = await contract.methods.getSaleBy(requested[i]).call();
                status = await contract.methods.getStatus(requested[i]).call();
                sellerNames = await contract.methods.getSellerNames(requested[i]).call();
                sellerEmails = await contract.methods.getSellerEmail(requested[i]).call();
                land["owners"] = await contract.methods.getOwnerNames(requested[i]).call();
                share = await contract.methods.getShares(requested[i]).call();
                for (let j = 0; j < saleBy.length; j++) {
                    land["seller"] = saleBy[j];
                    land["sellerName"] = sellerNames[j];
                    land["sellerEmail"] = sellerEmails[j];
                    land["access"] = await contract.methods.getLandRequestAccess(requested[i], aadhaar, saleBy[j]).call();
                    land["status"] = status[j];
                    land["share"] = share[j];
                    userAccount = await contract.methods.Users(saleBy[j]).call();
                    land["sellerA"] = userAccount.account;
                    landsList.push(land);
                }
            }
            setLands(landsList);
        }
        func();
    }, []);

    const handleBack = () => {
        navigate("/", {state: {aadhaar: aadhaar}});
    }

    const handleTransfer = async (id, seller) => {
        const web3 = new Web3(window.ethereum);
        const account = await window.ethereum.request({method: 'eth_requestAccounts'});
        const networkId = await web3.eth.net.getId();
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);
        await contract.methods.transferRequest(id, aadhaar, seller).send({from: account[0]});
        window.location.reload(true);
        navigate("/requested", {state: {aadhaar: aadhaar}});
    }

    const handleBuy = async (id, seller, sellerA, price, share) => {
        const web3 = new Web3(window.ethereum);
        const account = await window.ethereum.request({method: 'eth_requestAccounts'});
        const networkId = await web3.eth.net.getId();
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);
        price = ((Number(price) * share) / 100).toString();
        let txhash;
        let transfer = await web3.eth.sendTransaction({from: account[0], to: sellerA, value: web3.utils.toWei(price, "ether")})
        .then(async (hash, err) => {
            console.log(hash, err);
            if (hash) {
                txhash = hash;
            }
        });
        if (txhash) {
                await contract.methods.changeOwnership(id, aadhaar, seller).send({from: account[0]});
            // alert("Land Ownership transfer done successfully");
            window.location.reload(true);
            navigate("/requested", {state: {aadhaar: aadhaar}});
        }
        else {
            alert("Fail");
        }
    }

    const TableRow = ({data}) => {
        if (data) {
            return data.map((data, i) => 
                <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{data.ownerNames}</td>
                    <td>{data.landAddress}</td>
                    <td>{data.price}</td>
                    <td>{data.share}</td>
                    <td>{data.jointOwnership ? "Yes" : "No"}</td>
                    <td>{data.access === "Accepted" || data.access === "Sell" ? (<a href={"https://ipfs.io/ipfs/" + data.ipfsHash} target="_blank"><FileEarmarkFill /></a>)  : ""}</td>
                    <td>{data.sellerName}</td>
                    <td>{data.sellerEmail}</td>
                    <td>{data.access}</td>
                    <td>{data.status}</td>
                    <td><button type="button" className="btn btn-primary" onClick={() => handleTransfer(data.id, data.seller)} disabled={data.status === "None" && data.access === "Sell" ? false : true}>Request Transfer</button></td>
                    <td><button type="button" className="btn btn-primary" onClick={() => handleBuy(data.id, data.seller, data.sellerA, data.price, data.share)} disabled={data.status === "Accepted" && data.access === "Sell" ? false : true}>Buy</button></td>
                </tr>
            );
        }
    }

    if (user && user.isMember) {
        document.getElementById("navbar").innerHTML="";
    }

    return (
        <div>
            <button type="button" className="btn btn-primary" onClick={() => handleBack()}><ArrowLeft /></button>
            <br></br><br></br>
            <h1>Requested Lands</h1>
            <table className="table table-bordered text-center">
                <thead className='thead-dark'>
                    <tr>
                        <th scope="col">S.No</th>
                        <th scope="col">Owners</th>  
                        <th scope="col">Address</th>
                        <th scope="col">Price</th>
                        <th scope="col">Share</th>
                        <th scope="col">Joint Property</th>
                        <th scope="col">Document</th>
                        <th scope="col">Seller</th>                      
                        <th scope="col">Seller Email</th>
                        <th scope="col">Access</th>
                        <th scope="col">Transfer Status</th>
                        <th scope="col">Transfer Request</th>
                    </tr>
                </thead>
                <tbody>
                    <TableRow data={lands} />
                </tbody>
            </table>
        </div>
    );
};

export default RequestedLand;