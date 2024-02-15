const { expect } = require("chai");

// Define el conjunto de pruebas para el MarketPlace.
describe("MyMarketPlace Test Suite", function () {

    // Variables globales para almacenar las instancias de los contratos desplegados y cuentas de usuario.
    let deployedMyCoinContract, deployedMyNFTCollectionContract, deployedMyMarketPlaceContract;
    let signer, account1;

    // Despliegue del contrato MyCoin y espera a que se complete el despliegue.
    it("Deploy MyCoin Contract", async function(){
        const MyCoinContract = await ethers.getContractFactory("MyCoin")
        deployedMyCoinContract = await MyCoinContract.deploy(5000,2)
        await deployedMyCoinContract.waitForDeployment()
        // console.log(deployedMyCoinContract.target)
    })

    // Despliegue del contrato MyNFTCollection y espera a que se complete el despliegue.
    it("Deploy MyNFTCollection Contract", async function(){
        const MyNFTCollectionContract = await ethers.getContractFactory("MyNFTCollection")
        deployedMyNFTCollectionContract = await MyNFTCollectionContract.deploy("MyKeepCodingNFT","KCNFT")
        await deployedMyNFTCollectionContract.waitForDeployment()
        // console.log(deployedMyNFTCollectionContract.target)
    })

    // Despliegue del contrato MyMarketPlace y espera a que se complete el despliegue.
    it("Deploy MyMarketPlace Contract", async function(){
        const MyMarketPlaceContract = await ethers.getContractFactory("MyMarketPlace")
        deployedMyMarketPlaceContract = await MyMarketPlaceContract.deploy(deployedMyCoinContract.target,deployedMyNFTCollectionContract.target)
        await deployedMyMarketPlaceContract.waitForDeployment()
        // console.log(deployedMyMarketPlaceContract.target)
    })

    // Obtenemos las cuentas de usuario con las que se ejecutran las pruebas.
    it("Get Signers", async function(){
        [signer,account1] = await ethers.getSigners()
        // console.log(signer.address)
        // console.log(account1.address)
    })

    // Verificación de que los contratos se han desplegado correctamente.
    it("Contracts are deployed", async function() {
        expect(deployedMyCoinContract.target).to.not.be.undefined
        expect(deployedMyNFTCollectionContract.target).to.not.be.undefined
        expect(deployedMyMarketPlaceContract.target).to.not.be.undefined
    })

    // Verificación de que el contrato MyCoin se ha desplegado con los valores iniciales correctos.
    it("Check MyCoin initial values", async function() {
        let balanceSigner = await deployedMyCoinContract.getBalance(signer.address)
        expect(balanceSigner).to.equal(5000)
        let balanceAccount1 = await deployedMyCoinContract.getBalance(account1.address)
        expect(balanceAccount1).to.equal(0)
        let allowance = await deployedMyCoinContract.allowance(signer.address,deployedMyMarketPlaceContract.target)
        expect(allowance).to.equal(0)
    });

     // Mintear un nuevo token NFT y verificar la propiedad del mismo.
    it("Mint new MyKeepCodingNFT token and check ownership", async function() {
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        expect(tokenId).to.equal(1)
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
    })

    // Verificar que la función createSale transfiera la propiedad del NFT al contrato de MyMarketPlace.
    it("Check createSale transfer ownership to MyMarketPlace contract", async function() {
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        let newOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(newOwner).to.equal(deployedMyMarketPlaceContract.target)
    });

    // Verificar que solo el propietario del token pueda llamar a createSale.
    it("createSale function can only be called by the token's owner", async function() {
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        expect(deployedMyMarketPlaceContract.connect(signer).createSale(tokenId, 100)).to.be.revertedWith('You are not the owner of the token')
    });    

    // Verificar que la función buySale transfiera el NFT al comprador y los MyCoins al vendedor.
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

    // Verificar que la compra falle si el comprador no tiene suficientes MyCoins.
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

    // Verificar que la compra falle si el estado de la venta no es Open.
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

    // Verificar que la función canceSale devuelva el NFT al propietario anterior.
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

    // Verificar que la función canceSale solo pueda ser llamada por el propietario de la venta.
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

    // Verificar que la función canceSale falle si el estado de la venta no es Open.
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

    // Verificar que la función getSale devuelva la información correcta de la venta.
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

    // Verificar que cambia el estado de la venta a Executed después de la función buySale.
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

    // Verificar que cambia el estado de la venta a Cancelled después de la función canceSale.
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

    // Verificar que la función buySale falle si el saleId no existe.
    it("buySale fails if saleId does not exist", async function() {
        expect(deployedMyMarketPlaceContract.buySale(100)).to.be.revertedWith('Invalid saleId')
    });

    // Verificar que la función canceSale falle si el saleId no existe.
    it("canceSale fails if saleId does not exist", async function() {
        expect(deployedMyMarketPlaceContract.canceSale(100)).to.be.revertedWith('Invalid saleId')
    });

    // Verificar que la función getSale falle si el saleId no existe.
    it("getSale fails if saleId does not exist", async function() {
        expect(deployedMyMarketPlaceContract.getSale(100)).to.be.revertedWith('Invalid saleId')
    });

});