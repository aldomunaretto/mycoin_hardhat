/**
 * -----------------------------------------------------------------------------------------------------
 *                                      IMPORTACIONES
 * -----------------------------------------------------------------------------------------------------
 */

import MyCoinContractABI from "../../artifacts/contracts/ERC20/MyCoin.sol/MyCoin.json" assert {type: "json"}
import MyNFTCollectionContractABI from "../../artifacts/contracts/ERC721/MyNFTCollection.sol/MyNFTCollection.json" assert {type: "json"}
import MyMarketPlaceContractABI from "../../artifacts/contracts/MarketPlace/MyMarketPlace.sol/MyMarketPlace.json" assert {type: "json"}

/**
 * -----------------------------------------------------------------------------------------------------
 *                                      VARIABLES
 * -----------------------------------------------------------------------------------------------------
 */

let address, provider, signer 
let contractReadMyCoin, contractWriteMyCoin
let contractReadMyNFTCollection, contractWriteMyNFTCollection
let contractReadMyMarketPlace, contractWriteMyMarketPlace

let MyCoincontractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
let MyNFTCollectioncontractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
let MyMarketPlacecontractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"

/**
 * -----------------------------------------------------------------------------------------------------
 *                                      INTERFACES ABI
 * -----------------------------------------------------------------------------------------------------
 */

const MyCoinContractInterface = new ethers.utils.Interface(MyCoinContractABI.abi)
const MyCoinContractABIFormatted = MyCoinContractInterface.format(ethers.utils.FormatTypes.full)
console.log(MyCoinContractABIFormatted)

const MyNFTCollectionContractInterface = new ethers.utils.Interface(MyNFTCollectionContractABI.abi)
const MyNFTCollectionContractABIFormatted = MyNFTCollectionContractInterface.format(ethers.utils.FormatTypes.full)
console.log(MyNFTCollectionContractABIFormatted)

const MyMarketPlaceContractInterface = new ethers.utils.Interface(MyMarketPlaceContractABI.abi)
const MyMarketPlaceContractABIFormatted = MyMarketPlaceContractInterface.format(ethers.utils.FormatTypes.full)
console.log(MyMarketPlaceContractABIFormatted)

/**
 * -----------------------------------------------------------------------------------------------------
 *                                      FUNCIONES
 * -----------------------------------------------------------------------------------------------------
 */

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

const getMyCoinBalance = async () => {
    contractReadMyCoin = new ethers.Contract(MyCoincontractAddress,MyCoinContractABIFormatted,provider)
    const balance = await contractReadMyCoin.getBalance(address)
    console.log(balance)

    const decimals = await contractReadMyCoin.decimals()
    const formattedBalance = ethers.utils.formatUnits(balance,decimals)

    console.log(formattedBalance)

    document.getElementById("myWalletAddress").textContent = 'My wallet address is  '+ address;
    document.getElementById("myCoinBalance").textContent = 'MyCoin Balance is ' + formattedBalance;
    return formattedBalance

}

const mintNewToken = async () => {
    contractWriteMyNFTCollection = new ethers.Contract(MyNFTCollectioncontractAddress,MyNFTCollectionContractABIFormatted,signer)
    const tx = await contractWriteMyNFTCollection.mintNewToken()
    await tx.wait()
    console.log(tx)
    // tokenId = tx.events[0].args[2]
    // await contractWriteMyNFTCollection.approve(MyMarketPlacecontractAddress,tokenId)
    // const approved = await contractWriteMyNFTCollection.getApproved(tokenId)
    // console.log(approved)
    alert("Ha creado un Token exitosamente")
}

const tokensOfOwner = async () => {
    contractReadMyNFTCollection = new ethers.Contract(MyNFTCollectioncontractAddress,MyNFTCollectionContractABIFormatted,provider)
    const tokens = await contractReadMyNFTCollection.balanceOf(address)
    console.log(tokens)
    document.getElementById("myNFTBalance").textContent = 'You own : ' + tokens + ' token.';
    return tokens
}

