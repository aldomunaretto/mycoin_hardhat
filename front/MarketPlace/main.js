/**
 * -----------------------------------------------------------------------------------------------------
 *                                      IMPORTACIONES
 * -----------------------------------------------------------------------------------------------------
 */

// Importación de la ABI para un contrato ERC20 personalizado MyCoin.
import MyCoinContractABI from "../../artifacts/contracts/ERC20/MyCoin.sol/MyCoin.json" assert {type: "json"}
// Importación de la ABI para un contrato ERC721 personalizado NFTCollection.
import MyNFTCollectionContractABI from "../../artifacts/contracts/ERC721/MyNFTCollection.sol/MyNFTCollection.json" assert {type: "json"}
// Importación de la ABI para un contrato MyMarketPlace.
import MyMarketPlaceContractABI from "../../artifacts/contracts/MarketPlace/MyMarketPlace.sol/MyMarketPlace.json" assert {type: "json"}

/**
 * -----------------------------------------------------------------------------------------------------
 *                                      VARIABLES
 * -----------------------------------------------------------------------------------------------------
 */

// Declaración de variables para la dirección del contrato, el proveedor y la cuenta que despliega los contratos.
let address, provider, signer 
// Declaración de variables para los contratos de lectura y escritura de MyCoin, MyNFTCollection y MyMarketPlace.
let contractReadMyCoin, contractWriteMyCoin
let contractReadMyNFTCollection, contractWriteMyNFTCollection
let contractReadMyMarketPlace, contractWriteMyMarketPlace

// Declaración de variables para las direcciones de los contratos de MyCoin, MyNFTCollection y MyMarketPlace.
let MyCoincontractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
let MyNFTCollectioncontractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
let MyMarketPlacecontractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"

/**
 * -----------------------------------------------------------------------------------------------------
 *                                      INTERFACES ABI
 * -----------------------------------------------------------------------------------------------------
 */

// Creación de una interfaz ABI para el contrato MyCoin.
const MyCoinContractInterface = new ethers.utils.Interface(MyCoinContractABI.abi)
const MyCoinContractABIFormatted = MyCoinContractInterface.format(ethers.utils.FormatTypes.full)
console.log(MyCoinContractABIFormatted)

// Creación de una interfaz ABI para el contrato MyNFTCollection.
const MyNFTCollectionContractInterface = new ethers.utils.Interface(MyNFTCollectionContractABI.abi)
const MyNFTCollectionContractABIFormatted = MyNFTCollectionContractInterface.format(ethers.utils.FormatTypes.full)
console.log(MyNFTCollectionContractABIFormatted)

// Creación de una interfaz ABI para el contrato MyMarketPlace.
const MyMarketPlaceContractInterface = new ethers.utils.Interface(MyMarketPlaceContractABI.abi)
const MyMarketPlaceContractABIFormatted = MyMarketPlaceContractInterface.format(ethers.utils.FormatTypes.full)
console.log(MyMarketPlaceContractABIFormatted)

/**
 * -----------------------------------------------------------------------------------------------------
 *                                      FUNCIONES
 * -----------------------------------------------------------------------------------------------------
 */

// Función para conectar Metamask y obtener la dirección del usuario.
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
    // console.log(address)
}

// Función para habilitar todos los botones excepto el connectMetamaskBtn el cual debe ser clickado siempre primero.
const enableAllButtons = async () => {
    // Obtengo todos los elementos de tipo button y ya cambio el valor de disabeld a false.
    const inputs = document.getElementsByTagName("input")
    for (let input of inputs) {
        input.disabled = false
    }
}    

// Función para obtener el balance en moneda nativa de la cuenta del usuario.
const getNativeBalance = async () => {
    console.log("")
    console.log("getNativeBalance")
    console.log("")
    // Obtengo el balance de la cuenta del usuario.
    const balance = await provider.getBalance(address)
    // Convierto el balance a Ether.
    const formattedBalance = ethers.utils.formatEther(balance)
    // console.log(balance)
    // Muestro el balance con el formato adecuado en la consola.
    console.log(formattedBalance)
}

// Función para obtener la red a la que está conectado el usuario.
const getNetwork = async () => {
    console.log("")
    console.log("getNetwork")
    console.log("")
    // Obtengo la red a la que está conectado el usuario.
    const network = await provider.getNetwork();
    // Muestro la red a la que está conectado el usuario en la consola.
    console.log(network)
}

