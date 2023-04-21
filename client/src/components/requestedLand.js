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
    const [buy, setBuy] = useState('');

    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const account = await window.ethereum.request({method: 'eth_requestAccounts'});
            const networkId = await web3.eth.net.getId();
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const userData = await contract.methods.Users(aadhaar).call();
            setUser(userData);
            const requested = await contract.methods.getRequestedLands(aadhaar).call();
            const access = await contract.methods.getStatus().call();
            let land,saleBy, owners, users;
            for (let i = 0; i < requested.length; i++) {
                land = await contract.methods.Lands(requested[i]).call();
                let saleBy = await contract.methods.getSaleBy(requested[i]).call()
                let access = await contract.methods.getLandRequestAccess(requested[i], aadhaar).call();
                let sellerName = await contract.methods.getSellerNames(requested[i]).call();
                let sellerEmail = await contract.methods.getSellerEmail(requested[i]).call();
                let owners = await contract.methods.getOwnerNames(requested[i]).call();
                for (let j = 0; j < saleBy)
                setLands([...lands, land]);
            }
        }
        func();
    }, []);

    const handleBack = () => {
        navigate("/", {state: {aadhaar: aadhaar}});
    }

    const handleBuy = async (id, seller, access, price, share) => {
        const web3 = new Web3(window.ethereum);
        const account = await window.ethereum.request({method: 'eth_requestAccounts'});
        const networkId = await web3.eth.net.getId();
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);
        setBuy(id);
        for (int i = 0; i < seller.length; i++) {
            // let transfer = web3.eth.sendTransaction({from: account[0], to: owner, value: web3.utils.toWei(price, "ether")})
            // .then(async (res) => {
            //     if (res) {
            //         await contract.methods.changeOwnership(buy, account[0]).send({from: account[0]});
            //         alert("Land Ownership transfer done successfully");
            //     }
            // });

        }
        navigate("/requestedLands", {state: {aadhaar: aadhaar}});
    };

    const TableRow = ({data}) => {
        if (data) {
            return data.map((data, i) => 
                <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{data.ownerNames.join(' ')}</td>
                    <td>{data.landAddress}</td>
                    <td>{data.price}</td>
                    <td>{data.jointOwnership ? "Yes" : "No"}</td>
                    <td><a href={"https://ipfs.io/ipfs/" + data.ipfsHash} target="_blank" disabled={(data.access.indexOf("Accepted") !== -1 || data.access.indexOf("Sell") !== -1) ? false : true}><FileEarmarkFill /></a></td>
                    <td>{data.sellerName.join(' ')}</td>
                    <td>{data.sellerEmail.join(' ')}</td>
                    <td>{data.access.join(' ')}</td>
                    <td><button type="button" className="btn btn-primary" onClick={() => handleTransfer}>Request Transfer</button></td>
                    <td><button type="button" className="btn btn-primary" onClick={() => handleBuy(data.id, data.saleBy, data.access, data.price, data.share)} disabled={data.access.indexOf("Sell") !== -1 ? false : true}>Buy</button></td>
                </tr>
            );
        }
    }

    if (user.isMember) {
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
                        <th scope="col">Joint Property</th>
                        <th scope="col">Document</th>
                        <th scope="col">Sale By</th>                      
                        <th scope="col">Seller Email</th>
                        <th scope="col">Access</th>
                        <th scope="col">Buy</th>
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