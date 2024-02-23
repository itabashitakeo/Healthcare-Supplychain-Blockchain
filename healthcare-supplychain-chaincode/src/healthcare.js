'use strict';
const shim = require('fabric-shim');
const util = require('util');

const stateType = {
    Bank: 'settled',
    Supplier: 'settled',
    ABC: 'settled',
    Retailer: 'settled',
    Outercom: 'settled'
    //Disposal: 'Disposed',
    //Manufacturer: 'Manufacturered',
    //Distributor: 'Distributed',
    //Hospital: 'Delivered',
    //Pharmacy: 'Delivered',
    //Customer: 'Sold',
    //Recall: 'Recalled',
    //Disposal: 'Disposed'
};


async function queryByString(stub, queryString) {
    let Type = "";
    let startKey = "";
    let endKey = "";
    let jsonQueryString = JSON.parse(queryString);
    if (jsonQueryString['selector'] && jsonQueryString['selector']['Type']) {
        Type = jsonQueryString['selector']['Type'];
        startKey = Type + "0";
        endKey = Type + "z";
    }
    else {
        throw new Error('##### queryByString - Cannot call queryByString without a docType element: ' + queryString);
    }

    let iterator = await stub.getStateByRange(startKey, endKey);

    // Iterator handling is identical for both CouchDB and LevelDB result sets, with the 
    // exception of the filter handling in the commented section below
    let allResults = [];
    while (true) {
        let res = await iterator.next();

        if (res.value && res.value.value.toString()) {
            let jsonRes = {};
            console.log('##### queryByString iterator: ' + res.value.value.toString('utf8'));

            jsonRes.Key = res.value.key;
            try {
                jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
            }
            catch (err) {
                console.log('##### queryByString error: ' + err);
                jsonRes.Record = res.value.value.toString('utf8');
            }

            // ******************* LevelDB filter handling ******************************************
            /**
            // LevelDB: additional code required to filter out records we don't need
            // Check that each filter condition in jsonQueryString can be found in the iterator json
            // If we are using CouchDB, this isn't required as rich query supports selectors
            let jsonRecord = jsonQueryString['selector'];
            // If there is only a docType, no need to filter, just return all
            console.log('##### queryByString jsonRecord - number of JSON keys: ' + Object.keys(jsonRecord).length);
            if (Object.keys(jsonRecord).length == 1) {
                allResults.push(jsonRes);
                continue;
            }
            for (var key in jsonRecord) {
                if (jsonRecord.hasOwnProperty(key)) {
                    console.log('##### queryByString jsonRecord key: ' + key + " value: " + jsonRecord[key]);
                    if (key == "docType") {
                        continue;
                    }
                    console.log('##### queryByString json iterator has key: ' + jsonRes.Record[key]);
                    if (!(jsonRes.Record[key] && jsonRes.Record[key] == jsonRecord[key])) {
                        // we do not want this record as it does not match the filter criteria
                        continue;
                    }
                    allResults.push(jsonRes);
                }
            }
            */
            // ******************* End LevelDB filter handling ******************************************
            // For CouchDB, push all results
            allResults.push(jsonRes);
        }
        if (res.done) {
            await iterator.close();
            console.log('##### queryByString all results: ' + JSON.stringify(allResults));
            console.log('============= END : queryByString ===========');
            return Buffer.from(JSON.stringify(allResults));
        }
    }
}