// Función para obtener el balance de MyCoin del usuario.
const getMyCoinBalance = async () => {
    // Genero el contrato de lectura de MyCoin.
    contractReadMyCoin = new ethers.Contract(MyCoincontractAddress,MyCoinContractABIFormatted,provider)
    // Obtengo el balance de MyCoin del usuario utilizando la función getBalance del contrato MyCoin.
    const balance = await contractReadMyCoin.getBalance(address)
    // console.log(balance)
    // Obtengo el número de decimales de MyCoin.
    const decimals = await contractReadMyCoin.decimals()
    // Convierto el balance a un formato adecuado tomando en cuenta los decimales.
    const formattedBalance = ethers.utils.formatUnits(balance,decimals)
    // console.log(formattedBalance)
    // Muestro la dirección del usuario y su balance de MyCoin.
    document.getElementById("myWalletAddress").textContent = 'My wallet address is  '+ address;
    document.getElementById("myCoinBalance").textContent = 'MyCoin Balance is ' + formattedBalance;
}

// Función para mintear un nuevo token NFT.
const mintNewToken = async () => {
    // Genero el contrato de escritura de MyNFTCollection.
    contractWriteMyNFTCollection = new ethers.Contract(MyNFTCollectioncontractAddress,MyNFTCollectionContractABIFormatted,signer)
    // Utilizo la función mintNewToken del contrato MyNFTCollection para mintear un nuevo token NFT.
    const tx = await contractWriteMyNFTCollection.mintNewToken()
    await tx.wait()
    // Genero el contrato de lectura de MyNFTCollection.
    contractReadMyNFTCollection = new ethers.Contract(MyNFTCollectioncontractAddress,MyNFTCollectionContractABIFormatted,provider)
    // Obtengo el valor actual de tokenIdCounter.
    const tokenCounter = await contractReadMyNFTCollection.tokenIdCounter()
    // Emito una alerta con el valor de tokenIdCounter como TokenId
    alert("You have successfully minted a new NFT Token with TokenId: " + tokenCounter)
}

// Función para obtener los tokens NFT que posee el usuario.
const tokensOfOwner = async () => {
    // defino un array vacio para guardar los tokens que posee el usuario.
    let tokens = []
    // Genero el contrato de lectura de MyNFTCollection.
    contractReadMyNFTCollection = new ethers.Contract(MyNFTCollectioncontractAddress,MyNFTCollectionContractABIFormatted,provider)
    // Obtengo el valor actual de tokenIdCounter.
    const tokenCounter = await contractReadMyNFTCollection.tokenIdCounter()
    // Convierto el valor de tokenIdCounter a un formato adecuado.
    const tokenIdCounter = ethers.utils.formatUnits(tokenCounter,0)
    // Recorro todos los tokens desde el 1 hasta tokenIdCounter para guardar los tokens que posee el usuario.
    for (let i = 1; i <= tokenIdCounter; i++) {
        const tokenOwner = await contractReadMyNFTCollection.ownerOfToken(i)
        if (tokenOwner == address) {
            tokens.push(i)
        }
    }
    //Checheo si el array tokens tiene algun elemento, si es asi muestro los tokens que posee el usuario, sino muestro un mensaje de que no tiene tokens.
    if (tokens.length > 0) {
        document.getElementById("myNFTBalance").textContent = 'You own the following tokens: ' + tokens.join(', ')
    } else {
        document.getElementById("myNFTBalance").textContent = "You don't own tokens."
    }
}

// Función para listar los tokens que están en porpiedad del contrato MyMarketPlace y disponibles para la venta (ya tiene una venta creada).
const listOpenSalesTokens = async () => {
    // defino un array vacio para guardar los tokens que están disponibles para la venta.
    let openSalesTokens = []
    // Genero el contrato de lectura de MyMarketPlace.
    contractReadMyMarketPlace = new ethers.Contract(MyMarketPlacecontractAddress,MyMarketPlaceContractABIFormatted,provider)
    // Obtengo el valor actual de saleIdCounter.
    const sales = await contractReadMyMarketPlace.saleIdCounter()
    // Convierto el valor de saleIdCounter a un formato adecuado.
    const saleCounter = ethers.utils.formatUnits(sales,0)
    // Recorro todos los saleId desde el 1 hasta saleIdCounter para guardar los tokens que están disponibles para la venta (Status == Open).
    for (let i = 1; i <= saleCounter; i++) {
        // Obteng la información de las ventas.
        const sales = await contractReadMyMarketPlace.getSale(i)
        // Si el status de la venta es 0 (Open) guardo el tokenId en el array openSalesTokens.
        if (sales[3] == 0) {
            openSalesTokens.push(sales[1])
        }
    }
    // Checheo si el array openSalesTokens tiene algun elemento, si es asi muestro los tokens que están disponibles para la venta, sino muestro un mensaje de que no hay tokens disponibles para la venta.
    if (openSalesTokens.length > 0) {
        document.getElementById("openSales").textContent = 'The following TokenId are available for sale: ' + openSalesTokens.sort().join(', ')
    } else {
        document.getElementById("openSales").textContent = "There's no tokens available for sale"
    }
}

