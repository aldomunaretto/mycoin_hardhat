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

const enableAllButtons = async () => {
    const inputs = document.getElementsByTagName("input")
    for (let input of inputs) {
        input.disabled = false
    }
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
    // console.log(balance)

    const decimals = await contractReadMyCoin.decimals()
    const formattedBalance = ethers.utils.formatUnits(balance,decimals)

    // console.log(formattedBalance)

    document.getElementById("myWalletAddress").textContent = 'My wallet address is  '+ address;
    document.getElementById("myCoinBalance").textContent = 'MyCoin Balance is ' + formattedBalance;
    // return formattedBalance

}

const mintNewToken = async () => {
    contractWriteMyNFTCollection = new ethers.Contract(MyNFTCollectioncontractAddress,MyNFTCollectionContractABIFormatted,signer)
    const tx = await contractWriteMyNFTCollection.mintNewToken()
    await tx.wait()
    // console.log(tx)
    contractReadMyNFTCollection = new ethers.Contract(MyNFTCollectioncontractAddress,MyNFTCollectionContractABIFormatted,provider)
    const tokenCounter = await contractReadMyNFTCollection.tokenIdCounter()
    alert("You have successfully minted a new NFT Token with TokenId: " + tokenCounter)
}

const tokensOfOwner = async () => {
    let tokens = []
    contractReadMyNFTCollection = new ethers.Contract(MyNFTCollectioncontractAddress,MyNFTCollectionContractABIFormatted,provider)
    const tokenCounter = await contractReadMyNFTCollection.tokenIdCounter()
    const tokenIdCounter = ethers.utils.formatUnits(tokenCounter,0)
    // console.log(tokenIdCounter)
    for (let i = 1; i <= tokenIdCounter; i++) {
        const tokenOwner = await contractReadMyNFTCollection.ownerOfToken(i)
        if (tokenOwner == address) {
            tokens.push(i)
        }
    }
    // console.log(tokens)
    if (tokens.length > 0) {
        document.getElementById("myNFTBalance").textContent = 'You own the following tokens: ' + tokens.join(', ')
    } else {
        document.getElementById("myNFTBalance").textContent = "You don't own tokens."
    }
}

const listOpenSalesTokens = async () => {
    let openSalesTokens = []
    contractReadMyMarketPlace = new ethers.Contract(MyMarketPlacecontractAddress,MyMarketPlaceContractABIFormatted,provider)
    const sales = await contractReadMyMarketPlace.saleIdCounter()
    const saleCounter = ethers.utils.formatUnits(sales,0)
    // console.log(saleCounter)
    for (let i = 1; i <= saleCounter; i++) {
        const sales = await contractReadMyMarketPlace.getSale(i)
        if (sales[3] == 0) {
            openSalesTokens.push(sales[1])
        }
    }
    if (openSalesTokens.length > 0) {
        document.getElementById("openSales").textContent = 'The following TokenId are available for sale: ' + openSalesTokens.sort().join(', ')
    } else {
        document.getElementById("openSales").textContent = "There's no tokens available for sale"
    }
}

const createSale = async () => {
    const tokenIdInput = document.getElementById("tokenId").value
    const priceInput = document.getElementById("salesPrice").value
    if (!tokenIdInput) {
        alert("TokenId cannot be empty")
    } else if (!priceInput) {
        alert("Price cannot be empty")
    } else {
        contractWriteMyMarketPlace = new ethers.Contract(MyMarketPlacecontractAddress,MyMarketPlaceContractABIFormatted,signer)
        contractWriteMyNFTCollection = new ethers.Contract(MyNFTCollectioncontractAddress,MyNFTCollectionContractABIFormatted,signer)
        try {
            await contractWriteMyNFTCollection.approve(MyMarketPlacecontractAddress,tokenIdInput)
            const tx = await contractWriteMyMarketPlace.createSale(
                tokenIdInput,
                priceInput
            )
            const decimals = await contractReadMyCoin.decimals()
            const formattedpriceInput = ethers.utils.formatUnits(priceInput,decimals)
            await tx.wait()
            // console.log(tx)
            let saleId = await contractReadMyMarketPlace.saleIdCounter()
            alert("You have successfully created a Sale with SaleId: " + saleId + " and TokenId: " + tokenIdInput + " and Price: " + formattedpriceInput + " MyCoin")
        } catch (error) {
            console.error('Error capturado:', error);
            document.getElementById('create-error-message').textContent = error.data.message
          }
    }
}

