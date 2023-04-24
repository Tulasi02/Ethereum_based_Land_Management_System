import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';
import { FileEarmarkFill } from "react-bootstrap-icons";
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft } from 'react-bootstrap-icons';

const Process = () => {
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
            const account = await window.ethereum.request({method: 'eth_requestAccounts'});
            const networkId = await web3.eth.net.getId();
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            setUser(await contract.methods.Users(account[0]).call());
            const obj = await contract.methods.getAllTransferRequest().call();
            let land = [];
            let k = {};
            for (let i = 0; i < obj[0].length; i++) {
                k["id"] = obj[0][i];
                let l = await contract.methods.Lands(obj[0][i]).call();
                let saleBy = await contract.methods.getSaleBy(obj[0][i]).call();
                let shares = await contract.methods.getShares(obj[0][i]).call();
                k["ipfsHash"] = l["ipfsHash"];
                k["jointOwnership"] = l["jointOwnership"];
                k["price"] = l["price"];
                k["share"] = shares[saleBy.indexOf(obj[1][i])];
                k["seller"] = obj[1][i];
                k["buyer"] = obj[2][i];
                land.push(k);
            }
            setLands(land);
        }
        func();
    }, []);

    const handleBack = () => {
        navigate("/", {state: {aadhaar: aadhaar}});
    }

    const handleClick = async (status, seller, buyer, id) => {
        const web3 = new Web3(window.ethereum);
        const account = await window.ethereum.request({method: 'eth_requestAccounts'});
        const networkId = await web3.eth.net.getId();
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);  
        const time = new Date();
        await contract.methods.transfer(id, buyer, seller, (status === "Accepted" ? true : false), time.toString(), aadhaar).send({from: account[0]});
    }

    const TableRow = ({data}) => {
        return data.map((data, i) => 
            <tr key={i}>
                <td>{i + 1}</td>
                <td>{data.seller}</td>
                <td>{data.buyer}</td>
                <td><a href={"https://ipfs.io/ipfs/" + data.ipfsHash} target="_blank"><FileEarmarkFill /></a></td>
                <td>{data.price}</td>
                <td>{data.share}</td>
                <td><button type="button" className="btn btn-primary" onClick={() => handleClick("Accepted", data.seller, data.buyer, data.id)}>Approve</button></td>
                <td><button type="button" className="btn btn-primary" onClick={() => handleClick("Rejected", data.seller, data.buyer, data.id)}>Reject</button></td>
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
            <h1>Process Land Requests</h1>
            <table className="table table-bordered text-center">
                <thead className='thead-dark'>
                    <tr>
                        <th>S.No</th>
                        <th scope="col">Seller</th>
                        <th scope="col">Buyer</th>
                        <th scope="col">Document</th>
                        <th scope="col">Price</th>
                        <th scope="col">Share</th>
                    </tr>
                </thead>
                <tbody>
                    <TableRow data={lands} />
                </tbody>
            </table>
        </div>
    );
};

export default Process;