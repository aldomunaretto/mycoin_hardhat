const hre = require("hardhat");

let deployedContract
let contractAddress

async function deploy(){
    console.log("ERC721 deployment has just started...")
    const ERC721Contract = await ethers.getContractFactory("MyNFTCollection")
    deployedContract = await ERC721Contract.deploy("MyNFTCollection","MNFT")
    await deployedContract.waitForDeployment()
    contractAddress = deployedContract.target
    console.log("...ERC721 constract has been deployed to: " + contractAddress)
}

async function verify(){}

async function getContractAddress(){
    return contractAddress
}

module.exports = {deploy,verify,getContractAddress}