import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';

const SellLand = () => {
    const [user, setUser] = useState({name: '', id: '', email: '', isMember: false});
    const [lands, setLands] = useState([]);
    const [onSale, setOnSale] = useState([]);
    
    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const account = await window.ethereum.request({method: 'eth_requestAccounts'});
            const networkId = await web3.eth.net.getId()
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const userData = await contract.methods.getUser(account[0]).call();
            // const landData = await contract.methods.getLands().call();
            setUser(userData);
            // setLands(landData);
        }
        func();
    }, []);

    const handleSale = async () => {

    };

    return (
        <div>
            <h1>Put up your land for sale</h1>
            <table>
                <tr>
                    <th>Land Id</th>
                    <th>Address</th>
                    <th>Document</th>
                    <th>Price</th>
                    <th></th>
                </tr>
                {
                    lands.map(land => (
                        <tr>
                            <td>{land.id}</td>
                            <td>{land.address}</td>
                            <td>{land.ipfsHash}</td>
                            <td>{land.price}</td>
                            <td><button id="sale" type="button" className="btn btn-primary" onClick={handleSale}>Request</button></td>
                        </tr>
                    ))
                }
            </table>
        </div>
    );
};

export default SellLand;