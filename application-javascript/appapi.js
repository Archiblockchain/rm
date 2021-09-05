'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

exports.testReturnValue = () => {
    return 'From TestReturn Value';
}

exports.walletPathValue = () => {
    return walletPath;
}

exports.getAllRMAssets = async () => {
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
        //console.log(`*** Result: ${prettyJSONString(result.toString())}`);
        return result;
    }catch (error){    
    console.error(`******** FAILED to run the application: ${error}`);
    }
    finally {
        // Disconnect from the gateway when the application is closing
        // This will close all connections to the network
        gateway.disconnect();
    }
}

exports.addNewAsset = (inputAssetString) => {
    console.log(`*** inside: addnewAsset : ${inputAssetString.toString()}`);
}


