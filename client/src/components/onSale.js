import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';
import { FileEarmarkFill } from 'react-bootstrap-icons';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft } from 'react-bootstrap-icons';

const OnSale = () => {
    
    const navigate = useNavigate();
    const location = useLocation();
    let aadhaar;

    if (location.state) {
        aadhaar = location.state.aadhaar;
    }
            
    const [user, setUser] = useState();
    const [lands, setLands] = useState([]);
    const [selected, setSelected] = useState(0);
    const [access, setAccess] = useState([]);
    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const account = await window.ethereum.request({method: 'eth_requestAccounts'});
            const networkId = await web3.eth.net.getId();
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const userData = await contract.methods.Users(account[0]).call();
            setUser(userData);
            const forSale = await contract.methods.getAllLandsforSale().call();
            const asset = await contract.methods.getUserAssets(account[0]).call();
            const land = forSale.filter(val => asset.includes(val));
            for (let i = 0; i < land.length; i++) {
                const landData = await contract.methods.Lands(land[i]).call();
                const users= await contract.methods.interested(land[i]).call();
                for (let j = 0; j < users[1].length; j++) {
                    let userAccess = await contract.methods.getLandRequestAccess([land[i]], users[1][j]).call();
                    setAccess([...access, userAccess]);
                }
                landData["userNames"] = users[0];
                landData["userIds"] = users[1];
                setLands([...lands, landData, ]);
            }            
        }
        func();
    }, []);

    const handleBack = () => {
        navigate("/", {state: {aadhaar: aadhaar}});
    }

    const handleChange2 = async (i, e) => {
        console.log(i, e);
        const web3 = new Web3(window.ethereum);
        const account = await window.ethereum.request({method: 'eth_requestAccounts'});
        const networkId = await web3.eth.net.getId();
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);
        if (e == "Accepted") {
            await contract.methods.requestApprove(lands[selected].userIds[i], lands[selected].id).send({from: account[0]});
        }
        else {
            await contract.methods.requestReject(lands[selected].userIds[i], lands[selected].id).send({from: account[0]});
        }
        window.location="/onSale";
    }

    const handleSell = async (i) => {
        const web3 = new Web3(window.ethereum);
        const account = await window.ethereum.request({method: 'eth_requestAccounts'});
        const networkId = await web3.eth.net.getId();
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);
        await contract.methods.sellLand(lands[selected].id, lands[selected].userIds[i]).send({from: account[0]});
        window.location = "/onSale";
    }

    const TableRow = ({data}) => {
        if (data) {
            return data["userNames"].map((d, i) => 
                <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{d}</td>
                    <td>{access[i]}</td>
                    <td><select className="bootstrap-select" onChange={e => handleChange2(i, e.target.value)}>
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Approve</option>
                        <option value="Rejected">Reject</option>
                    </select></td>
                    <td><button id="sell" type="button" className="btn btn-primary" onClick={() => handleSell(i)} disabled={access[i] == "Accepted" ? false : true}>Sell</button></td>
                </tr>
            );
        }
    }

    const handleChange = (e) => {
        setSelected(e.target.value);
    }

    if (user.isMember) {
        document.getElementById("navbar").innerHTML="";
    }

    return (
        <div>
            <button type="button" className="btn btn-primary" onClick={() => handleBack()}><ArrowLeft /></button>
            <br></br><br></br>
            <h1>Lands on Sale</h1>
            <select className="bootstrap-select" onChange={handleChange}>
                {lands.map((data, i) => (
                    <option value={i}>{data.id}</option>
                ))}
            </select>
            <br></br>
            Document - <a href={"https://ipfs.io/ipfs/" + (lands[selected] ? lands[selected].ipfsHash : "")} target="_blank"><FileEarmarkFill /></a>
            <table className="table table-bordered text-center">
                <thead className='thead-dark'>
                    <tr>
                        <th scope="col">S.No</th>
                        <th scope="col">Requested By</th>
                        <th scope="col">Access</th>
                        <th scope="col"></th>
                        <th scope="col">Sell</th>
                    </tr>
                </thead>
                <tbody>
                    <TableRow data={lands[selected]} />
                </tbody>
            </table>    
        </div>
    );
};

export default OnSale;