import React, { createContext, Component } from 'react';
import { getBalance } from '../Utils/madNetWalletShim';
import { prevTransactions } from '../Utils/madNetWalletShim';

import { writeConfigRequest } from "secure-electron-store";

const defaultSettings = { "madnetChainID": 66, "madnetProvider": "https://testnet.edge.mnexplore.com/v1/", "ethereumProvider": "https://testnet.eth.mnexplore.com/", "registryContract": "0x70c43ed0989fc0f50772d6a949cb0470753ae486", "theme": "dark" }

export const StoreContext = createContext();

// Class component for storing and updating shared states
export class Store extends Component {
    constructor() {
        super();
        this.state = {
            store: {
                wallet: false,
                balances: {},
                web3Adapter: false,
                madNetAdapter: false,
                settings: false,
                defaultSettings: defaultSettings,
                lastPolledPrevTxBlock: 0, // Last polled block for prevTxs -- Block-256 range we last checked for Txs 
                prevTxs: [],
                currentlyPolling: false,
            },
            actions: {
                addWallet: wallet => this.setState({ store: { ...this.state.store, wallet: wallet } }),
                addWeb3Adapter: web3Adapter => this.setState({ store: { ...this.state.store, web3Adapter: web3Adapter } }),
                addMadNetAdapter: madNetAdapter => this.setState({ store: { ...this.state.store, madNetAdapter: madNetAdapter } }),
                loadSettings: () => {
                    let settings = window && window.api && window.api.store && typeof window.api.store.initial()["config"] !== "undefined" ? JSON.parse(window.api.store.initial()["config"]) : defaultSettings
                    this.setState({ store: { ...this.state.store, settings: settings } })
                },
                updateSettings: (settings) => {
                    this.setState({ store: { ...this.state.store, settings: settings } })
                    if (window && window.api && window.api.store) {
                        window.api.store.send(writeConfigRequest, "config", JSON.stringify(settings));
                    }
                },
                resetSettings: () => {
                    this.setState({ store: { ...this.state.store, settings: defaultSettings } })
                },
                checkBalances: () => this.action_checkBalances(),
                updateLastPolledPrevTxBlock: (blockNum) => this.action_updateLastPolledPrevTxBlock(blockNum),
                updatePrevTxs: () => this.action_updatePrevTxs(),
            }
        };
    }

    action_checkBalances() {
        return new Promise(async res => {
            if (this.state.store?.wallet?.Account.accounts) {
                let balsToGet = [];
                this.state.store.wallet.Account.accounts.forEach(async (a) => {
                    // IIFE to aggregate promises to balances
                    balsToGet.push((() => {
                        return new Promise(async res => {
                            let bal = await getBalance(this.state.store.wallet, a.address, a.curve)
                            res({ address: a.address, balance: bal });
                        })
                    })());
                    // Wait for them all then make state object
                    let balances = await Promise.all(balsToGet);
                    let bals = {}
                    balances.forEach(balObject => {
                        bals[balObject.address] = balObject.balance;
                    })
                    this.setState({ store: { ...this.state.store, balances: bals } });
                    res(true);
                });
            }
        })
    }

    async action_updatePrevTxs() {
        let latestBlockNum = await this.state.store.wallet.Rpc.getBlockNumber()
        if ((latestBlockNum - this.state.store.lastPolledPrevTxBlock) >= 1) {
            this.setState({ store: { ...this.state.store, currentlyPolling: true } });
            let addresses = [];
            this.state.store.wallet?.Account?.accounts.forEach(account => {
                addresses.push({ address: account.address, curve: account.curve });
            })
            let [prevTxs, blockPolled] = await prevTransactions(this.state.store.wallet, addresses);
            this.setState({ store: { ...this.state.store, prevTxs: prevTxs, lastPolledPrevTxBlock: blockPolled, currentlyPolling: false } });
        }
        return
    }

    action_updateLastPolledPrevTxBlock(blockNum) {
        this.setState({ store: { ...this.state.store, lastPolledPrevTxBlock: blockNum } });
    }

    render() {
        return (
            <StoreContext.Provider value={this.state}>
                {this.props.children}
            </StoreContext.Provider>
        );
    }
}