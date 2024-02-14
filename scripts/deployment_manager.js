
const ERC20DeployScript = require("./ERC20.deploy")
const ERC721DeployScript = require("./ERC721.deploy")
const MarketPlaceDeployScript = require("./MarketPlace.deploy")

const main = async () => {
    await ERC20DeployScript.deploy()
    let MyCoinContractAddress = await ERC20DeployScript.getContractAddress()
    await ERC721DeployScript.deploy()
    let MyNFTCollectionContractAddress = await ERC721DeployScript.getContractAddress()
    await MarketPlaceDeployScript.deploy(MyCoinContractAddress, MyNFTCollectionContractAddress)
}

main()
