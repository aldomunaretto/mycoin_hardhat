// IMPORTANE
// Para la resolucion de la practica es necesario utilizar la funcion transferFrom tanto del ERC20 como del ERC721.
// Porque quien va a realizar las llamas de transferencia (transferFrom) va a ser el contrato del MarketPlace
// Por este motivo cuando desarrolleis los test primero teneis que hacer una llamada al metodo approve para autorizar el contrato de MarketPlace a transferir los tokens ERC20 y ERC721.

const { expect } = require("chai");

describe("MyMarketPlace Test Suite", function () {

    let deployedMyCoinContract, deployedMyNFTCollectionContract, deployedMyMarketPlaceContract;
    let signer, account1, account2;

    it("Deploy MyCoin Contract", async function(){
        const MyCoinContract = await ethers.getContractFactory("MyCoin")
        deployedMyCoinContract = await MyCoinContract.deploy(5000,2)
        await deployedMyCoinContract.waitForDeployment()
        console.log(deployedMyCoinContract.target)
    })

    it("Deploy MyNFTCollection Contract", async function(){
        const MyNFTCollectionContract = await ethers.getContractFactory("MyNFTCollection")
        deployedMyNFTCollectionContract = await MyNFTCollectionContract.deploy("MyKeepCodingNFT","KCNFT")
        await deployedMyNFTCollectionContract.waitForDeployment()
        console.log(deployedMyNFTCollectionContract.target)
    })

    it("Deploy MyMarketPlace Contract", async function(){
        const MyMarketPlaceContract = await ethers.getContractFactory("MyMarketPlace")
        deployedMyMarketPlaceContract = await MyMarketPlaceContract.deploy(deployedMyCoinContract.target,deployedMyNFTCollectionContract.target)
        await deployedMyMarketPlaceContract.waitForDeployment()
        console.log(deployedMyMarketPlaceContract.target)
    })

    it("Get Signers", async function(){
        [signer,account1,account2] = await ethers.getSigners()
        console.log(signer.address)
        console.log(account1.address)
        console.log(account2.address)
    })

    it("Contracts are deployed", async function(){
        expect(deployedMyCoinContract.target).to.not.be.undefined
        expect(deployedMyNFTCollectionContract.target).to.not.be.undefined
        expect(deployedMyMarketPlaceContract.target).to.not.be.undefined
    })

    it("Mint new MyKeepCodingNFT token and check ownership", async function(){
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        expect(tokenId).to.equal(1)
        let owner = await deployedMyNFTCollectionContract.ownerOf(1)
        expect(owner).to.equal(account1.address)
    })

    // it("Approve MyMarketPlace to transfer MyNFTCollection tokens", async function(){
    //     await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, 1)

    // })

    // it("Check createSale transfer ownership to contract", async function(){
    //     await deployedMyMarketPlaceContract.connect(account1).createSale(1, 100)
    //     // let sale = await deployedMyMarketPlaceContract.getSale(1)
    //     // console.log(sale)
    //     let newOwner = await deployedMyNFTCollectionContract.ownerOf(1)
    //     expect(newOwner).to.equal(deployedMyMarketPlaceContract.target)
    //     console.log(newOwner)
    // })

    // it("Check buySale", async function(){
    //     await deployedMyMarketPlaceContract.connect(account2).buySale(1)
    //     let newOwner = await deployedMyNFTCollectionContract.ownerOf(1)
    //     expect(newOwner).to.equal(account2.address)
    //     console.log(newOwner)
    // })

    // it("Check canceSale can only be called by the sale's owner", async function(){
    //     await deployedMyNFTCollectionContract.connect(account2).approve(deployedMyMarketPlaceContract.target, 1)
    //     await deployedMyMarketPlaceContract.connect(account2).createSale(1, 100)
    //     let sale = await deployedMyMarketPlaceContract.getSale(1)
    //     console.log(sale)
    //     expect(deployedMyMarketPlaceContract.connect(account1).canceSale(1)).to.be.revertedWith('You are not the owner of the sale')
    // })

    // it("Check canceSale works properly", async function(){
    //     await deployedMyNFTCollectionContract.connect(account2).approve(deployedMyMarketPlaceContract.target, 1)
    //     await deployedMyMarketPlaceContract.connect(account2).createSale(1, 100)
    //     await deployedMyMarketPlaceContract.connect(account2).canceSale(1)
    //     let oldOwner = await deployedMyNFTCollectionContract.ownerOf(1)
    //     expect(oldOwner).to.equal(account2.address)
    //     console.log(oldOwner)
    // })

    // it("Check getSale", async function(){
    //     await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, 1)
    //     await deployedMyMarketPlaceContract.connect(account1).createSale(1, 100)
    //     let sale = await deployedMyMarketPlaceContract.getSale(1)
    //     expect(sale[0]).to.equal(account1.address)
    //     expect(sale[1]).to.equal(1)
    //     expect(sale[2]).to.equal(100)
    //     expect(sale[3]).to.equal(0)
    //     console.log(sale)
    // })

});