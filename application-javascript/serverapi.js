'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const appapi = require('../application-javascript/appapi');

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';


const express = require('express');
const app = express();
const port = 80;

app.use(express.json());


function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function getAllRMAssetsapi(){
    const ccp = buildCCPOrg1();
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();
    try {
        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        let result = await contract.evaluateTransaction('GetAllAssets');
        console.log(`*** Result: ${prettyJSONString(result.toString())}`);
        return result;
    }catch (error){    
    console.error(`******** FAILED to run the application: ${error}`);
    }
    finally {
        gateway.disconnect();
    }
}

app.get('/WalletPathValue', (req, res) => {
    let returnvalue = appapi.walletPathValue();
    res.send(returnvalue.toString());
});

app.get('/getAllRMAssets', (req, res) => {
    res.send(getAllRMAssetsapi().toString());
});

app.get('/getRMAssetbyid', (req, res) => {
    res.send(readassetbyid().toString());
});

app.post('/AddNewAsset', (req, res) => {
    const inputValue = req.body;
    let result = testInput(inputValue)
  //  appapi.addNewAsset(result);
    res.send('Sucess!');
});

async function testInput(inputValue){
    console.log(inputValue);
    const ccp = buildCCPOrg1();
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();
    try {
        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        result = await contract.submitTransaction('CreateAsset', 'asset100', inputValue);
        console.log(`*** Result: ${prettyJSONString(result.toString())}`);
        return result;
    }catch (error){    
        console.error(`******** FAILED to run the application: ${error}`);
        }
        finally {
            gateway.disconnect();
        }
}

async function readassetbyid(){
    const ccp = buildCCPOrg1();
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();
    try {
        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        let result = await contract.evaluateTransaction('AssetExists', 'asset1');
        console.log(`*** Result: ${prettyJSONString(result.toString())}`);
        return result;
    }catch (error){    
        console.error(`******** FAILED to run the application: ${error}`);
        }
        finally {
            gateway.disconnect();
        }
}

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))
