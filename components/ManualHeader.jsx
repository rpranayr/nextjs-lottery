import { useMoralis } from "react-moralis"
import { useEffect } from "react"

export default function ManualHeader() {
    const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } =
        useMoralis()
    // This is a hook, hooks allow functional components to have access to state and other react features
    // isWeb3Enabled tells us if metamask is connected or not
    // address of the connected web3 wallet

    useEffect(() => {
        if (isWeb3Enabled) return
        if (typeof window !== "undefined") {
            if (window.localStorage.getItem("connected")) {
                enableWeb3()
                // with this if you had connected mm previously and hit refresh it still stays connected
                // but if you never connected it will give the mm connect popup every time you refresh
                // to avoid that we use the next useEffect
            }
        }
    }, [isWeb3Enabled])
    // no dependency array : run anytime something re-renders
    // blank dependency array : run once on load
    // non blank dependency array: run when the array changes

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account changed to ${account}`)
            if (account == null) {
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("Null account found")
            }
        })
    }, [])

    return (
        <div>
            {account ? (
                <div>
                    Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3()
                        if (typeof window !== "undefined") {
                            window.localStorage.setItem("connected", "injected")
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect Wallet
                </button>
            )}
        </div>
    )
    // disable the button if mm popup is there on screen
    // if account is connected show the address, if not show the connect button
}
