import React from 'react';
import { Grid, Header, Segment, Loader, Popup, Icon } from "semantic-ui-react";
import { prevTransactions } from '../../Utils/madNetWalletShim';
import { StoreContext } from '../../Store/store';
import usePrevious from '../../hooks/usePrevious';

export default function PrevTx({ states }) {

    const { store, actions } = React.useContext(StoreContext);
    const txs = store.prevTxs;
    const loading = store.currentlyPolling;

    const blockPollTimeout = React.useRef();

    // Get and store latest block # on component mount
    React.useEffect(() => {
        actions.updatePrevTxs();
        blockPollTimeout.current = setInterval(actions.updatePrevTxs, 10000)
        return () => clearInterval(blockPollTimeout.current)
    }, [])

    const getTxs = () => {

        const sendToInpection = (txHash) => {
            states.setForwardLookupTx(txHash);
            states.setMadnetPanel("txExplorer");
        }

        return txs.length > 0 ? txs.map(tx => {
            tx = tx["Tx"];
            console.log(tx);
            let vin = tx["Vin"];
            let vout = tx["Vout"];
            let txHash = vin[0]["TXInLinker"]["TxHash"]
            return (
                <Grid.Column key={txHash}>
                    <Segment size="mini" className="prevtx-segment" onClick={() => sendToInpection(txHash)}>
                        <Header textAlign="left" style={{ marginBottom: "0px" }}>Tx Hash:
                            <Header.Subheader style={{ display: "inline-block", marginLeft: "1rem" }}>{txHash.slice(0, 12) + "..." + txHash.slice(46, txHash.length)}</Header.Subheader>
                        </Header>
                    </Segment>
                </Grid.Column>
            )
        }) : <Grid.Column> No transactions found yet </Grid.Column>
    }

    return (

        <Grid>
            <Grid.Column width={16}>
                <div style={{ marginTop: ".75rem" }}>
                    Your Previous Transactions (Last 256 Blocks) <Popup size="mini" offset={"-9,4"} trigger={<Icon name="question circle" size="small" />} content="May take time for TXs to appear - Last 256 Blocks Only" />
                </div>
            </Grid.Column>

            <Grid.Column width={16}>
                <Grid columns={txs.length > 0 ? 2 : 1}>
                    {getTxs()}
                    <Grid.Column width={16}>
                        <Loader inline active={loading} centered size="small" content="Checking for new transactions..." />
                    </Grid.Column>
                </Grid>
            </Grid.Column>
        </Grid>

    )

}