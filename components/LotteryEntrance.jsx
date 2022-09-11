import React, { useEffect, useState } from "react"
import { abi, contractAddresses } from "../constants/index"
import { ethers } from "ethers"

// React Moralis has a hook useWeb3Contract() using which we can do contract interactions
import { useWeb3Contract } from "react-moralis"

// getting chainId using moralis
import { useMoralis } from "react-moralis"

// notification hook
import { useNotification } from "web3uikit"

const LotteryEntrance = () => {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    // pull out chainId object and rename it to chainIdHex
    // how does moralis know the chainId?
    // header component (not the header component we made) passes all the info about metamask to the moralis provider and the moralis provider passes that to all the components

    const chainId = parseInt(chainIdHex)
    // get int of the chainId in hex

    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    // if chainId already exists get the contract address otherwise null

    /* STATE HOOKS */
    const [entranceFee, setEntranceFee] = useState("0")
    // when ever setEntranceFee is used to set entranceFee we re-render
    // We use a useState hook to re-render the page because in the useEffect hook, when isWeb3Enabled goes from false to true we re-render and get the entranceFee of the raffle via getEntranceFee() call but when it resolves we'll have to again re-render to show it on our page so we use the useState hook

    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const { runContractFunction: enterRaffle } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })
    // We can get this from hardhat-lottery folder, but every time we change something there we'll have to manually change it here.
    // For this , we are creating a new deploy script (99-update-front-end.js) in the deploy folder of hardhat-lottery which will run and automatically update the values we need to fill in the useWeb3Contract() part

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })
    // get entrance fee

    const { runContractFunction: getNumberofPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberofPlayers",
        params: {},
    })
    // get number of players in the raffle

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })
    // get recent winner

    async function updateUI() {
        const entranceFeeFromContract = (await getEntranceFee()).toString()
        setEntranceFee(entranceFeeFromContract)

        const numPlayersFromContract = (await getNumberofPlayers()).toString()
        setNumPlayers(numPlayersFromContract)

        const recentWinnerFromContract = (await getRecentWinner()).toString()
        setRecentWinner(recentWinnerFromContract)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            // try to read the raffle entrance fee

            updateUI()
        }
    }, [isWeb3Enabled])
    // isWeb3Enabled starts off as false
    // using useEffect such that when isWeb3Enabled goes from false to true causing a re-render we show the raffle entrance fee to the user

    /* Setting up notification to let user know once tx goes through */

    const handleSuccess = async (tx) => {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = () => {
        dispatch({
            type: "success",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div>
            <br></br>
            {raffleAddress ? (
                <div>
                    <button
                        onClick={async () => {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                // onSuccess isn't checking if tx has block confirmation or not, it checks if tx was sent to metamask or not
                                onError: (error) => console.log(error),
                            })
                            // Contract calls comes with 3 ways to handle responses, onSuccess, onError & onComplete
                            // add onError like this in every function call
                        }}
                    >
                        {" "}
                        Enter Raffle{" "}
                    </button>
                    <br></br>
                    Entrance Fee : {ethers.utils.formatUnits(entranceFee, "ether")} ETH
                    <br></br>
                    Number of Players: {numPlayers}
                    <br></br>
                    Winner: {recentWinner}
                </div>
            ) : (
                <div> No Raffle Address Detected</div>
            )}
        </div>
    )
}

export default LotteryEntrance
