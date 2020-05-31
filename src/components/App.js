import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';

const ipfsClient = require('ipfs-api');
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'})
class App extends Component {

	async componentWillMount() {
		await this.loadWeb3();
		await this.loadBlockchainData();
	}

	async loadWeb3() {
		if(window.ethereum) {
			window.web3 = new Web3(window.ethereum);
			await window.ethereum.enable();
		}
		if(window.web3) {
			window.web3 = new Web3(window.web3.currentProvider);
		}
		else {
			window.alert('Please Use Metamask')
		}
	}

	async loadBlockchainData() {
		const web3 = window.web3;
		const accounts = await web3.eth.getAccounts();
	}


	render() {
		return (
			<div>
				<nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
					<a
						className="navbar-brand col-sm-3 col-md-2 mr-0"
						target="_blank"
						rel="noopener noreferrer"
					>
						Digital Identity Management
					</a>
				</nav>
				<div className="container-fluid mt-5">
				
				</div>
			</div>
		);
	}
}

export default App;
