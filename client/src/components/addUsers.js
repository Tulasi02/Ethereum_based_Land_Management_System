import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft } from 'react-bootstrap-icons';

const AddUsers = () => {
    const navigate = useNavigate();
    const location = useLocation();
    let aadhaar;

    if (location.state) {
        aadhaar = location.state.aadhaar;
    }

    const [user, setUser] = useState();   
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const networkId = await web3.eth.net.getId();
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            setUser(await contract.methods.Users(aadhaar).call());
            const registered = await contract.methods.getRegisteredUsers().call();
            for (let i = 0; i < registered.length; i++) {
                setUsers([...users, await contract.methods.Users(registered[i]).call()]);
            }
        }
        func();
    }, []);

    const handleBack = () => {
        navigate("/", {state: {aadhaar: aadhaar}});
    }

    const handleAdd = async (ua) => {
        const web3 = new Web3(window.ethereum);
        const account = await window.ethereum.request({method: 'eth_requestAccounts'});
        const networkId = await web3.eth.net.getId();
        const address = Land.networks[networkId].address;
        const contract = new web3.eth.Contract(Land.abi, address);
        await contract.methods.addUser(ua).send({from: account[0]});
        window.location.reload(true);
        navigate('/add', {state: {aadhaar: aadhaar}});
    };

    const TableRow = ({data}) => {
        const options = [{value: "Approve", label: "Approve"}, {value: "Reject", label: "Reject"}];
        return data.map((data, i) => 
            <tr key={i}>
                <td>{i + 1}</td>
                <td>{data.name}</td>
                <td>{data.aadhaar}</td>
                <td>{data.pan}</td>
                <td>{data.email}</td>
                <td>{data.phoneno}</td>
                <td><img src={"https://ipfs.io/ipfs/" + data.image} width="70px" height="70px" /></td>
                <td><button type="btn" className="btn btn-primary" onClick={() => handleAdd(data.aadhaar)}>Add</button></td>
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
            <h1>Add User</h1>
            <table className="table table-bordered text-center">
                <thead className='thead-dark'>
                    <tr>
                        <th>S.No</th>
                        <th scope="col">User Name</th>
                        <th scope="col">Aadhaar</th>
                        <th scope="col">PAN No</th>
                        <th scope="col">Email</th>
                        <th scope="col">Phone no</th>
                        <th scope="col">Image</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    <TableRow data={users} />
                </tbody>
            </table>
        </div>
    );
};

export default AddUsers;