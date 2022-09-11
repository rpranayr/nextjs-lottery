import { ConnectButton } from "web3uikit"

export default function Header() {
    return (
        <div>
            Decentralised Lottery 
            <ConnectButton moralisAuth={false} />
        </div>
    )
}