// Función para crear una venta de un token NFT.
const createSale = async () => {
    // Obtengo el tokenId y el precio de la venta desde el frontend.
    const tokenIdInput = document.getElementById("tokenId").value
    const priceInput = document.getElementById("salesPrice").value
    // Checheo si el tokenId y el precio no están vacios, si es asi muestro un mensaje de que no pueden estar vacios.
    if (!tokenIdInput) {
        alert("TokenId cannot be empty")
    } else if (!priceInput) {
        alert("Price cannot be empty")
    } else {
        // Genero el contrato de escritura de MyMarketPlace.
        contractWriteMyMarketPlace = new ethers.Contract(MyMarketPlacecontractAddress,MyMarketPlaceContractABIFormatted,signer)
        // Genero el contrato de escritura de MyNFTCollection.
        contractWriteMyNFTCollection = new ethers.Contract(MyNFTCollectioncontractAddress,MyNFTCollectionContractABIFormatted,signer)
        try {
            // Aprobar al contrato MyMarketPlace para que pueda transferir el token NFT.
            await contractWriteMyNFTCollection.approve(MyMarketPlacecontractAddress,tokenIdInput)
            // Crear la venta utilizando la función createSale del contrato MyMarketPlace.
            const tx = await contractWriteMyMarketPlace.createSale(
                tokenIdInput,
                priceInput
            )
            // Obtengo el número de decimales de MyCoin
            const decimals = await contractReadMyCoin.decimals()
            // Convierto el precio al formato adecuado tomando en cuenta los decimales.
            const formattedpriceInput = ethers.utils.formatUnits(priceInput,decimals)
            await tx.wait()
            // Emito una alerta con el saleId de la venta creada.
            let saleId = await contractReadMyMarketPlace.saleIdCounter()
            alert("You have successfully created a Sale with SaleId: " + saleId + " and TokenId: " + tokenIdInput + " and Price: " + formattedpriceInput + " MyCoin")
        } catch (error) {
            // Si hay un error, muestro el mensaje de error en el frontend.
            console.error('Error capturado:', error);
            document.getElementById('create-error-message').textContent = error.data.message
          }
    }
}

// Función para comprar un token NFT que está en venta.
const buySale = async () => {
    // Obtengo el saleId desde el frontend.
    const saleIdInput = document.getElementById("saleIdToBuy").value;
    // Checheo si el saleId no está vacio, si es asi muestro un mensaje de que no puede estar vacio.
    if (!saleIdInput) {
        alert("SaleId cannot be empty")
    } else {
        // Obten la información de la venta utilizando la función getSale del contrato MyMarketPlace.
        const sale = await contractReadMyMarketPlace.getSale(saleIdInput)
        // Genero el contrato de escritura de MyMarketPlace.
        contractWriteMyMarketPlace = new ethers.Contract(MyMarketPlacecontractAddress,MyMarketPlaceContractABIFormatted,signer)
        // Genero el contrato de escritura de MyCoin.
        contractWriteMyCoin = new ethers.Contract(MyCoincontractAddress,MyCoinContractABIFormatted,signer)
        // Aprobar al contrato MyMarketPlace para que pueda transferir los MyCoin del comprador.
        await contractWriteMyCoin.approve(MyMarketPlacecontractAddress,sale[2])
        // Comprar el token utilizando la función buySale del contrato MyMarketPlace.
        const tx = await contractWriteMyMarketPlace.buySale(saleIdInput)
        await tx.wait()
        // Emito una alerta con el saleId y el tokenId de la venta comprada.
        alert("You have successfully purchased a token from the sale with saleId: " + saleIdInput + "and with the tokenId: " + sale[1])
    }
}

