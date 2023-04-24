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
    
    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const networkId = await web3.eth.net.getId();
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const userData = await contract.methods.Users(aadhaar).call();
            setUser(userData);
            const forSale = await contract.methods.getAllLandsforSale().call();
            const assets = await contract.methods.getUserAssets(aadhaar).call();
            const onsale = forSale.filter(val => assets.includes(val));
            let landsList = [];
            let land, saleBy, users, status;
            for (let i = 0; i < onsale.length; i++) {
                land = await contract.methods.Lands(onsale[i]).call();
                saleBy = await contract.methods.getSaleBy(onsale[i]).call();
                let j = saleBy.indexOf(aadhaar);
                if (j !== -1) {
                    users = await contract.methods.interested(onsale[i]).call();
                    land["user"] = [];
                    let k = {};
                    for (let x = 0; x < users[0].length; x++) {
                        k["account"] = users[1][x];
                        k["name"] = users[0][x];
                        k["access"] = await contract.methods.getLandRequestAccess(onsale[i],  users[1][x], aadhaar).call();
                        land["user"].push(k);
                    }
                    landsList.push(land);
                }
            }
            setLands(landsList);
        }
        func();
    }, []);

    const handleBack = () => {
        navigate("/", {state: {aadhaar: aadhaar}});
    }

    const handleChange2 = async (i, e) => {
        const web3 = new Web3(window.ethereum);
        const account = await window.ethereum.request({method: 'eth_requestAccounts'});
        const networkId = await web3.eth.net.getId();
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);
        if (e === "Accepted") {
            await contract.methods.requestApprove(lands[selected].user[i].account, lands[selected].id, aadhaar).send({from: account[0]});
        }
        else if (e === "Rejected") {
            await contract.methods.requestReject(lands[selected].user[i].account, lands[selected].id, aadhaar).send({from: account[0]});
        }
        else {
            await contract.methods.sellLand(lands[selected].id, lands[selected].user[i].account, aadhaar).send({from: account[0]});
        }
        window.location.reload(true);
        navigate("/onsale", {state: {aadhaar: aadhaar}});
    }

    const TableRow = ({data}) => {
        if (data) {
            return data["user"].map((d, i) => 
                <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{d.name}</td>
                    <td>{d.access}</td>
                    <td><button type="button" className="btn btn-primary" onClick={() => handleChange2(i, "Accepted")} disabled={d.access === "None" || d.access === "Pending" ? false : true}>Approve</button></td>
                    <td><button type="button" className="btn btn-primary" onClick={() => handleChange2(i, "Rejected")} disabled={d.access === "None" || d.access === "Pending" ? false : true}>Reject</button></td>
                    <td><button id="sell" type="button" className="btn btn-primary" onClick={() => handleChange2(i, "Sell")} disabled={d.access == "Accepted" ? false : true}>Sell</button></td>
                </tr>
            );
        }
    }

    const handleChange = (e) => {
        setSelected(e.target.value);
    }

    if (user && user.isMember) {
        document.getElementById("navbar").innerHTML="";
    }

    return (
        <div>
            <button type="button" className="btn btn-primary" onClick={() => handleBack()}><ArrowLeft /></button>
            <br></br><br></br>
            <h1>Lands on Sale</h1>
            <select className="bootstrap-select" onChange={handleChange}>
                {lands.map((data, i) => (
                    <option key={i} value={i}>{data.id}</option>
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