import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';

const SearchLand = () => {
            
    const [user, setUser] = useState({name: '', id: '', email: '', isMember: false});
    const [landforSale, setLandforSale] = useState([]);
    const [lands, setLands] = useState([]);
    
    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const account = await window.ethereum.request({method: 'eth_requestAccounts'});
            const networkId = await web3.eth.net.getId();
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const userData = await contract.methods.Users(account[0]).call();
            setUser(userData);
            const sale = await contract.methods.getAllLandsforSale().call();
            setLandforSale(sale);
            let land;
            for (let i = 0; i < sale.length; i++) {
                land = await contract.methods.Lands(sale[i]).call();
                if (land.ownerAccount.toString().toUpperCase() !== account[0].toString().toUpperCase()) {
                    setLands([...lands, land]);
                }
            }
        }
        func();
    }, []);

    const TableRow = ({data}) => {
        return data.map((data, i) => 
            <tr key={i}>
                <td>{i + 1}</td>
                <td>{data.ownerName}</td>
                <td>{data.landAddress}</td>
                <td>{data.price}</td>
            </tr>
        );
    }

    const handleSubmit = async() => {
        const web3 = new Web3(window.ethereum);
        const account = await window.ethereum.request({method: 'eth_requestAccounts'});
        const networkId = await web3.eth.net.getId();
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);
        // const user = await contract.methods.Users(account[0]).call();
    const t = await web3.eth.sendTransaction({to: "0x7b76C2F9537523dA14C34537975b482C685A432A", from: account[0], value: "1000000000000000000"});
    }

    return (
        <div>
            <h1>Available Lands</h1>
            <table className="table table-bordered text-center">
                <thead className='thead-dark'>
                    <tr>
                        <th>S.No</th>
                        <th scope="col">Owner</th>
                        <th scope="col">Address</th>
                        <th scope="col">Price</th>
                    </tr>
                </thead>
                <tbody>
                    <TableRow data={lands} />
                </tbody>
            </table>
            <button type="button" className='btn btn-primary' onClick={handleSubmit}>Request Access</button>
        </div>
    );
};

export default SearchLand;