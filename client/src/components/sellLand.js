import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';
import { FileEarmarkFill } from 'react-bootstrap-icons';

const SellLand = () => {
    const [user, setUser] = useState({name: '', id: '', email: '', isMember: false});
    const [lands, setLands] = useState([]);

    const Status = {0: "Registered", 1: "Approved", 2: "Rejected"};
    
    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const account = await window.ethereum.request({method: 'eth_requestAccounts'});
            const networkId = await web3.eth.net.getId()
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const userData = await contract.methods.Users(account[0]).call();
            setUser(userData);
            const assets = await contract.methods.getUserAssets(account[0]).call();
            let land;
            for (let i = 0; i < assets.length; i++) {
                land = await contract.methods.Lands(assets[i]).call();
                setLands([...lands, land]);
            }
        }
        func();
    }, []);

    const handleSell = async (id) => {
        const web3 = new Web3(window.ethereum);
        const account = await window.ethereum.request({method: 'eth_requestAccounts'});
        const networkId = await web3.eth.net.getId()
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);
        await contract.methods.auctionLand(id).send({from: account[0]});
        // window.location = 
    }

    const TableRow = ({data}) => {
        return data.map((data, i) => 
            <tr key={i}>
                <td>{i + 1}</td>
                <td>{data.landAddress}</td>
                <td><a href={"https://ipfs.io/ipfs/" + data.ipfsHash} target="_blank"><FileEarmarkFill /></a></td>
                <td>{data.price}</td>
                <td>{Status[data.status]}</td>
                <td><button type="button" className='btn btn-primary' onClick={() => handleSell(data.id)} disabled={data.status === '1' && data.sell === false ? false : true}>{data.sell === false? "Sell" : "onSale"}</button></td>
            </tr>
        );
    }

    if (user.isMember) {
        document.getElementById("navbar").innerHTML="";
    }

    return (
        <div>
            <h1>Put up your land for sale</h1>
            <table className="table table-bordered text-center">
                <thead className='thead-dark'>
                    <tr>
                        <th scope="col">S.No</th>
                        <th scope="col">Address</th>
                        <th scope="col">Document</th>
                        <th scope="col">Price</th>
                        <th scope="col">Status</th>
                        <th scope="col"></th>
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