// Función para cancelar una venta de un token NFT.
const cancelSale = async () => {
    // Obtengo el saleId desde el frontend.
    const saleIdInput = document.getElementById("saleIdToCancel").value
    // Checheo si el saleId no está vacio, si es asi muestro un mensaje de que no puede estar vacio.
    if (!saleIdInput) {
        alert("SaleId cannot be empty")
    } else {
        // Genero el contrato de escritura de MyMarketPlace.
        contractWriteMyMarketPlace = new ethers.Contract(MyMarketPlacecontractAddress,MyMarketPlaceContractABIFormatted,signer)
        // Cancelar la venta utilizando la función cancelSale del contrato MyMarketPlace.
        const tx = await contractWriteMyMarketPlace.canceSale(saleIdInput)
        await tx.wait()
        // Emito una alerta con el saleId de la venta cancelada.
        alert("You have successfully canceled the sale with SaleId: " + saleIdInput)
    }
}

// Función para obtener la información de una venta de un token NFT.
const getSale = async () => {
    // defino una variable para guardar el status de la venta.
    let statusMessage
    // Llamo a la función resetGetSaleMessages para limpiar los mensajes de error y la información de la venta.
    await resetGetSaleMessages()
    // Obtengo el saleId desde el frontend.
    const saleIdInput = document.getElementById("saleId").value;
    // Genero el contrato de lectura de MyMarketPlace.
    contractReadMyMarketPlace = new ethers.Contract(MyMarketPlacecontractAddress,MyMarketPlaceContractABIFormatted,provider)
    try {
        // Obtengo la información de la venta utilizando la función getSale del contrato MyMarketPlace.
        const sale = await contractReadMyMarketPlace.getSale(saleIdInput)
        // Obtengo el número de decimales de MyCoin.
        let decimals = await contractReadMyCoin.decimals()
        // Convierto el precio al formato adecuado tomando en cuenta los decimales.
        let formattedprice = ethers.utils.formatUnits(sale[2],decimals)
        // Muestro la información de la venta en el frontend.
        document.getElementById("saleOwner").textContent = "Sale's Owner : " + sale[0]
        document.getElementById("saleTokenId").textContent = "Token's Id : " + sale[1]
        document.getElementById("salePrice").textContent = "Price : " + formattedprice + " MyCoin"
        // Checheo si el status de la venta es 0 (Open), 1 (Executed) o 2 (Cancelled) y muestro el mensaje adecuado.
        if (sale[3] == 0) {
            statusMessage = "Open"
        } else if (sale[3] == 1) {
            statusMessage = "Executed"
        } else if (sale[3] == 2) {
            statusMessage = "Cancelled"
        }
        // Muestro el status de la venta en el frontend.
        document.getElementById("saleStatus").textContent = "Status : " + statusMessage
    } catch (error) {
        // Si hay un error, muestro el mensaje de error en el frontend.
        console.error('Error capturado:', error);
        // Capturo el error -32603 que se produce cuando el saleId no existe y muestro un mensaje adecuado.
        if (error.data.code == -32603) {
            document.getElementById('get-error-message').textContent = "SaleId does not exist"
        } else {
        document.getElementById('get-error-message').textContent = error.data.message
      }
    }
}

// Función para limpiar los mensajes de error y la información de la venta.
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

// EventListener para el botón connectMetamaskBtn.
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

// EventListener para el botón mintNewTokenBtn.
const mintNewTokenButton = document.getElementById("mintNewTokenBtn")
mintNewTokenButton.addEventListener("click", async () =>{
    console.log("mintNewTokenButton")
    await mintNewToken()
    await tokensOfOwner()
    await resetGetSaleMessages()
})

// EventListener para el botón createSaleBtn.
const createSaleButton = document.getElementById("createSaleBtn")
createSaleButton.addEventListener("click", async () =>{
    console.log("createSaleButton")
    await createSale()
    await tokensOfOwner()
    await listOpenSalesTokens()
    await resetGetSaleMessages()
})

// EventListener para el botón buySaleBtn.
const buySaleButton = document.getElementById("buySaleBtn")
buySaleButton.addEventListener("click", async () =>{
    console.log("buySaleButton")
    await buySale()
    await tokensOfOwner()
    await listOpenSalesTokens()
    await resetGetSaleMessages()
})

// EventListener para el botón cancelSaleBtn.
const cancelSaleButton = document.getElementById("cancelSaleBtn")
cancelSaleButton.addEventListener("click", async () =>{
    console.log("cancelSaleButton")
    await cancelSale()
    await tokensOfOwner()
    await listOpenSalesTokens()
    await resetGetSaleMessages()
})

// EventListener para el botón getSaleBtn.
const getSaleButton = document.getElementById("getSaleBtn")
getSaleButton.addEventListener("click", async () =>{
    console.log("getSaleButton")
    await getSale()
})