const buySale = async () => {
    const saleIdInput = document.getElementById("saleIdToBuy").value;
    if (!saleIdInput) {
        alert("SaleId cannot be empty")
    } else {
        const sale = await contractReadMyMarketPlace.getSale(saleIdInput)
        contractWriteMyMarketPlace = new ethers.Contract(MyMarketPlacecontractAddress,MyMarketPlaceContractABIFormatted,signer)
        contractWriteMyCoin = new ethers.Contract(MyCoincontractAddress,MyCoinContractABIFormatted,signer)
        await contractWriteMyCoin.approve(MyMarketPlacecontractAddress,sale[2])
        const tx = await contractWriteMyMarketPlace.buySale(saleIdInput)
        await tx.wait()
        console.log(tx)
        alert("You have successfully purchased a token from the sale with saleId: " + saleIdInput + "and with the tokenId: " + sale[1])
    }
}

const cancelSale = async () => {
    const saleIdInput = document.getElementById("saleIdToCancel").value
    if (!saleIdInput) {
        alert("SaleId cannot be empty")
    } else {
        contractWriteMyMarketPlace = new ethers.Contract(MyMarketPlacecontractAddress,MyMarketPlaceContractABIFormatted,signer)
        const tx = await contractWriteMyMarketPlace.canceSale(saleIdInput)
        await tx.wait()
        console.log(tx)
        alert("You have successfully canceled the sale with SaleId: " + saleIdInput)
    }
}

const getSale = async () => {
    let statusMessage
    await resetGetSaleMessages()
    const saleIdInput = document.getElementById("saleId").value;
    contractReadMyMarketPlace = new ethers.Contract(MyMarketPlacecontractAddress,MyMarketPlaceContractABIFormatted,provider)

    try {
        const sale = await contractReadMyMarketPlace.getSale(saleIdInput)
        console.log(sale)
        let decimals = await contractReadMyCoin.decimals()
        let formattedprice = ethers.utils.formatUnits(sale[2],decimals)
        document.getElementById("saleOwner").textContent = "Sale's Owner : " + sale[0]
        document.getElementById("saleTokenId").textContent = "Token's Id : " + sale[1]
        document.getElementById("salePrice").textContent = "Price : " + formattedprice + " MyCoin"
        if (sale[3] == 0) {
            statusMessage = "Open"
        } else if (sale[3] == 1) {
            statusMessage = "Executed"
        } else if (sale[3] == 2) {
            statusMessage = "Cancelled"
        }
        document.getElementById("saleStatus").textContent = "Status : " + statusMessage
    } catch (error) {
        console.error('Error capturado:', error);
        if (error.data.code == -32603) {
            document.getElementById('get-error-message').textContent = "SaleId does not exist"
        } else {
        document.getElementById('get-error-message').textContent = error.data.message
      }
    }
}

const resetGetSaleMessages = async () => {
    // document.getElementById("saleId").value = ""
    document.getElementById("saleOwner").textContent = ""
    document.getElementById("saleTokenId").textContent = ""
    document.getElementById("salePrice").textContent = ""
    document.getElementById("saleStatus").textContent = ""
    document.getElementById('get-error-message').textContent = ""
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
    await enableAllButtons()
    await listOpenSalesTokens()
    await resetGetSaleMessages()
})

const mintNewTokenButton = document.getElementById("mintNewTokenBtn")
mintNewTokenButton.addEventListener("click", async () =>{
    console.log("mintNewTokenButton")
    await mintNewToken()
    await tokensOfOwner()
    await resetGetSaleMessages()
})

const createSaleButton = document.getElementById("createSaleBtn")
createSaleButton.addEventListener("click", async () =>{
    console.log("createSaleButton")
    await createSale()
    await tokensOfOwner()
    await listOpenSalesTokens()
    await resetGetSaleMessages()
})

const buySaleButton = document.getElementById("buySaleBtn")
buySaleButton.addEventListener("click", async () =>{
    console.log("buySaleButton")
    await buySale()
    await tokensOfOwner()
    await listOpenSalesTokens()
    await resetGetSaleMessages()
})

const cancelSaleButton = document.getElementById("cancelSaleBtn")
cancelSaleButton.addEventListener("click", async () =>{
    console.log("cancelSaleButton")
    await cancelSale()
    await tokensOfOwner()
    await listOpenSalesTokens()
    await resetGetSaleMessages()
})

const getSaleButton = document.getElementById("getSaleBtn")
getSaleButton.addEventListener("click", async () =>{
    console.log("getSaleButton")
    await getSale()
})