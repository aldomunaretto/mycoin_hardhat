const hre = require("hardhat");

// Variables globales para almacenar la instancia del contrato desplegado y la dirección del contrato.
let deployedContract
let contractAddress

// Despliegue del contrato MyNFTCollection y espera a que se complete el despliegue.
async function deploy(){
    console.log("MyNFTCollection deployment has just started...")
    // Obtenemos el contrato MyNFTCollection.
    const ERC721Contract = await ethers.getContractFactory("MyNFTCollection")
    // Desplegamos el contrato con el nombre "MyKeepCodingNFT" y el símbolo "KCNFT".
    deployedContract = await ERC721Contract.deploy("MyKeepCodingNFT","KCNFT")
    // Esperamos a que se complete el despliegue.
    await deployedContract.waitForDeployment()
    // Obtenemos la dirección del contrato desplegado.
    contractAddress = deployedContract.target
    console.log("...MyNFTCollection contract has been deployed to: " + contractAddress)
}

async function verify(){}

//Función para obtener la dirección del contrato desplegado.
async function getContractAddress(){
    return contractAddress
}

module.exports = {deploy,verify,getContractAddress}