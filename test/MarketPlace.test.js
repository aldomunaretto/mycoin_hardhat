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
        // Revisamos que el balance inicial del propietario del contrato (signer) sea 5000.
        let balanceSigner = await deployedMyCoinContract.getBalance(signer.address)
        expect(balanceSigner).to.equal(5000)
        // Revisamos que el balance inicial de la account1 sea 0.
        let balanceAccount1 = await deployedMyCoinContract.getBalance(account1.address)
        expect(balanceAccount1).to.equal(0)
    });

     // Mintear un nuevo token NFT y verificar la propiedad del mismo.
    it("Mint new MyKeepCodingNFT token and check ownership", async function() {
        // Minteamos un nuevo token NFT y verificamos que el tokenId sea 1.
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        expect(tokenId).to.equal(1)
        // Verificamos que el propietario del token sea la cuenta que la minteo (account1).
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
    })

    // Verificar que la función createSale transfiera la propiedad del NFT al contrato de MyMarketPlace.
    it("Check createSale transfer ownership to MyMarketPlace contract", async function() {
        // Minteamos un nuevo token NFT y verificamos que propietario sea la cuenta que la minteo (account1).
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        // Aprobamos al contrato MyMarketPlace para que pueda transferir el token.
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        // Creamos una venta del token y verificamos que el nuevo propietario sea el contrato MyMarketPlace.
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        let newOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(newOwner).to.equal(deployedMyMarketPlaceContract.target)
    });

    // Verificar que solo el propietario del token pueda llamar a createSale.
    it("createSale function can only be called by the token's owner", async function() {
        // Minteamos un nuevo token NFT y verificamos que propietario sea la cuenta que la minteo (account1).
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        // Verificamos que la función createSale falle si el que llama no es el propietario del token.
        expect(deployedMyMarketPlaceContract.connect(signer).createSale(tokenId, 100)).to.be.revertedWith('You are not the owner of the token')
    });    

    // Verificar que la función buySale transfiera el NFT al comprador y los MyCoins al vendedor.
    it("Check buySale transfer MyCoins to seller and the MyKeepCodingNFT to buyer", async function() {
        // Verificamos que el balance inicial del propietario del contrato (signer) sea 5000.
        let oldBalanceSigner = await deployedMyCoinContract.getBalance(signer.address)
        expect(oldBalanceSigner).to.equal(5000)
        // Verificamos que el balance inicial de la account1 sea 0.
        let oldBalanceAccount1 = await deployedMyCoinContract.getBalance(account1.address)
        expect(oldBalanceAccount1).to.equal(0)
        // Minteamos un nuevo token NFT y verificamos que propietario sea la cuenta que la minteo (account1).
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        // Aprobamos al contrato MyMarketPlace para que pueda transferir el token.
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        // Creamos una venta del token y verificamos que el nuevo propietario sea el contrato MyMarketPlace.
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        let currentOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(currentOwner).to.equal(deployedMyMarketPlaceContract.target)
        // Aprobamos al contrato MyMarketPlace para que pueda transferir los MyCoins.
        await deployedMyCoinContract.connect(signer).approve(deployedMyMarketPlaceContract.target, 100)
        // Obtenemos el id de la venta.
        let saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        // Compramos el token y verificamos que el nuevo propietario sea la cuenta que lo compro (signer).
        await deployedMyMarketPlaceContract.connect(signer).buySale(saleId)
        let newOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(newOwner).to.equal(signer.address)
        // Verificamos que el balance final del propietario del contrato (signer) sea 4900.
        let newBalanceSigner = await deployedMyCoinContract.getBalance(signer.address)
        expect(newBalanceSigner).to.equal(4900)
        // Verificamos que el balance final de la account1 sea 100.
        let newBalanceAccount1 = await deployedMyCoinContract.getBalance(account1.address)
        expect(newBalanceAccount1).to.equal(100)
    });

    // Verificar que la compra falla si el comprador no tiene suficientes MyCoins.
    it("buySale fails if the buyer does not have enough MyCoins", async function() {	
        // Minteamos un nuevo token NFT y verificamos que propietario sea la cuenta que la minteo (account1).
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        // Aprobamos al contrato MyMarketPlace para que pueda transferir el token.
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        // Creamos una venta del token y verificamos que el nuevo propietario sea el contrato MyMarketPlace.
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 10000)
        let currentOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(currentOwner).to.equal(deployedMyMarketPlaceContract.target)
        // Aprobamos al contrato MyMarketPlace para que pueda transferir los MyCoins.
        await deployedMyCoinContract.connect(signer).approve(deployedMyMarketPlaceContract.target, 10000)
        // Obtenemos el id de la venta.
        let saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        // Verificamos que la compra falla si el comprador no tiene suficientes MyCoins.
        expect(deployedMyMarketPlaceContract.connect(signer).buySale(saleId)).to.be.revertedWith('Insufficient balance')
    });

    // Verificar que la compra falle si el estado de la venta no es Open.
    it("buySale fails if status of the Sale is not Open", async function() {
        // Minteamos un nuevo token NFT y verificamos que propietario sea la cuenta que la minteo (account1).
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        // Aprobamos al contrato MyMarketPlace para que pueda transferir el token.
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        // Creamos una venta del token y verificamos que el nuevo propietario sea el contrato MyMarketPlace.
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        await deployedMyCoinContract.connect(signer).approve(deployedMyMarketPlaceContract.target, 100)
        // Obtenemos el id de la venta.
        let saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        // Cancelamos la venta y verificamos que la compra falla porque el estado de la venta no es Open.
        await deployedMyMarketPlaceContract.connect(account1).canceSale(saleId)
        expect(deployedMyMarketPlaceContract.connect(signer).buySale(saleId)).to.be.revertedWith('Sale is not open')
    });

    // Verificar que la función canceSale devuelva el NFT al propietario anterior.
    it("Check canceSale returns the MyKeepCodingNFT to the previous owner", async function(){
        // Minteamos un nuevo token NFT y verificamos que propietario sea la cuenta que la minteo (account1).
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        // Aprobamos al contrato MyMarketPlace para que pueda transferir el token.
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        // Creamos una venta del token y verificamos que el nuevo propietario sea el contrato MyMarketPlace.
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        let currentOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(currentOwner).to.equal(deployedMyMarketPlaceContract.target)
        // Aprobamos al contrato MyMarketPlace para que pueda transferir los MyCoins.
        await deployedMyCoinContract.connect(signer).approve(deployedMyMarketPlaceContract.target, 100)
        // Obtenemos el id de la venta.
        let saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        // Cancelamos la venta y verificamos que la propiedad del token vuelva a la cuenta que lo minteo (account1).
        await deployedMyMarketPlaceContract.connect(account1).canceSale(saleId)
        let oldOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(oldOwner).to.equal(account1.address)
    });

    // Verificar que la función canceSale solo pueda ser llamada por el propietario de la venta.
    it("Check canceSale can only be called by the sale's owner", async function(){
        // Minteamos un nuevo token NFT y verificamos que propietario sea la cuenta que la minteo (account1).
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        // Aprobamos al contrato MyMarketPlace para que pueda transferir el token.
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        // Creamos una venta del token y verificamos que el nuevo propietario sea el contrato MyMarketPlace.
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        let currentOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(currentOwner).to.equal(deployedMyMarketPlaceContract.target)
        // Aprobamos al contrato MyMarketPlace para que pueda transferir los MyCoins.
        await deployedMyCoinContract.connect(signer).approve(deployedMyMarketPlaceContract.target, 100)
        // Obtenemos el id de la venta.
        let saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        // Verificamos que la función canceSale falla si el que llama no es el propietario de la venta.
        expect(deployedMyMarketPlaceContract.connect(account1).canceSale(saleId)).to.be.revertedWith('You are not the owner of the sale')
        // Verificamos que la propiedad del token la sigue manteniendo el contrato MyMarketPlace.
        let stillOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(stillOwner).to.equal(deployedMyMarketPlaceContract.target)
    });

    // Verificar que la función canceSale falle si el estado de la venta no es Open.
    it("canceSale fails if status of the Sale is not Open", async function() {
        // Minteamos un nuevo token NFT y verificamos que propietario sea la cuenta que la minteo (account1).
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(owner).to.equal(account1.address)
        // Aprobamos al contrato MyMarketPlace para que pueda transferir el token.
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        // Creamos una venta del token y verificamos que el nuevo propietario sea el contrato MyMarketPlace.
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        let currentOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(currentOwner).to.equal(deployedMyMarketPlaceContract.target)
        // Aprobamos al contrato MyMarketPlace para que pueda transferir los MyCoins.
        await deployedMyCoinContract.connect(signer).approve(deployedMyMarketPlaceContract.target, 100)
        // Obtenemos el id de la venta.
        let saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        // Verificamos que la compra falla si el estado de la venta no es Open.
        await deployedMyMarketPlaceContract.connect(signer).buySale(saleId)
        expect(deployedMyMarketPlaceContract.connect(account1).canceSale(saleId)).to.be.revertedWith('Sale is not open')
    });

    // Verificar que la función getSale devuelva la información correcta de la venta.
    it("Check getSale returns correct information after using createSale function", async function() {
        // Minteamos un nuevo token NFT y verificamos que propietario sea la cuenta que la minteo (account1).
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let owner = await deployedMyNFTCollectionContract.ownerOfToken(tokenId)
        expect(owner).to.equal(account1.address)
        // Aprobamos al contrato MyMarketPlace para que pueda transferir el token.
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        // Creamos una venta del token y verificamos que el nuevo propietario sea el contrato MyMarketPlace.
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        let currentOwner = await deployedMyNFTCollectionContract.ownerOf(tokenId)
        expect(currentOwner).to.equal(deployedMyMarketPlaceContract.target)
        // Obtenemos el id de la venta.
        let saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        // Obtenemos la información de la venta y verificamos que sea correcta.
        let sale = await deployedMyMarketPlaceContract.getSale(saleId)
        expect(sale[0]).to.equal(account1.address)
        expect(sale[1]).to.equal(tokenId)
        expect(sale[2]).to.equal(100)
        expect(sale[3]).to.equal(0)
    });

    // Verificar que cambia el estado de la venta a Executed después de la función buySale.
    it("Check that status change to Executed after buySale function", async function() {
        // Minteamos un nuevo token NFT y verificamos que propietario sea la cuenta que la minteo (account1).
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let currentOwner = await deployedMyNFTCollectionContract.ownerOfToken(tokenId)
        expect(currentOwner).to.equal(account1.address)
        // Aprobamos al contrato MyMarketPlace para que pueda transferir el token.
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        // Creamos una venta del token y verificamos que el nuevo propietario sea el contrato MyMarketPlace.
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        let owner = await deployedMyNFTCollectionContract.ownerOfToken(tokenId)
        expect(owner).to.equal(deployedMyMarketPlaceContract.target)
        // Aprobamos al contrato MyMarketPlace para que pueda transferir los MyCoins.
        await deployedMyCoinContract.connect(signer).approve(deployedMyMarketPlaceContract.target, 100)
        // Obtenemos el id de la venta.
        saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        // Hacemos la compra y verificamos que la información de la venta sea correcta.
        await deployedMyMarketPlaceContract.connect(signer).buySale(saleId)
        let sale = await deployedMyMarketPlaceContract.getSale(saleId)
        expect(sale[0]).to.equal(account1.address)
        expect(sale[1]).to.equal(tokenId)
        expect(sale[2]).to.equal(100)
        expect(sale[3]).to.equal(1)
    });

    // Verificar que cambia el estado de la venta a Cancelled después de la función canceSale.
    it("Check that status change to Cancelled after canceSale function", async function() {
        // Minteamos un nuevo token NFT y verificamos que propietario sea la cuenta que la minteo (account1).
        await deployedMyNFTCollectionContract.connect(account1).mintNewToken()
        let tokenId = await deployedMyNFTCollectionContract.tokenIdCounter()
        let currentOwner = await deployedMyNFTCollectionContract.ownerOfToken(tokenId)
        expect(currentOwner).to.equal(account1.address)
        // Aprobamos al contrato MyMarketPlace para que pueda transferir el token.
        await deployedMyNFTCollectionContract.connect(account1).approve(deployedMyMarketPlaceContract.target, tokenId)
        // Creamos una venta del token y verificamos que el nuevo propietario sea el contrato MyMarketPlace.
        await deployedMyMarketPlaceContract.connect(account1).createSale(tokenId, 100)
        let owner = await deployedMyNFTCollectionContract.ownerOfToken(tokenId)
        expect(owner).to.equal(deployedMyMarketPlaceContract.target)
        // Obtenemos el id de la venta.
        saleId = await deployedMyMarketPlaceContract.saleIdCounter()
        // Cancelamos la venta y verificamos que la información de la venta sea correcta.
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