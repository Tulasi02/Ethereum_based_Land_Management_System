import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';
import { FileEarmarkFill } from 'react-bootstrap-icons';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft } from 'react-bootstrap-icons';

const SellLand = () => {

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
            const networkId = await web3.eth.net.getId()
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const userData = await contract.methods.Users(aadhaar).call();
            setUser(userData);
            const assets = await contract.methods.getUserAssets(aadhaar).call();
            let landsList = [];
            let land;
            for (let i = 0; i < assets.length; i++) {
                land = await contract.methods.Lands(assets[i]).call();
                let owners = await contract.methods.getLandOwners(assets[i]).call();
                land["ownerNames"] = await contract.methods.getOwnerNames(assets[i]).call();
                let shares = await contract.methods.getShares(assets[i]).call();
                let Status = await contract.methods.getStatus(assets[i]).call();
                let saleBy = await contract.methods.getSaleBy(assets[i]).call();
                land["OwnerEmails"] = await contract.methods.getOwnerEmails(assets[i]).call();
                let x = owners.indexOf(aadhaar);
                land["share"] = shares[x];
                land["status"] = Status[x];
                land["saleBy"] = await contract.methods.getSellerNames(assets[i]).call();
                land["sale"] = (saleBy.indexOf(aadhaar) !== -1 ? true : false);
                landsList.push(land);
            }
            setLands(landsList);
        }
        func();
    }, []);

    const handleBack = () => {
        navigate("/", {state: {aadhaar: aadhaar}});
    }

    const handleSell = async (id) => {
        const web3 = new Web3(window.ethereum);
        const account = await window.ethereum.request({method: 'eth_requestAccounts'});
        const networkId = await web3.eth.net.getId()
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);
        await contract.methods.auctionLand(aadhaar, id).send({from: account[0]});
        document.getElementById("s").innerHTML="OnSale";
        document.getElementById("s").disabled = true;
        window.location.reload(true);
        navigate("/sell", {state: {aadhaar: aadhaar}});
    }

    const TableRow = ({data}) => {
        return data.map((data, i) => 
            <tr key={i}>
                <td>{i + 1}</td>
                <td>{data.landAddress}</td>
                <td><a href={"https://ipfs.io/ipfs/" + data.ipfsHash} target="_blank"><FileEarmarkFill /></a></td>
                <td>{data.price}</td>
                <td>{data.jointOwnership ? "Yes" : "No"}</td>
                <td>{data.ownerNames.join(' ')}</td>
                <td>{data.OwnerEmails.join(' ')}</td>
                <td>{data.share}</td>
                <td>{data.saleBy.join(' ')}</td>
                <td>{data.status}</td>
                <td><button id="s" type="button" className='btn btn-primary' onClick={() => handleSell(data.id)} disabled={data.sale ? true : false}>{data.sale? "OnSale" : "Sell"}</button></td>
            </tr>
        );
    }

    if (user && user.isMember) {
        document.getElementById("navbar").innerHTML="";
    }

    return (
        <div>
            <button type="button" className="btn btn-primary" onClick={() => handleBack()}><ArrowLeft /></button>
            <br></br><br></br>
            <h1>My Properties</h1>
            <table className="table table-bordered text-center">
                <thead className='thead-dark'>
                    <tr>
                        <th scope="col">S.No</th>
                        <th scope="col">Address</th>
                        <th scope="col">Document</th>
                        <th scope="col">Price</th>
                        <th scope="col">Joint Property</th>
                        <th scope="col">Owners</th>
                        <th scope="col">Email</th>
                        <th scope="col">Share</th>
                        <th scope="col">On Sale by</th>
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

export default SellLand;