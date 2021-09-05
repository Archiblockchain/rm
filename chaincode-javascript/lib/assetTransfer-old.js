/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    async InitLedger(ctx) {
        const assets = [
            {
                ID: 'asset1',
                RM_Application_No: 'RM0001',
                Primary_Residence_Property_Information: {
                  Subject_Property_Address: {
                    street: '301 Arcadia Drive',
                    city: 'Bloomington',
                    state: 'IL',
                    county: 'Mc Lean',
                    ZIP_Code: '30150'
                  },
                  Legal_Description_of_Subject_Property: '',
                  Property_Title_is_Held_in_These_Names: '',
                  No_of_Units: '',
                  Year_Built: '',
                  Estimate_of_Appraised_Value: '',
                  ResidenceType: 'Primary_Residence',
                  Property_Title_Held_As: 'Fee_Simple',
                  Check_if_Title_is_Also_Held_As: ''
                },
                Borrower_Information: {
                  Borrower_Name: '',
                  Social_Security_Number: '',
                  DOB_MM_DD_YYYY: '',
                  Monthly_Income: '',
                  Real_Estate_Assets: '',
                  Available_Assets: '',
                  Home_Phone: '',
                  Years_of_Residence_at_Present_Address: '',
                  Mailing_Address: '',
                  Marital_Status: 'Married',
                  Alternative_Contact_Person: {
                    name: '',
                    address: '',
                    phone: ''
                  },
                  Total_Non_Real_Estate_Debts: ''
                },
                Liens_Against_Property: {
                  Name_of_Creditor: '',
                  Address_of_Creditor: '',
                  Account_Number: '',
                  Unpaid_Balance: ''
                },
                Declarations: {
                  Are_there_any_outstanding_judgments_against_you: 'NO',
                  Have_you_filed_for_any_bankruptcy_that_has_not_been_solved: 'NO'
                }
              },
              {
                ID: 'asset2',
                RM_Application_No: 'RM0002',
                Primary_Residence_Property_Information: {
                  Subject_Property_Address: {
                    street: '301 Arcadia Drive',
                    city: 'Bloomington',
                    state: 'IL',
                    county: 'Mc Lean',
                    ZIP_Code: '30150'
                  },
                  Legal_Description_of_Subject_Property: '',
                  Property_Title_is_Held_in_These_Names: '',
                  No_of_Units: '',
                  Year_Built: '',
                  Estimate_of_Appraised_Value: '',
                  ResidenceType: 'Primary_Residence',
                  Property_Title_Held_As: 'Fee_Simple',
                  Check_if_Title_is_Also_Held_As: ''
                },
                Borrower_Information: {
                  Borrower_Name: '',
                  Social_Security_Number: '',
                  DOB_MM_DD_YYYY: '',
                  Monthly_Income: '',
                  Real_Estate_Assets: '',
                  Available_Assets: '',
                  Home_Phone: '',
                  Years_of_Residence_at_Present_Address: '',
                  Mailing_Address: '',
                  Marital_Status: 'Married',
                  Alternative_Contact_Person: {
                    name: '',
                    address: '',
                    phone: ''
                  },
                  Total_Non_Real_Estate_Debts: ''
                },
                Liens_Against_Property: {
                  Name_of_Creditor: '',
                  Address_of_Creditor: '',
                  Account_Number: '',
                  Unpaid_Balance: ''
                },
                Declarations: {
                  Are_there_any_outstanding_judgments_against_you: 'NO',
                  Have_you_filed_for_any_bankruptcy_that_has_not_been_solved: 'NO'
                }
            }
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
            console.info(`Asset ${asset.ID} initialized`);
        }
    }

    async CreateAsset(ctx, id, asset) {
        ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
        return JSON.stringify(asset);
    }


    // CreateAsset issues a new asset to the world state with given details.
    // async CreateAsset(ctx, id, color, size, owner, appraisedValue) {
    //     const asset = {
    //         ID: id,
    //         Color: color,
    //         Size: size,
    //         Owner: owner,
    //         AppraisedValue: appraisedValue,
    //     };
    //     ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
    //     return JSON.stringify(asset);
    // }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, id, color, size, owner, appraisedValue) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedAsset)));
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, id) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    async TransferAsset(ctx, id, newOwner) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        asset.Owner = newOwner;
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }


}

module.exports = AssetTransfer;
