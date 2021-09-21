import React from 'react';
import { StoreContext } from "../Store/store.js";
import { Loader, Icon } from 'semantic-ui-react';

export default function BalanceDisplay({ address, hideRefresh }) {

    const { store, actions } = React.useContext(StoreContext)
    const [loading, setLoading] = React.useState(true);

    const loadTimeout = React.useRef(false);

    // Without any loading it looks like a click does nothing - Artificial it by just a bit
    const checkBal = React.useCallback(async () => {
        setLoading(true);
        await actions.checkBalances();
        loadTimeout.current = setTimeout( () => {
            setLoading(false);
        }, 1250)
    }, [])

    React.useEffect(() => {
        checkBal();
        return () => {
            clearTimeout(loadTimeout)
        }
    }, []);

    return (
        <div>
            Balance: {loading ? "..." : store.balances[address] ? store.balances[address] : 0} MadBytes
            {loading ? (
                <Loader active size="mini" style={{ marginLeft: "-2px" }} />
            ) : hideRefresh ? null : (
                <Icon className="refresh-icon" name="refresh" onClick={checkBal} style={{ marginLeft: "1rem" }} />
            )}
        </div>
    )

}