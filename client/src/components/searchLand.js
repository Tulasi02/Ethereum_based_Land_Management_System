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
    const [lands, setLands] = useState([]);
    
    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const networkId = await web3.eth.net.getId();
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const userData = await contract.methods.Users(aadhaar).call();
            setUser(userData);
            const sale = await contract.methods.getAllLandsforSale().call();
            let landsList = [];
            let land, saleby, sellerName, sellerEmail, shares;
            for (let i = 0; i < sale.length; i++) {
                land = await contract.methods.Lands(sale[i]).call();
                saleby = await contract.methods.getSaleBy(sale[i]).call();
                sellerName = await contract.methods.getSellerNames(sale[i]).call();
                sellerEmail  = await contract.methods.getSellerEmail(sale[i]).call();
                land["owner"]  = await contract.methods.getOwnerNames(sale[i]).call();
                shares = await contract.methods.getShares(sale[i]).call();
                for (let j = 0; j < saleby.length; j++) {
                    if (saleby[j] !== aadhaar) {
                        land["seller"] = saleby[j];
                        land["sellerName"] = sellerName[j];
                        land["sellerEmail"] = sellerEmail[j];
                        land["share"] = shares[j];
                        land["access"] = await contract.methods.getLandRequestAccess(land.id, aadhaar, land["seller"]).call();
                        landsList.push(land);
                    }
                }
            }
            setLands(landsList);    
        }
        func();
    }, []);

    const handleBack = () => {
        navigate("/", {state: {aadhaar: aadhaar}});
    }

    const handleCheck = async (id, seller) => {
        const web3 = new Web3(window.ethereum);
        const networkId = await web3.eth.net.getId();
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);
        await contract.methods.requestLandDetails(id, aadhaar, seller).send({from: user.account});
        document.getElementById(id).innerHTML = "Requested";
        document.getElementById(id).disabled = true;
        window.location.reload(true);
        navigate("/search", {state: {aadhaar: aadhaar}});
    }

    const TableRow = ({data}) => {
        return data.map((data, i) => 
            <tr key={i}>
                <td>{i + 1}</td>
                <td>{data.landAddress}</td>
                <td>{data.owner.join(' ')}</td>
                <td>{data.sellerName}</td>
                <td>{data.sellerEmail}</td>
                <td>{data.price}</td>
                <td>{data.share}</td>
                <td>{data.jointOwnership ? "Yes" : "No"}</td>   
                <td><button id={data.id} type="button" className="btn btn-primary" onClick={() => handleCheck(data.id, data.seller)} disabled={data.access === "None" ? false : true}>{data.access !== "None" ? "Requested" : "Reuqest"}</button></td>
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