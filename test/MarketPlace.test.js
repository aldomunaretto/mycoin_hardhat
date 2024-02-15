// IMPORTANE
// Para la resolucion de la practica es necesario utilizar la funcion transferFrom tanto del ERC20 como del ERC721.
// Porque quien va a realizar las llamas de transferencia (transferFrom) va a ser el contrato del MarketPlace
// Por este motivo cuando desarrolleis los test primero teneis que hacer una llamada al metodo approve para autorizar el contrato de MarketPlace a transferir los tokens ERC20 y ERC721.

const { expect } = require("chai");

describe("MyMarketPlace Test Suite", function () {

    let deployedMyCoinContract, deployedMyNFTCollectionContract, deployedMyMarketPlaceContract;
    let signer, account1;

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
        [signer,account1] = await ethers.getSigners()
        console.log(signer.address)
        console.log(account1.address)
    })

    it("Contracts are deployed", async function() {
        expect(deployedMyCoinContract.target).to.not.be.undefined
        expect(deployedMyNFTCollectionContract.target).to.not.be.undefined
        expect(deployedMyMarketPlaceContract.target).to.not.be.undefined
    })

    it("Mint new MyKeepCodingNFT token and check ownership", async function() {
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        expect(tokenId).to.equal(1)
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
    })

    it("Check createSale transfer ownership to contract", async function() {
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        let newOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(newOwner).to.equal(deployedMyMarketPlaceContract.target)
    });

    it("Create sale can only be called by the token's owner", async function() {
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        expect(deployedMyMarketPlaceContract.connect(signer).createSale(tokenId, 100)).to.be.revertedWith('You are not the owner of the token')
    });    

    it("Check buySale transfer MyCoins to seller and the MyKeepCodingNFT to buyer", async function() {
        let oldBalanceSigner = await deployedMyCoinContract.getBalance(signer.address)
        expect(oldBalanceSigner).to.equal(5000)
        let oldBalanceAccount1 = await deployedMyCoinContract.getBalance(account1.address)
        expect(oldBalanceAccount1).to.equal(0)
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        let currentOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(currentOwner).to.equal(deployedMyMarketPlaceContract.target)
        await deployedMyCoinContract.connect(signer).approve(deployedMyMarketPlaceContract.target, 100)
        let saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        await deployedMyMarketPlaceContract.connect(signer).buySale(saleId)
        let newOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(newOwner).to.equal(signer.address)
        let newBalanceSigner = await deployedMyCoinContract.getBalance(signer.address)
        expect(newBalanceSigner).to.equal(4900)
        let newBalanceAccount1 = await deployedMyCoinContract.getBalance(account1.address)
        expect(newBalanceAccount1).to.equal(100)
    });

    it("buySale fails if the buyer does not have enough MyCoins", async function() {	
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 10000)
        let currentOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(currentOwner).to.equal(deployedMyMarketPlaceContract.target)
        await deployedMyCoinContract.connect(signer).approve(deployedMyMarketPlaceContract.target, 10000)
        let saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        expect(deployedMyMarketPlaceContract.connect(signer).buySale(saleId)).to.be.revertedWith('Insufficient balance')
    });

    it("buySale fails if status of the Sale is not Open", async function() {
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        await deployedMyCoinContract.connect(signer).approve(deployedMyMarketPlaceContract.target, 100)
        let saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        await deployedMyMarketPlaceContract.connect(account1).canceSale(saleId)
        expect(deployedMyMarketPlaceContract.connect(signer).buySale(saleId)).to.be.revertedWith('Sale is not open')
    });

    it("Check canceSale returns the MyKeepCodingNFT to the previous owner", async function(){
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        let currentOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(currentOwner).to.equal(deployedMyMarketPlaceContract.target)
        await deployedMyCoinContract.connect(signer).approve(deployedMyMarketPlaceContract.target, 100)
        let saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        await deployedMyMarketPlaceContract.connect(account1).canceSale(saleId)
        let oldOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(oldOwner).to.equal(account1.address)
    });

    it("Check canceSale can only be called by the sale's owner", async function(){
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        let currentOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(currentOwner).to.equal(deployedMyMarketPlaceContract.target)
        await deployedMyCoinContract.connect(signer).approve(deployedMyMarketPlaceContract.target, 100)
        let saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        expect(deployedMyMarketPlaceContract.connect(account1).canceSale(saleId)).to.be.revertedWith('You are not the owner of the sale')
        let stillOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(stillOwner).to.equal(deployedMyMarketPlaceContract.target)
    });

    it("canceSale fails if status of the Sale is not Open", async function() {
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        await deployedMyCoinContract.connect(signer).approve(deployedMyMarketPlaceContract.target, 100)
        let saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        await deployedMyMarketPlaceContract.connect(signer).buySale(saleId)
        expect(deployedMyMarketPlaceContract.connect(account1).canceSale(saleId)).to.be.revertedWith('Sale is not open')
    });

    it("Check getSale returns correct information after using createSale function", async function() {
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let currentOwner = await deployedMyNFTCollectionContract.ownerOfToken(tokenId)
        expect(currentOwner).to.equal(account1.address)
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        let saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        let sale = await deployedMyMarketPlaceContract.getSale(saleId)
        expect(sale[0]).to.equal(account1.address)
        expect(sale[1]).to.equal(tokenId)
        expect(sale[2]).to.equal(100)
        expect(sale[3]).to.equal(0)
    });

    it("Check that status change to Executed after buySale function", async function() {
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let currentOwner = await deployedMyNFTCollectionContract.ownerOfToken(tokenId)
        expect(currentOwner).to.equal(account1.address)
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        let owner = await deployedMyNFTCollectionContract.ownerOfToken(tokenId)
        expect(owner).to.equal(deployedMyMarketPlaceContract.target)
        await deployedMyCoinContract.connect(signer).approve(deployedMyMarketPlaceContract.target, 100)
        saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        await deployedMyMarketPlaceContract.connect(signer).buySale(saleId)
        let sale = await deployedMyMarketPlaceContract.getSale(saleId)
        expect(sale[0]).to.equal(account1.address)
        expect(sale[1]).to.equal(tokenId)
        expect(sale[2]).to.equal(100)
        expect(sale[3]).to.equal(1)
    });

    it("Check that status change to Cancelled after canceSale function", async function() {
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let currentOwner = await deployedMyNFTCollectionContract.ownerOfToken(tokenId)
        expect(currentOwner).to.equal(account1.address)
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        let owner = await deployedMyNFTCollectionContract.ownerOfToken(tokenId)
        expect(owner).to.equal(deployedMyMarketPlaceContract.target)
        saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        await deployedMyMarketPlaceContract.connect(account1).canceSale(saleId)
        let sale = await deployedMyMarketPlaceContract.getSale(saleId)
        expect(sale[0]).to.equal(account1.address)
        expect(sale[1]).to.equal(tokenId)
        expect(sale[2]).to.equal(100)
        expect(sale[3]).to.equal(2)
    });

    it("getSale fails if saleId does not exist", async function() {
        expect(deployedMyMarketPlaceContract.getSale(100)).to.be.revertedWith('Invalid saleId')
    });

});