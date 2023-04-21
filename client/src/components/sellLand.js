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

    const Status = {0: "Registered", 1: "Approved", 2: "Rejected"};
    
    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const account = await window.ethereum.request({method: 'eth_requestAccounts'});
            const networkId = await web3.eth.net.getId()
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const userData = await contract.methods.Users(aadhaar).call();
            setUser(userData);
            const assets = await contract.methods.getUserAssets(aadhaar).call();
            let land;
            for (let i = 0; i < assets.length; i++) {
                land = await contract.methods.Lands(assets[i]).call();
                let shares = await contract.methods.getShares(assets[i]).call();
                let statuses = await contract.methods.getStatus(assets[i]).call();
                let sale = await contract.methods.getSaleBy(assets[i]).call();
                let x = owners.indexOf(aadhaar);
                land["share"] = shares[x];
                land["status"] = statuses[x];
                let y = sale.indexOf(aadhaar);
                land["sale"] = (y !== -1 ? true : false);
                land["ownerNames"] = await contract.methods.getOwnerNames(assets[i]).call();
                land["saleBy"] = await contract.methods.getSellerNames(assets[i]).call();
                setLands([...lands, land]);
            }
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
                <td>{data.share.join(' ')}</td>
                <td>{data.saleBy.join(' ')}</td>
                <td><button id="s" type="button" className='btn btn-primary' onClick={() => handleSell(data.id)} disabled={!data.sale ? false : true}>{data.sale == false ? "Sell" : "OnSale"}</button></td>
            </tr>
        );
    }
    console.log(lands);

    if (user.isMember) {
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
                        <th scope="col">Share</th>
                        <th scope="col">On Sale by</th>
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