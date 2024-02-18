// Para desplegar: npx hardhat run scripts/deployment_manager.js --network localhost

// Obtiene los scripts de despliegue de los contratos MyCoin, MyNFTCollection y MyMarketPlace.
const ERC20DeployScript = require("./ERC20.deploy")
const ERC721DeployScript = require("./ERC721.deploy")
const MarketPlaceDeployScript = require("./MarketPlace.deploy")

// Función principal que despliega los contratos y obtiene las direcciones de los contratos desplegados.
const main = async () => {
    // Despliega el contrato MyCoin.
    await ERC20DeployScript.deploy()
    // Obtiene la dirección del contrato MyCoin.
    let MyCoinContractAddress = await ERC20DeployScript.getContractAddress()
    // Despliega el contrato MyNFTCollection.
    await ERC721DeployScript.deploy()
    // Obtiene la dirección del contrato MyNFTCollection.
    let MyNFTCollectionContractAddress = await ERC721DeployScript.getContractAddress()
    // Despliega el contrato MyMarketPlace utilizando las direcciones de los contratos de MyCoin y MyNFTCollection.
    await MarketPlaceDeployScript.deploy(MyCoinContractAddress, MyNFTCollectionContractAddress)
}

main()
