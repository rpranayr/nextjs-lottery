import { useMoralis } from "react-moralis"

export default function ManualHeader() {
    const {enableWeb3} = useMoralis()
    // This is a hook, hooks allow functional components to have access to state and other react features 

    return(<div>
        <button onClick={async () => {await enableWeb3()}}>Connect Wallet</button>
    </div>)
}