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

let contractAddress = "0x71Ae3E05d9895a95Fb7ca19Ff0B6Bf8576890314"

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

    document.getElementById("myWalletAddress").textContent = 'My wallet address is  '+ address;
    document.getElementById("myCoinBalance").textContent = 'MyCoin Balance is ' + formattedBalance;
    return formattedBalance

}

const trasnferMyCoin = async () => {
    const walletInput = document.getElementById("toWalletAddress").value;
    const amountInput = document.getElementById("transferAmount").value;
    contractWrite = new ethers.Contract(contractAddress,ContractABIFormatted,signer)
    const decimals = await contractWrite.decimals()
    const amount = ethers.utils.parseUnits(amountInput,decimals)
    const tx = await contractWrite.doTransfer(
        walletInput,
        amount
    )
    await tx.wait()
    console.log(tx)
    contractRead = new ethers.Contract(contractAddress,ContractABIFormatted,provider)
    let receiverBalance = await contractRead.getBalance(walletInput)
    let formattedBalance = ethers.utils.formatUnits(receiverBalance,decimals)
    console.log(formattedBalance)
    alert("Transaccion Realizada Correctamente")
}

const transferMyCoin = document.getElementById("transferMyCoin")
transferMyCoin.addEventListener("click", async () => {
    await trasnferMyCoin()
    document.getElementById("toWalletAddress").value = "";
    document.getElementById("transferAmount").value = "";
    await getMyCoinBalance()
    
})

const metamaskButton = document.getElementById("metamaskButton")
metamaskButton.addEventListener("click", async () =>{
    console.log("Hola, soy el boton Connect Metamask y esta es tu address:")
    await connectMetamask()
    await getNativeBalance()
    await getNetwork()
    await getMyCoinBalance()
})