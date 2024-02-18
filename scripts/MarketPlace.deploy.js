const hre = require("hardhat");

// Variables globales para almacenar la instancia del contrato desplegado y la dirección del contrato.
let deployedContract
let contractAddress

// Despliegue del contrato MyMarketPlace y espera a que se complete el despliegue.
// Requiere como parámetros las direcciones de los contratos MyCoin y MyNFTCollection.
async function deploy(CoinContractAddress,NFTContractAddress){
    console.log("MyMarketPlace deployment has just started...")
    // Obtenemos el contrato MyMarketPlace.
    const MarketPlaceContract = await ethers.getContractFactory("MyMarketPlace")
    // Desplegamos el contrato utilizando como parámetros las direcciones de los contratos MyCoin y MyNFTCollection.
    deployedContract = await MarketPlaceContract.deploy(CoinContractAddress,NFTContractAddress)
    // Esperamos a que se complete el despliegue.
    await deployedContract.waitForDeployment()
    // Obtenemos la dirección del contrato desplegado.
    contractAddress = deployedContract.target
    console.log("...MyMarketPlace contract has been deployed to: " + contractAddress)
}

async function verify(){}

//Función para obtener la dirección del contrato desplegado.
async function getContractAddress(){
    return contractAddress
}

module.exports = {deploy,verify,getContractAddress}