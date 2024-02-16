const hre = require("hardhat");

// Variables globales para almacenar la instancia del contrato desplegado y la dirección del contrato.
let deployedERC20Contract
let contractAddress

// Despliegue del contrato MyCoin y espera a que se complete el despliegue.
async function deploy(){
    console.log("ERC20 deployment has just started...")
    // Obtenemos el contrato MyCoin.
    const ERC20Contract = await ethers.getContractFactory("MyCoin")
    // Desplegamos el contrato con 5000 MyCoins y 2 decimales.
    deployedERC20Contract = await ERC20Contract.deploy(5000,2)
    // Esperamos a que se complete el despliegue.
    await deployedERC20Contract.waitForDeployment()
    // Obtenemos la dirección del contrato desplegado.
    contractAddress = deployedERC20Contract.target
    console.log("...ERC20 constract has been deployed to: " + contractAddress)
}

async function verify(){}

//Función para obtener la dirección del contrato desplegado.
async function getContractAddress(){
    return contractAddress
}

module.exports = {deploy,verify,getContractAddress}