let Chaincode = class {

    async Init(stub) {
        return shim.success();
    }

    async Invoke(stub) {
        //Read input parameters
        let ret = stub.getFunctionAndParameters();

        //Read function name
        let method = this[ret.fcn];
        if (!method) {
            console.error('##### Invoke - error: no chaincode function with name: ' + ret.fcn + ' found');
            throw new Error('No chaincode function with name: ' + ret.fcn + ' found');
        }
        try {
            //Invoke method
            let response = await method(stub, ret.params);
            //Return the respose
            return shim.success(response);
        } catch (err) {
            console.log('##### Invoke - error: ' + err);
            return shim.error(err);
        }
    }

    async initLedger(stub, args) {

    }

    /**
  * Creates a new Manufacturer
  * 
  * @param {*} stub 
  * @param {*} args - JSON as follows:
  * {
   "manufacturerId": "1",
   "manufacturerName": "manufacturer1",
   "manufacturerLocation":"AL"
    }
 
    async createManufacturer(stub, args) {
        //Read input values
        let json = JSON.parse(args);
        let manufacturerId = 'manufacturer' + json['ManufacturerId'];
        json['Type'] = 'manufacturer';

        // Check if the manufacturer already exists, read data from ledger
        let manufacturer = await stub.getState(manufacturerId);
        if (manufacturer.toString()) {
            throw new Error('##### createManufacturer - This manufacturer already exists: ' + json['ManufacturerId']);
        }
        //Insert into peer ledger
        await stub.putState(manufacturerId, Buffer.from(JSON.stringify(json)));
    }
*/

    async createBank(stub, args) {
        //Read input values
        let json = JSON.parse(args);
        let bankId = 'Bank' + json['BankId'];
        json['Type'] = 'Bank';

        // Check if the Bank already exists, read data from ledger
        let bank = await stub.getState(bankId);
        if (bank.toString()) {
            throw new Error('##### createBank - This Bank already exists: ' + json['BankId']);
        }
        //Insert into peer ledger
        await stub.putState(bankId, Buffer.from(JSON.stringify(json)));
    }

    /**
  * Creates a new Supplier
  * 
  * @param {*} stub 
  * @param {*} args - JSON as follows:
  * {
   "SupplierId": "1",
   "SupplierName": "Supplier1",
   "SupplierLocation":"AL"
    }
  */
    async createSupplier(stub, args) {
        //Read input values
        let json = JSON.parse(args);
        let supplierId = 'Supplier' + json['SupplierId'];
        json['Type'] = 'Supplier';

        // Check if the Supplier already exists, read data from ledger
        let supplier = await stub.getState(supplierId);
        if (supplier.toString()) {
            throw new Error('##### createSupplier - This supplier already exists: ' + json['SupplierId']);
        }
        //Insert into peer ledger
        await stub.putState(supplierId, Buffer.from(JSON.stringify(json)));
    }

    /**
* Creates a new distributor
* 
* @param {*} stub 
* @param {*} args - JSON as follows:
* {
"distributorId": "1",
"distributorName": "distributor1",
"distributorLocation":"IL"
}

* Creates a new hospital
* 
* @param {*} stub 
* @param {*} args - JSON as follows:
* {
"hospitalId": "1",
"hospitalName": "hospital1",
"hospitalLocation":"CO"
}
*/
    async createABC(stub, args) {
        //Read input values
        let json = JSON.parse(args);
        let abcId = 'ABC' + json['ABCId'];
        json['Type'] = 'ABC';

        // Check if the ABC already exists, read data from ledger
        let abc = await stub.getState(abcId);
        if (abc.toString()) {
            throw new Error('##### createABC - This ABC already exists: ' + json['ABCId']);
        }
        //Insert into peer ledger
        await stub.putState(abcId, Buffer.from(JSON.stringify(json)));
    }

        /**
* Creates a new Retailer
* 
* @param {*} stub 
* @param {*} args - JSON as follows:
* {
"RetailerId": "1",
"RetailerName": "Retailer1",
"RetailerLocation":"CA"
}
*/
    async createRetailer(stub, args) {
        //Read input values
        let json = JSON.parse(args);
        let retailerId = 'Retailer' + json['RetailerId'];
        json['Type'] = 'retailer';

        // Check if the Retailer already exists, read data from ledger
        let retailer = await stub.getState(retailerId);
        if (retailer.toString()) {
            throw new Error('##### createRetailer - This Retailer already exists: ' + json['RetailerId']);
        }
        //Insert into peer ledger
        await stub.putState(retailerId, Buffer.from(JSON.stringify(json)));
    }
    async createOutercom(stub, args) {
        //Read input values
        let json = JSON.parse(args);
        let outercomId = 'Outercom' + json['OutercomId'];
        json['Type'] = 'outercom';

        // Check if the Retailer already exists, read data from ledger
        let outercom = await stub.getState(outercomId);
        if (outercom.toString()) {
            throw new Error('##### creatOutercom - This outercom already exists: ' + json['OutercomId']);
        }
        //Insert into peer ledger
        await stub.putState(outercomId, Buffer.from(JSON.stringify(json)));
    }
/**
  * Creates a new Asset
  * 
  * @param {*} stub 
  * @param {*} args - JSON as follows:
  * {
   "assetId": "1",
   "assetName": "needle",
   "assetType":"Medical Supplies", 
   "assetExpirtyDate":"2019-12-30",
   "owner":"1"//ManufacturerId,
   "state":"Manufacturered",
    }
  */
    async createAsset(stub, args) {
        //Read input values
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        //Each document in CouchDB should have docType for better quey performance
        json['Type'] = 'asset';
        // Check if the assset already exists, read data from ledger
        let asset = await stub.getState(trackingNumber);
        if (asset.toString()) {
            throw new Error('##### createAsset - This trackingnumber already exists: ' + json['TrackingNumber']);
        }
        //Insert into peer ledger
        await stub.putState(trackingNumber, Buffer.from(JSON.stringify(json)));
    }

    async createLiability(stub, args) {
        //Read input values
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        json['Type'] = 'liability';
        // Check if the assset already exists, read data from ledger
        let liability = await stub.getState(trackingNumber);
        if (liability.toString()) {
            throw new Error('##### createLiability - This trackingnumber already exists: ' + json['TrackingNumber']);
        }
        //Insert into peer ledger
        await stub.putState(trackingNumber, Buffer.from(JSON.stringify(json)));
    }
    async creatEquity(stub, args) {
        //Read input values
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        //json['Owner'] = 'ABC' + json['Owner'];
        json['Type'] = 'equity';
        // Check if the assset already exists, read data from ledger
        let equity = await stub.getState(trackingNumber);
        if (equity.toString()) {
            throw new Error('##### createEquity - This trackingnumber already exists: ' + json['TrackingNumber']);
        }
        //Insert into peer ledger
        await stub.putState(trackingNumber, Buffer.from(JSON.stringify(json)));
    }
    async creatProfit(stub, args) {
        //Read input values
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        //json['Owner'] = 'ABC' + json['Owner'];
        json['Type'] = 'profit';
        // Check if the assset already exists, read data from ledger
        let profit = await stub.getState(trackingNumber);
        if (profit.toString()) {
            throw new Error('##### createProfit - This trackingnumber already exists: ' + json['TrackingnNmber']);
        }
        //Insert into peer ledger
        await stub.putState(trackingNumber, Buffer.from(JSON.stringify(json)));
    }
    async creatLoss(stub, args) {
        //Read input values
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        //json['Owner'] = 'ABC' + json['Owner'];
        json['Type'] = 'loss';
        // Check if the assset already exists, read data from ledger
        let loss = await stub.getState(trackingNumber);
        if (loss.toString()) {
            throw new Error('##### createLoss - This trackingnumber already exists: ' + json['TrackingNumber']);
        }
        //Insert into peer ledger
        await stub.putState(trackingNumber, Buffer.from(JSON.stringify(json)));
    }

    async getAssetDetail(stub, args) {
        //Read input values
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        //read data from ledger
        let assetAsBytes = await stub.getState(trackingNumber);
        if (!assetAsBytes || assetAsBytes.toString().length <= 0) {
            throw new Error(`${trackingNumber} of asset does not exist`);
        }
        return assetAsBytes;
    }
    async getLiabilityDetail(stub, args) {
        //Read input values
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        //read data from ledger
        let liabilityAsBytes = await stub.getState(trackingNumber);
        if (!liabilityAsBytes || liabilityAsBytes.toString().length <= 0) {
            throw new Error(`${trackingNumber} of liability does not exist`);
        }
        return liabilityAsBytes;
    }
    async getEquityDetail(stub, args) {
        //Read input values
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        //read data from ledger
        let equityAsBytes = await stub.getState(trackingNumber);
        if (!equityAsBytes || equityAsBytes.toString().length <= 0) {
            throw new Error(`${trackingNumber} of equity does not exist`);
        }
        return equityAsBytes;
    }
    async getProfitDetail(stub, args) {
        //Read input values
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        //read data from ledger
        let profitAsBytes = await stub.getState(trackingNumber);
        if (!profitAsBytes || profitAsBytes.toString().length <= 0) {
            throw new Error(`${trackingNumber} of profit does not exist`);
        }
        return profitAsBytes;
    }
    async getLossDetail(stub, args) {
        //Read input values
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        //read data from ledger
        let lossAsBytes = await stub.getState(trackingNumber);
        if (!lossAsBytes || lossAsBytes.toString().length <= 0) {
            throw new Error(`${trackingNumber} of loss does not exist`);
        }
        return lossAsBytes;
    }
/**
 * Retrieves all donors
 * 
 * @param {*} stub 
 * @param {*} args 
*/
  　async queryAllAssets(stub, args) {
        console.log('============= START : queryAllAssets ===========');
        console.log('##### queryAllAssets arguments: ' + JSON.stringify(args));
        let queryString = '{"selector": {"Type": "asset"}}';
        return queryByString(stub, queryString);
    }
    async queryAllLiabilities(stub, args) {
        console.log('============= START : queryAllLiabilities ===========');
        console.log('##### queryAllLiabilities arguments: ' + JSON.stringify(args));
        let queryString = '{"selector": {"Type": "liability"}}';
        return queryByString(stub, queryString);
    }
    async queryAllEquities(stub, args) {
        console.log('============= START : queryAllEquities ===========');
        console.log('##### queryAllEquities arguments: ' + JSON.stringify(args));
        let queryString = '{"selector": {"Type": "equity"}}';
        return queryByString(stub, queryString);
    }
    async queryAllProfits(stub, args) {
        console.log('============= START : queryAllProfits ===========');
        console.log('##### queryAllProfits arguments: ' + JSON.stringify(args));
        let queryString = '{"selector": {"Type": "profit"}}';
        return queryByString(stub, queryString);
    }
        async queryAllLosses(stub, args) {
        console.log('============= START : queryAllLosses ===========');
        console.log('##### queryAllLosses arguments: ' + JSON.stringify(args));
        let queryString = '{"selector": {"Type": "loss"}}';
        return queryByString(stub, queryString);
    }

    async queryAll(stub, args) {
        console.log('============= START : queryAll ===========');
        console.log('##### queryAll arguments: ' + JSON.stringify(args));
        //Read input values
        let json = JSON.parse(args);
        let owner = json['Owner'];
        let queryString = '{"selector": {"Type": "' + owner + '"}}';
        return queryByString(stub, queryString);
    }
 /**
* Transfer asset
* 
* @param {*} stub 
* @param {*} args - JSON as follows:
* {
"assetId": "1",
"transferTo": "1",
"transferToMember":"distributor"
}
*/
    // Deletes an entity from state

   async transferAsset(stub, args) {
        //Read input value
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        let assetAsBytes = await stub.getState(trackingNumber);
        let asset = JSON.parse(assetAsBytes.toString());
        //update asset details
        asset.TransactionDate = json['TransactionDate'];
        asset.Owner = json['TransferTo'];
        asset.CounterpartyNumber = json['CounterpartyNumber'];
        await stub.putState(trackingNumber, Buffer.from(JSON.stringify(asset)));
    }
    async transferLiability(stub, args) {
        //Read input value
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        let liabilityAsBytes = await stub.getState(trackingNumber);
        let liability = JSON.parse(liabilityAsBytes.toString());
        //update asset details
        liability.TransactionDate = json['TransactionDate'];
        liability.Owner = json['TransferTo'];
        liability.CounterpartyNumber = json['CounterpartyNumber'];
        //liability.state = json['state'];
        await stub.putState(trackingNumber, Buffer.from(JSON.stringify(liability)));
    }
    async transferEquity(stub, args) {
        //Read input value
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        let equityAsBytes = await stub.getState(trackingNumber);
        let equity = JSON.parse(equityAsBytes.toString());
        //update asset details
        equity.TransactionDate = json['TransactionDate'];
        equity.Owner = json['TransferTo'];
        equity.CounterpartyNumber = json['CounterpartyNumber'];
        //equity.state = json['state'];
        await stub.putState(trackingNumber, Buffer.from(JSON.stringify(equity)));
    }

    async updateAsset(stub, args) {
        //Read input value
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        let assetAsBytes = await stub.getState(trackingNumber);
        let asset = JSON.parse(assetAsBytes.toString());
        //update asset details
        asset.TransactionDate = json['TransactionDate'];
        asset.Name = json['name'];
        asset.Owner = json['Owner'];
        asset.Price = json['Price'];
        asset.Quantity = json['Quantity'];
        asset.CounterpartyNumber = json['CounterpartyNumber'];
        await stub.putState(trackingNumber, Buffer.from(JSON.stringify(asset)));
    }
    async updateLiability(stub, args) {
        //Read input value
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        let liabilityAsBytes = await stub.getState(trackingNumber);
        let liability = JSON.parse(liabilityAsBytes.toString());
        //update asset details
        liability.TransactionDate = json['TransactionDate'];
        liability.Name = json['name'];
        liability.Owner = json['Owner'];
        liability.Price = json['Price'];
        liability.Quantity = json['Quantity'];
        liability.CounterpartyNumber = json['CounterpartyNumber'];
        await stub.putState(trackingNumber, Buffer.from(JSON.stringify(liability)));
    }
    async updateEquity(stub, args) {
        //Read input value
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        let equityAsBytes = await stub.getState(trackingNumber);
        let equity = JSON.parse(equityAsBytes.toString());
        //update asset details
        equity.TransactionDate = json['TransactionDate'];
        equity.Name = json['name'];
        equity.Owner = json['Owner'];
        equity.Price = json['Price'];
        equity.Quantity = json['Quantity'];
        equity.CounterpartyNumber = json['CounterpartyNumber'];
        await stub.putState(trackingNumber, Buffer.from(JSON.stringify(equity)));
    }
    async updateProfit(stub, args) {
        //Read input value
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        let profitAsBytes = await stub.getState(trackingNumber);
        let profit = JSON.parse(profitAsBytes.toString());
        //update asset details
        profit.TransactionDate = json['TransactionDate'];
        profit.Name = json['name'];
        profit.Owner = json['Owner'];
        profit.Price = json['Price'];
        profit.Quantity = json['Quantity'];
        profit.CounterpartyNumber = json['CounterpartyNumber'];
        await stub.putState(trackingNumber, Buffer.from(JSON.stringify(profit)));
    }
    async updateLoss(stub, args) {
        //Read input value
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        let lossAsBytes = await stub.getState(trackingNumber);
        let loss = JSON.parse(lossAsBytes.toString());
        //update asset details
        loss.TransactionDate = json['TransactionDate'];
        loss.Name = json['name'];
        loss.Owner = json['Owner'];
        loss.Price = json['Price'];
        loss.Quantity = json['Quantity'];
        loss.CounterpartyNumber = json['CounterpartyNumber'];
        await stub.putState(trackingNumber, Buffer.from(JSON.stringify(loss)));
    }

    async delete(stub, args) {
        //Read input value
        let json = JSON.parse(args);
        let trackingNumber = json['TrackingNumber'];
        // Delete the key from the state in ledger
        await stub.deleteState(trackingNumber);
    }
    /**
  * Retrieves the Fabric block and transaction details for a key or an array of keys
  * 
  * @param {*} stub 
  * @param {*} args - JSON as follows:
  * [
  *    {"key": "a207aa1e124cc7cb350e9261018a9bd05fb4e0f7dcac5839bdcd0266af7e531d-1"}
  * ]
  * 
  */
    async queryHistoryForKey(stub, args) {
        console.log('============= START : queryHistoryForKey ===========');
        console.log('##### queryHistoryForKey arguments: ' + JSON.stringify(args));

        // args is passed as a JSON string
        let json = JSON.parse(args);
        let key = json['key'];
        let docType = json['docType']
        console.log('##### queryHistoryForKey key: ' + key);
        let historyIterator = await stub.getHistoryForKey(docType + key);
        console.log('##### queryHistoryForKey historyIterator: ' + util.inspect(historyIterator));
        let history = [];
        while (true) {
            let historyRecord = await historyIterator.next();
            console.log('##### queryHistoryForKey historyRecord: ' + util.inspect(historyRecord));
            if (historyRecord.value && historyRecord.value.value.toString()) {
                let jsonRes = {};
                console.log('##### queryHistoryForKey historyRecord.value.value: ' + historyRecord.value.value.toString('utf8'));
                jsonRes.TxId = historyRecord.value.tx_id;
                jsonRes.Timestamp = historyRecord.value.timestamp;
                jsonRes.IsDelete = historyRecord.value.is_delete.toString();
                try {
                    jsonRes.Record = JSON.parse(historyRecord.value.value.toString('utf8'));
                } catch (err) {
                    console.log('##### queryHistoryForKey error: ' + err);
                    jsonRes.Record = historyRecord.value.value.toString('utf8');
                }
                console.log('##### queryHistoryForKey json: ' + util.inspect(jsonRes));
                history.push(jsonRes);
            }
            if (historyRecord.done) {
                await historyIterator.close();
                console.log('##### queryHistoryForKey all results: ' + JSON.stringify(history));
                console.log('============= END : queryHistoryForKey ===========');
                return Buffer.from(JSON.stringify(history));
            }
        }
    }
}
shim.start(new Chaincode());

                                                                                                                                                                          