/* Pass a madnet wallet from state to run some functions specifici to its current state */
export async function getBalance(madWallet, address, curve) {
    try {
        let [utxoids, balance] = await madWallet.Rpc.getValueStoreUTXOIDs(address, curve)
        balance = madWallet.Validator.hexToInt(balance)
        return balance;
    }
    catch (ex) {
        console.log(ex);
    }
}

export async function prevTransactions(madWallet, addresses) {
    try {
        let blockRange = 256;
        let currentBlock = await madWallet.Rpc.getBlockNumber()
        let pTx = [];
        for (let i = currentBlock; i >= (currentBlock - blockRange); i--) {
            let block = await madWallet.Rpc.getBlockHeader(i);
            if (!block["TxHshLst"] || block["TxHshLst"].length <= 0) {
                continue;
            }
            transactionLoop:
            for (let l = 0; l < block["TxHshLst"].length; l++) {
                let tx = await madWallet.Rpc.getMinedTransaction(block["TxHshLst"][l]);
                for (let j = 0; j < tx["Tx"]["Vout"].length; j++) {
                    for (let k = 0; k < addresses.length; k++) {
                        let address = addresses[k]["address"].toLowerCase();
                        let curve = addresses[k]["curve"]
                        if (curve == 2) {
                            curve = "02"
                        }
                        else {
                            curve = "01";
                        }
                        if ((
                            tx["Tx"]["Vout"][j]["AtomicSwap"] &&
                            address == tx["Tx"]["Vout"][j]["AtomicSwap"]["ASPreImage"]["Owner"].slice(4) &&
                            curve == tx["Tx"]["Vout"][j]["AtomicSwap"]["ASPreImage"]["Owner"].slice(2, 4)
                        ) ||
                            (
                                tx["Tx"]["Vout"][j]["ValueStore"] &&
                                address == tx["Tx"]["Vout"][j]["ValueStore"]["VSPreImage"]["Owner"].slice(4) &&
                                curve == tx["Tx"]["Vout"][j]["ValueStore"]["VSPreImage"]["Owner"].slice(2, 4)
                            ) ||
                            (
                                tx["Tx"]["Vout"][j]["DataStore"] &&
                                address == tx["Tx"]["Vout"][j]["DataStore"]["DSLinker"]["DSPreImage"]["Owner"].slice(4) &&
                                curve == tx["Tx"]["Vout"][j]["DataStore"]["DSLinker"]["DSPreImage"]["Owner"].slice(2, 4)
                            )
                        ) {
                            pTx = pTx.concat(tx)
                            continue transactionLoop;
                        }
                    }
                }
            }
        }
        return [pTx, currentBlock];
    }
    catch (ex) {
        console.log(ex)
    }
}

// Inline Tests...
// getBalance("c0ffeeD1835620b81fb8d0cAD1098cE210F739e9", 1)
// prevTransactions([{ address: "c0ffeeD1835620b81fb8d0cAD1098cE210F739e9", curve: 1 }]);