const createSale = async () => {
    const tokenIdInput = document.getElementById("tokenId").value;
    const priceInput = document.getElementById("salesPrice").value;
    contractWriteMyMarketPlace = new ethers.Contract(MyMarketPlacecontractAddress,MyMarketPlaceContractABIFormatted,signer)
    contractWriteMyNFTCollection = new ethers.Contract(MyNFTCollectioncontractAddress,MyNFTCollectionContractABIFormatted,signer)
    // const decimals = await contractWriteMyMarketPlace.decimals()
    // const price = ethers.utils.parseUnits(priceInput,decimals)
    const approved = await contractWriteMyNFTCollection.approve(MyMarketPlacecontractAddress,tokenIdInput)
    const tx = await contractWriteMyMarketPlace.createSale(
        tokenIdInput,
        priceInput
    )
    await tx.wait()
    console.log(tx)
    alert("Ha creado una venta (Sale) exitosamente")
}

const buySale = async () => {
    const saleIdInput = document.getElementById("saleId").value;
    const sale = await contractReadMyMarketPlace.getSale(saleIdInput)
    contractWriteMyMarketPlace = new ethers.Contract(MyMarketPlacecontractAddress,MyMarketPlaceContractABIFormatted,signer)
    contractWriteMyCoin = new ethers.Contract(MyCoincontractAddress,MyCoinContractABIFormatted,signer)
    const approved = await contractWriteMyCoin.approve(MyMarketPlacecontractAddress,sale[2])
    const tx = await contractWriteMyMarketPlace.buySale(saleIdInput)
    await tx.wait()
    console.log(tx)
    alert("Ha comprado un token exitosamente")
}

const cancelSale = async () => {
    const saleIdInput = document.getElementById("saleId").value;
    contractWriteMyMarketPlace = new ethers.Contract(MyMarketPlacecontractAddress,MyMarketPlaceContractABIFormatted,signer)
    const tx = await contractWriteMyMarketPlace.canceSale(saleIdInput)
    await tx.wait()
    console.log(tx)
    alert("Ha cancelado la venta exitosamente")
}

const getSale = async () => {
    let statusMessage
    await resetGetSaleMessages()
    const saleIdInput = document.getElementById("saleId").value;
    contractReadMyMarketPlace = new ethers.Contract(MyMarketPlacecontractAddress,MyMarketPlaceContractABIFormatted,provider)
    try {
        const sale = await contractReadMyMarketPlace.getSale(saleIdInput)
        console.log(sale)
        document.getElementById("saleOwner").textContent = "Sale's Owner : " + sale[0]
        document.getElementById("saleTokenId").textContent = "Token's Id : " + sale[1]
        document.getElementById("salePrice").textContent = "Price : " + sale[2]
        if (sale[3] == 0) {
            statusMessage = "Open"
        } else if (sale[3] == 1) {
            statusMessage = "Executed"
        } else if (sale[3] == 2) {
            statusMessage = "Cancelled"
        }
        document.getElementById("saleStatus").textContent = "Status : " + statusMessage
        return sale
    } catch (error) {
        console.error('Error capturado:', error);
        document.getElementById('error-message').textContent = error.data.message
      }
    }

const resetGetSaleMessages = async () => {
    // document.getElementById("saleId").value = ""
    document.getElementById("saleOwner").textContent = ""
    document.getElementById("saleTokenId").textContent = ""
    document.getElementById("salePrice").textContent = ""
    document.getElementById("saleStatus").textContent = ""
    document.getElementById('error-message').textContent = ""
}

/**
 * -----------------------------------------------------------------------------------------------------
 *                                      BOTONES
 * -----------------------------------------------------------------------------------------------------
 */

const metamaskButton = document.getElementById("connectMetamaskBtn")
metamaskButton.addEventListener("click", async () =>{
    console.log("Esta es tu address:")
    await connectMetamask()
    await getNativeBalance()
    await getNetwork()
    await getMyCoinBalance()
    await tokensOfOwner()
    await resetGetSaleMessages()
})

const mintNewTokenButton = document.getElementById("mintNewTokenBtn")
mintNewTokenButton.addEventListener("click", async () =>{
    console.log("mintNewTokenButton")
    await mintNewToken()
})

const createSaleButton = document.getElementById("createSaleBtn")
createSaleButton.addEventListener("click", async () =>{
    console.log("createSaleButton")
    await createSale()
})

const buySaleButton = document.getElementById("buySaleBtn")
buySaleButton.addEventListener("click", async () =>{
    console.log("buySaleButton")
    await buySale()
})

const cancelSaleButton = document.getElementById("cancelSaleBtn")
cancelSaleButton.addEventListener("click", async () =>{
    console.log("cancelSaleButton")
    await cancelSale()
})

const getSaleButton = document.getElementById("getSaleBtn")
getSaleButton.addEventListener("click", async () =>{
    console.log("getSaleButton")
    await getSale()
})