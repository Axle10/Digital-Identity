const fs = require('fs');
const path = require('path');
const buffer = require('buffer').Buffer;


// Import the Identity contract
const Identity = artifacts.require("Identity.sol");

// Configure Web3
const Web3 = require('web3');
const url = 'http://localhost:7545';
const web3 = new Web3(url);
const eventProvider = new Web3.providers.WebsocketProvider('ws://localhost:7545')
web3.setProvider(eventProvider);

// Configure ipfs
const ipfsClient = require('ipfs-api');
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', 'protocol': 'https'});

// Configure web3.shh

// Application Name
const appName = "Digital Identity";


// Import the chai library
require('chai')
	.use(require('chai-as-promised'))
	.should();

// Import abi of Identity contract
const { abi } = require('../src/abis/Identity');

contract('Identity', (accounts) => {

	/**
	 * The following before function runs every time before running the set of test cases
	 * Here before function is an async await function
	 * Here the instance of the deployed contracts is assigned to the identity variable
	 * @params updated: identity
	 */
	let identity;
	let address;
	let identityContract;

	before(async() => {
		identity = await Identity.deployed();
		address = identity.address;
	});

	beforeEach(async() => {
		identityContract = new web3.eth.Contract(abi,address);
	});

	/**
	 * Deployment Test set contains all the test cases related to the deployment of the 
	 * Smart Contract on the blockchain
	 */
	describe('Deployment', async() => {
		
		/**
		 * Deployment Test Case 1: Check whether the smart contract is successfully deployed or not
		 * Test case passes successfully when the followuing conditions are met
		 * 1. address != empty string
		 * 2. address != 0x0 which means no address
		 * 3. address != null
		 * 4. address != undefined
		 */

		it('Deploys successfully', async() => {
			assert.notEqual(address, '');
			assert.notEqual(address, 0x0);
			assert.notEqual(address, null);
			assert.notEqual(address, undefined);
		});
	});

	/**
	 * Check for accounts
	 */
	describe('Accounts',async() => {
		it('Account successfully present', async() => {
			// Get all the accounts
			accounts = await web3.eth.getAccounts();
			assert.notEqual(accounts.length,0);
			assert.equal(accounts.length,10);
			assert.equal(accounts[0],'0x462Ea4760182EA27c5B0fbDD383Ad47dC5d68925');
		});
	});

	/**
	 * Check for the functions of the Smart contract
	 */
	describe('Smart Contract functions', async() => {
		it('Registration function', async() => {
			let nonce;
			await web3.eth.getTransactionCount(accounts[2], (err, txCount) => {
				if(!err){
					nonce = txCount;
				}
			});

			const initialBalance = await web3.eth.getBalance(accounts[2]);

			identityContract.methods.addUser('asd','12','1q3','sadas','adssa')
				.send({
					from: accounts[2],
					gasPrice: 100000000000,
					gas: 4712388,
					value: '1',
					nonce: nonce
				})
				.then(() => {})
				.catch(err => console.log(err));

			const finalBalance = await web3.eth.getBalance(accounts[2]);
			assert(finalBalance < initialBalance);
		});

		it('Get User Details', async() => {
			let users = await identityContract.methods.viewOwnUserDetails().call({ from: accounts[1] });
			assert.equal(users[0], '0x0000000000000000000000000000000000000000');
			assert.notEqual(users[0], accounts[1]);


			users = await identityContract.methods.viewOwnUserDetails().call({ from: accounts[2] })
			assert.equal(users[0], accounts[2]);
		});


		it('Check whether the user is present or not', async() => {
			let exist = await identityContract.methods.checkUserIsPresentOrNot().call({ from: accounts[1] });
			exist = web3.utils.hexToNumber(exist);
			assert.equal(exist,0);

			exist = await identityContract.methods.checkUserIsPresentOrNot().call({ from: accounts[2] });
			exist = web3.utils.hexToNumber(exist);
			assert.equal(exist,1);
		});
	});

	// Use IPFS to upload files and store them in the smart contract
	// Read a file and add it to the ipfs
	// Retreieve its hash and update the smart contract
	describe('File Upload', async() => {
		let ipfsFileHash;
		var fileName='test1.jpg';
		var filePath = path.join(__dirname, `/uploads/${fileName}`);
		
		it('Upload a file in Ipfs and return hash',async() => {
			var file = fs.readFileSync(filePath, { encoding: 'utf8'});
			var buf = buffer(file);
			var result = await ipfs.files.add(buf);
			ipfsFileHash = result[0].hash;
			assert.notEqual(ipfsFileHash,'');
			assert.notEqual(ipfsFileHash,'0000');
		});

		it('Add the hash on the blockchain', async() => {
			let nonce;
			await web3.eth.getTransactionCount(accounts[2], (err, txCount) => {
				if(!err){
					nonce = txCount;
				}
			});

			const initialBalance = await web3.eth.getBalance(accounts[2]);

			let users = await identityContract.methods.viewOwnUserDetails().call({ from: accounts[2] });
			identityContract.methods.updateDetails(
				users[1], users[2], users[3], users[4], ipfsFileHash
			)
			.send({
				from: accounts[2],
				gasPrice: 100000000000,
				gas: 4712388,
				value: '1',
				nonce: nonce	
			})
			.then(() => {})
			.catch(err => console.log(err))

			let finalBalance = await web3.eth.getBalance(accounts[2]);
			users = await identityContract.methods.viewOwnUserDetails().call({ from: accounts[2] });
			
			assert.equal(users[5], ipfsFileHash);
			assert(finalBalance < initialBalance);
		});
	});


	// describe('Send message using web3.shh', async() => {
	// 	it('Send message', async() => {

	// 		// const keyPair = await web3.shh.newKeyPair();
	// 		// const pubKey = await web3.shh.getPublicKey(keyPair);
	// 		await web3.eth.net.isListening();


	// 		const POW_TIME = 100;
	// 		const TTL = 20;
	// 		const POW_TARGET = 2;

			
	// 		await web3.shh.post({
	// 			pubKey: accounts[0],
	// 			sig: accounts[0],
	// 			ttl: TTL,
	// 			topic: [accounts[1]],
	// 			payload: web3.utils.fromAscii('messageContent'),
	// 			powTime: POW_TIME
	// 		});

	// 		web3.shh.subscribe("messages", {
	// 			minPow: POW_TARGET,
	// 			privateKeyID: accounts[1],
	// 			topics: [accounts[1]]
	// 		}).on('data', (data) => {
	// 			console.log(data);
	// 		}).on('error', (err) => {
	// 			console.log(err);
	// 		});
	// 		// var broadcastWatch = shh.watch({ "topic": [ appName ] });
	// 		// broadcastWatch.arrived((m) => {
	// 		// 	if (m.to !== accounts[1])
	// 		// 	{
	// 		// 		// new message m: someone's asking for our name. Let's tell them.
	// 		// 		var broadcaster = web3.toAscii(m.payload).substr(0, 32);
	// 		// 		console.log("Broadcast from " + broadcaster + "; replying to tell them our name.");
	// 				// shh.post({
	// 				// 	"from": eth.key,
	// 				// 	"to": m.from,
	// 				// 	"topics": [ eth.fromAscii(appName), m.from ],
	// 				// 	"payload": [ eth.fromAscii(myName) ],
	// 				// 	"ttl": 2,
	// 				// 	"priority": 500
	// 				// });
	// 		// 	}
	// 		// });
	// 	});
	// });
});

