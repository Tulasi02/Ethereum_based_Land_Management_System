import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft } from 'react-bootstrap-icons';

const SearchLand = () => {
    const navigate = useNavigate();
    const location = useLocation();
    let aadhaar;

    if (location.state) {
        aadhaar = location.state.aadhaar;
    }
            
    const [user, setUser] = useState();
    const [landforSale, setLandforSale] = useState([]);
    const [lands, setLands] = useState([]);
    
    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const account = await window.ethereum.request({method: 'eth_requestAccounts'});
            const networkId = await web3.eth.net.getId();
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const userData = await contract.methods.Users(aadhaar).call();
            setUser(userData);
            const sale = await contract.methods.getAllLandsforSale().call();
            setLandforSale(sale);
            let land, saleby, owners, users;
            for (let i = 0; i < sale.length; i++) {
                land = await contract.methods.Lands(sale[i]).call();
                saleby = await contract.methods.getSaleBy(sale[i]).call();
                owners = await contract.methods.getLandOwners(sale[i]).call();
                let sellerName = await contract.methods.getSellerNames(sale[i]).call();
                let sellerEmail = await contract.methods.getSellerEmail(sale[i]).call();
                let owner = await contract.methods.getOwnerNames(sale[i]).call();
                let shares = await contract.methods.getShares(sale[i]).call();
                for (let i = 0; i < saleby.length; i++) {
                    let x = owner.indexOf(saleby[i]);
                    land["sellerName"] = sellerName[i];
                    land["sellerEmail"] = sellerEmail[i];
                    land["owner"] = ownerName[i];
                    land["index"] = i;
                    land["share"] = shares[x];
                    setLands([...lands, land]);
                }
            }
        }
        func();
    }, []);

    const handleBack = () => {
        navigate("/", {state: {aadhaar: aadhaar}});
    }

    const handleCheck = async (id) => {
        const web3 = new Web3(window.ethereum);
        const networkId = await web3.eth.net.getId();
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);
        await contract.methods.requestLandDetails(id, user.aadhaar).send({from: user.account});
        document.getElementById(id).innerHTML = "Requested";
        document.getElementById(id).disabled = true;
    }

    const TableRow = ({data}) => {
        return data.map((data, i) => 
            <tr key={i}>
                <td>{i + 1}</td>
                <td>{data.landAddres}</td>
                <td>{data.owner}</td>
                <td>{data.sellerName}</td>
                <td>{data.sellerEmail}</td>
                <td>{data.price}</td>
                <td>{data.share}</td>
                <td>{data.jointOwnership ? "Yes" : "No"}</td>   
                <td><button id={data.id} type="button" className="btn btn-primary" onClick={() => handleCheck(data.id)}>Request</button></td>
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
            <h1>Available Lands</h1>
            <table className="table table-bordered text-center">
                <thead className='thead-dark'>
                    <tr>
                        <th scope="col">S.No</th>
                        <th scope="col">Address</th>
                        <th scope="col">Owners</th>
                        <th scope="col">Seller</th>
                        <th scope="col">Seller Email</th>
                        <th scope="col">Price</th>
                        <th scope="col">Share</th>
                        <th scope="col">Joint Property</th>
                        <th scole="col">Access</th>
                    </tr>
                </thead>
                <tbody>
                    <TableRow data={lands} />
                </tbody>
            </table>
        </div>
    );
};

export default SearchLand;