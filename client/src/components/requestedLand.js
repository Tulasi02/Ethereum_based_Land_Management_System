import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';
import { FileEarmarkFill } from 'react-bootstrap-icons';

const RequestedLand = () => {
            
    const [user, setUser] = useState({name: '', id: '', email: '', isMember: false});
    const [lands, setLands] = useState([]);
    const [buy, setBuy] = useState('');

    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const account = await window.ethereum.request({method: 'eth_requestAccounts'});
            const networkId = await web3.eth.net.getId();
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const userData = await contract.methods.Users(account[0]).call();
            setUser(userData);
            const requested = await contract.methods.getRequestedLands(account[0]).call();
            const accessForLands = await contract.methods.getLandRequestAccess(requested, account[0]).call();
            let land;
            for (let i = 0; i < requested.length; i++) {
                land = await contract.methods.Lands(requested[i]).call();
                land["access"] = accessForLands[i];
                let users = await contract.methods.Users(land.ownerAccount).call();
                land["email"] = users["email"];
                setLands([...lands, land]);
                console.log(user, land);
            }
        }
        func();
    }, []);

    const handleBuy = async (id, owner, price) => {
        const web3 = new Web3(window.ethereum);
        const account = await window.ethereum.request({method: 'eth_requestAccounts'});
        const networkId = await web3.eth.net.getId();
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);
        setBuy(id);
        let transfer = web3.eth.sendTransaction({from: account[0], to: owner, value: web3.utils.toWei(price, "ether")})
        .then(async (res) => {
            if (res) {
                await contract.methods.changeOwnership(buy, account[0]).send({from: account[0]});
                alert("Land Ownership transfer done successfully");
            }
        });
        window.location = "/requestedLands";
    };

    const TableRow = ({data}) => {
        if (data) {
            return data.map((data, i) => 
                <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{data.ownerName}</td>
                    <td>{data.landAddress}</td>
                    <td>{data.price}</td>
                    <td>{(data.access == "Accepted" || data.access == "Sell") ? data.email : ""}</td>
                    <td><a href={"https://ipfs.io/ipfs/" + data.ipfsHash} target="_blank" disabled={(data.access == "Accepted" || data.access == "Sell") ? false : true}><FileEarmarkFill /></a></td>
                    <td>{data.access}</td>
                    <td><button type="button" className="btn btn-primary" onClick={() => handleBuy(data.id, data.ownerAccount, data.price)} disabled={data.access === "Sell" ? false : true}>Buy</button></td>
                </tr>
            );
        }
    }

    if (user.isMember) {
        document.getElementById("navbar").innerHTML="";
    }

    return (
        <div>
            <h1>Requested Lands</h1>
            <table className="table table-bordered text-center">
                <thead className='thead-dark'>
                    <tr>
                        <th scope="col">S.No</th>
                        <th scope="col">Owner</th>
                        <th scope="col">Address</th>
                        <th scope="col">Price</th>
                        <th scope="col">Email</th>
                        <th scope="col">Document</th>
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