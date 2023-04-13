import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import Land from '../contracts/Land.json';

const Process = () => {

    const [lands, setLands] = useState([]);
    const [register, setRegister] = useState([]);
    const [approved, setApproved] = useState([]);
    const [rejected, setRejected] = useState([]);

    useEffect(() => {
        const func = async () => {
            const web3 = new Web3(window.ethereum);
            const networkId = await web3.eth.net.getId()
            const address = Land.networks[networkId].address;
            const contract = new web3.eth.Contract(Land.abi, address);
            const registered = await contract.methods.getRegisteredLands().call();
            setRegister([...register, ...registered]);
            let land;
            for (let i = 0; i < registered.length; i++) {
                land = await contract.methods.Lands(registered[i]).call();
                setLands([...lands, land]);
            }
        }
        func();
    }, []);

    // const handleApprove = (id) => {
    //     setApproved([...approved, id]);
    // }

    // const handleReject = (id) => {
    //     setRejected([...rejected, id]);
    // }

    // const handleSubmit = async () => {
    //     const web3 = new Web3(window.ethereum);
    //     const account = await window.ethereum.request({method: 'eth_requestAccounts'});
    //     const networkId = await web3.eth.net.getId()
    //     const address = Land.networks[networkId].address;
    //     const contract = new web3.eth.Contract(Land.abi, address);
    //     // const registered = await contract.methods.changeStatus(approved, rejected).from({account: 'status'});
    //     // console.log(registered);
    // }

    const handleChange = (id, e) => {
        console.log(id, e.value);
    };

    const TableRow = ({data}) => {
        return data.map((data, i) => 
            <tr key={i}>
                <td>{data.id}</td>
                <td>{data.landAddress}</td>
                <td>{data.ipfsHash}</td>
                <td>{data.price}</td>
                <td>{data.ownerAccount}</td>
                <td><select className="bootstrap-select" onSelect={e => handleChange(data.id, this)}>
                    <option value="0" selected="selected">Registered</option>
                    <option value="1">Approve</option>
                    <option value="2">Reject</option>
                </select></td>
            </tr>
        );
    }

    return (
        <div>
            <h1>Process Land Register Request</h1>
            {/* {(register.length > 0 && lands.length > 0) && (
                <AgGridReact
                columnDefs={columnDefs}
                rowData={lands} />
            )}  */}

            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Address</th>
                        <th>Document</th>
                        <th>Price</th>
                        <th>Owner</th>
                        <th>Status</th>
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