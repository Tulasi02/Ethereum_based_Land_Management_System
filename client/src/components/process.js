import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';
import { FileEarmarkFill } from "react-bootstrap-icons";
// import Select from 'react-select';

const Process = () => {

    const [user, setUser] = useState();   
    const [lands, setLands] = useState([]);
    const [register, setRegister] = useState([]);
    const [approved, setApproved] = useState([]);
    const [rejected, setRejected] = useState([]);

    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const account = await window.ethereum.request({method: 'eth_requestAccounts'});
            const networkId = await web3.eth.net.getId();
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            setUser(await contract.methods.Users(account[0]).call());
            const registered = await contract.methods.getRegisteredLands().call();
            setRegister([...register, ...registered]);
            let land;
            for (let i = 0; i < registered.length; i++) {
                land = await contract.methods.Lands(registered[i]).call();
                if (land.ownerAccount.toString().toUpperCase() !== account[0].toString().toUpperCase() && land.status === '0') {
                    setLands([...lands, land]);
                }
            }
        }
        func();
    }, []);

    const handleSubmit = async () => {
        const web3 = new Web3(window.ethereum);
        const account = await window.ethereum.request({method: 'eth_requestAccounts'});
        const networkId = await web3.eth.net.getId()
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);  
        await contract.methods.changeStatus(approved, rejected).send({from: account[0]});
        window.location = "/process";
    }

    const handleChange = (e, i) => {
        console.log(e, i);
        if (e == "Approve") {
            setApproved([...approved, i]);
        }
        else if (e === "Reject") {
            setRejected([...rejected, i]);
        }
        document.getElementById("s").value = e;
    };

    const TableRow = ({data}) => {
        const options = [{value: "Approve", label: "Approve"}, {value: "Reject", label: "Reject"}];
        return data.map((data, i) => 
            <tr key={i}>
                <td>{i + 1}</td>
                <td>{data.ownerName}</td>
                <td>{data.landAddress}</td>
                <td><a href={"https://ipfs.io/ipfs/" + data.ipfsHash} target="_blank"><FileEarmarkFill /></a></td>
                <td>{data.price}</td>
                <td><select id="s" value={{value: "one"}} className="bootstrap-select" onChange={e => handleChange(e.target.value, data.id)}>
                    <option value="">Select</option>
                    <option value="Approve">Approve</option>
                    <option value="Reject">Reject</option>
                </select></td>
            </tr>
        );
    }

    if (user && user.isMember) {
        document.getElementById("navbar").innerHTML="";
    }

    return (
        <div>
            <h1>Process Land Requests</h1>
            <table className="table table-bordered text-center">
                <thead className='thead-dark'>
                    <tr>
                        <th>S.No</th>
                        <th scope="col">Owner</th>
                        <th scope="col">Address</th>
                        <th scope="col">Document</th>
                        <th scope="col">Price</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <TableRow data={lands} />
                </tbody>
            </table>
            <button type="button" className='btn btn-primary' onClick={handleSubmit}>Change Status</button>
        </div>
    );
};

export default Process;