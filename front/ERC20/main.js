let address, provider, signer, contractRead, contractWrite

const connectMetamask = async () => {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    provider = new ethers.providers.Web3Provider(window.ethereum)

    // MetaMask requires requesting permission to connect users accounts
    await provider.send("eth_requestAccounts", []);

    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    signer = provider.getSigner()

    address = await signer.getAddress()
    
    console.log(address)
}

const getNativeBalance = async () => {
    console.log("")
    console.log("getNativeBalance")
    console.log("")

    const balance = await provider.getBalance(address)
    const formattedBalance = ethers.utils.formatEther(balance)

    console.log(balance)
    console.log(formattedBalance)
}

const getNetwork = async () => {
    console.log("")
    console.log("getNetwork")
    console.log("")

    const network = await provider.getNetwork();

    console.log(network)
}

//Para crear una instancia de un contrato y poder atacarlo son necesarias tres partes
// 1- Provider/Signer, porque necesitamos una conexion con la blockchain
// 2- Contract Address, porque una referencia de donde atacar en la blockchain
// 3- Contract ABI (Application Binary Interface), porque necesitamos lo que puede hacer el contrato

let contractAddress = "0xe745d1eDdB571C3FDd6a73477c7f08DB3Bf2dF23"

import ContractABI from "../../artifacts/contracts/ERC20/MyCoin.sol/MyCoin.json" assert {type: "json"}
const ContractInterface = new ethers.utils.Interface(ContractABI.abi)
const ContractABIFormatted = ContractInterface.format(ethers.utils.FormatTypes.full)

const getMyCoinBalance = async () => {
    contractRead = new ethers.Contract(contractAddress,ContractABIFormatted,provider)
    const balance = await contractRead.getBalance(address)
    console.log(balance)

    const decimals = await contractRead.decimals()
    const formattedBalance = ethers.utils.formatUnits(balance,decimals)

    console.log(formattedBalance)

}

const trasnferMyCoin = async () => {
    contractWrite = new ethers.Contract(contractAddress,ContractABIFormatted,signer)
    const decimals = await contractWrite.decimals()
    const amount = ethers.utils.parseUnits("5.0",decimals)
    const tx = await contractWrite.doTransfer(
        "0x9248a1D30c120c1da0F7bf51B6AC401AF81a7f0E",
        amount
    )
    await tx.wait()
    console.log(tx)
    alert("Transaccion Realizada Correctamente")
}

const transferMyCoin = document.getElementById("transferMyCoin")
transferMyCoin.addEventListener("click", async () => {
    await trasnferMyCoin()
})

const metamaskButton = document.getElementById("metamaskButton")
metamaskButton.addEventListener("click", async () =>{
    console.log("Hola, soy el boton Connect Metamask y esta es tu address:")
    await connectMetamask()
    await getNativeBalance()
    await getNetwork()
    await getMyCoinBalance()
})