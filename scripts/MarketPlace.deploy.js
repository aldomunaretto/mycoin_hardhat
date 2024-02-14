const hre = require("hardhat");

let deployedContract
let contractAddress

async function deploy(CoinContractAddress,NFTContractAddress){
    console.log("MarketPlace deployment has just started...")
    const MarketPlaceContract = await ethers.getContractFactory("MyMarketPlace")
    deployedContract = await MarketPlaceContract.deploy(CoinContractAddress,NFTContractAddress)
    await deployedContract.waitForDeployment()
    contractAddress = deployedContract.target
    console.log("...MarketPlace contract has been deployed to: " + contractAddress)
}

async function verify(){}

async function getContractAddress(){
    return contractAddress
}

module.exports = {deploy,verify,getContractAddress}