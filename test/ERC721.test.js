const { expect } = require("chai");

// Define el conjunto de pruebas para el contrato MyNFTCollection
describe("MyNFTCollection Test Suite", function () {

    // Variables globales para almacenar la instancia del contrato desplegado y las cuentas de usuario.
    let deployedERC721Contract
    let signer, otherAccount

    // Despliegue del contrato MyNFTCollection y espera a que se complete el despliegue.
    it("Deploy Contract", async function(){
        // Obtenemos el contrato MyNFTCollection.
        const ERC721Contract = await ethers.getContractFactory("MyNFTCollection")
        // Desplegamos el contrato con el nombre "MyKeepCodingNFT" y el símbolo "KCNFT".
        deployedERC721Contract = await ERC721Contract.deploy("MyKeepCodingNFT","KCNFT")
        // Esperamos a que se complete el despliegue.
        await deployedERC721Contract.waitForDeployment()
    })

    // Obtenemos las cuentas de usuario con las que se ejecutran las pruebas.
    it("Get Signers", async function(){
        [signer,otherAccount] = await ethers.getSigners()
    })

    // Comprobamos que el nombre y el símbolo del contrato desplegado son correctos.
    it("Deployed contract have correct name and symbol", async function () {
        // Comprobamos que el nombre del contrato es "MyKeepCodingNFT".
        expect(await deployedERC721Contract.name()).to.equal("MyKeepCodingNFT");
        // Comprobamos que el símbolo del contrato es "KCNFT".
        expect(await deployedERC721Contract.symbol()).to.equal("KCNFT");
    });

    // Comprobamos que el tokenIdCounter inicial es cero.
    it("Initial tokenId counter is zero", async function() {
        let tokenIdCounter = await deployedERC721Contract.tokenIdCounter()
        expect(tokenIdCounter).to.equal(0)
    });

    // Comprobamos que el mint de un nuevo token incrementa el contador de tokenId.
    it("Mint a new token increase the TokenId counter", async function(){
        // Obtenemos el valor del tokenIdCounter antes de hacer el mint y comprobamos que es cero.
        let oldTokenIdCounter = await deployedERC721Contract.tokenIdCounter()
        expect(oldTokenIdCounter).to.equal(0)
        // Hacemos mint de un nuevo token.
        await deployedERC721Contract.mintNewToken()
        // Obtenemos el valor del tokenIdCounter después de hacer el mint y comprobamos que es uno.
        let newTokenIdCounter = await deployedERC721Contract.tokenIdCounter()
        expect(newTokenIdCounter).to.equal(1)
    });

    // Comprobamos que al mintear un nuevo token este es propiedad del que lo minteo.
    it("Minted token is owned by the sender", async function(){
        // Hacemos mint de un nuevo token.
        await deployedERC721Contract.connect(otherAccount).mintNewToken()
        // Obtenemos el valor del tokenIdCounter después de hacer el mint.
        let tokenId = await deployedERC721Contract.tokenIdCounter()
        // Obtenemos el propietario del nuevo token y comprobamos que es la cuenta que hizo el mint.
        let owner = await deployedERC721Contract.ownerOfToken(tokenId)
        expect(owner).to.equal(otherAccount.address)
    });

    // Comprobamos la transferencia de un token a otra cuenta usando la función doTransfer.
    it("Transfer token to another account using doTransfer function", async function(){
        // Hacemos mint de un nuevo token.
        await deployedERC721Contract.connect(otherAccount).mintNewToken()
        // Obtenemos el valor del tokenIdCounter después de hacer el mint.
        let tokenId = await deployedERC721Contract.tokenIdCounter()
        // Obtenemos el propietario del nuevo token y comprobamos que es la cuenta que hizo el mint.
        let currentOwner = await deployedERC721Contract.ownerOfToken(tokenId)
        expect(currentOwner).to.equal(otherAccount.address)
        // Transferimos el token a otra cuenta (signer).
        await deployedERC721Contract.connect(otherAccount).doTransfer(signer.address,tokenId)
        // Obtenemos el nuevo propietario del token y comprobamos que es la cuenta a la que se transfirió.
        let newOwner = await deployedERC721Contract.ownerOfToken(tokenId)
        expect(newOwner).to.equal(signer.address)
    });

    // Comprobamos que no se permiten transferencias si el remitente no es el propietario cuando se usa la función doTransfer.
    it("Transfers are not allowed if sender is not the owner when use doTranfer function", async function(){
        // Hacemos mint de un nuevo token.
        await deployedERC721Contract.connect(otherAccount).mintNewToken()
        // Obtenemos el valor del tokenIdCounter después de hacer el mint.
        let tokenId = await deployedERC721Contract.tokenIdCounter()
        // Obtenemos el propietario del nuevo token y comprobamos que es la cuenta que hizo el mint.
        let currentOwner = await deployedERC721Contract.ownerOfToken(tokenId)
        expect(currentOwner).to.equal(otherAccount.address)
        // Comprobamos que no se permite la transferencia si el remitente no es el propietario.
        await expect(
            deployedERC721Contract.connect(signer).doTransfer(otherAccount.address,tokenId)
            ).to.be.revertedWith("ERC721: caller is not token owner or approved")
        // Aprobamos la transferencia a la cuenta signer.
        await deployedERC721Contract.connect(otherAccount).approve(signer.address,tokenId)
        // Obtenemos la dirección aprobada para la transferencia y comprobamos que es la cuenta signer.
        let approvedAddress = await deployedERC721Contract.getApproved(tokenId)
        expect(approvedAddress).to.equal(signer.address)
        // Comprobamos que aunque se haya aprobado la transferencia, no se permite si el remitente no es el propietario.
        await expect(
            deployedERC721Contract.connect(signer).doTransfer(signer.address,tokenId)
            ).to.be.revertedWith("ERC721: transfer from incorrect owner")
    });

    // Comprobamos la transferencia de un token a otra cuenta usando la función transferFrom.
    it("Transfer token to another account using transferFrom function", async function(){
        // Hacemos mint de un nuevo token.
        await deployedERC721Contract.connect(otherAccount).mintNewToken()
        // Obtenemos el valor del tokenIdCounter después de hacer el mint.
        let tokenId = await deployedERC721Contract.tokenIdCounter()
        // Obtenemos el propietario del nuevo token y comprobamos que es la cuenta que hizo el mint.
        let currentOwner = await deployedERC721Contract.ownerOfToken(tokenId)
        expect(currentOwner).to.equal(otherAccount.address)
        // Realizamos la transferencia del token a la cuenta signer utilizando la función transferFrom.
        await deployedERC721Contract.connect(otherAccount).transferFrom(otherAccount.address,signer.address,tokenId)
        // Obtenemos el nuevo propietario del token y comprobamos que es la cuenta a la que se transfirió (signer).
        let newOwner = await deployedERC721Contract.ownerOfToken(tokenId)
        expect(newOwner).to.equal(signer.address)
    });

    // Comprobamos que no se permiten transferencias si el remitente no es el propietario o aprobado cuando se usa la función transferFrom.
    it("Transfers are not allowed if sender is not the owner or approved when use transferFrom function", async function(){
        // Hacemos mint de un nuevo token.
        await deployedERC721Contract.connect(otherAccount).mintNewToken()
        // Obtenemos el valor del tokenIdCounter después de hacer el mint.
        let tokenId = await deployedERC721Contract.tokenIdCounter()
        // Obtenemos el propietario del nuevo token y comprobamos que es la cuenta que hizo el mint.
        let currentOwner = await deployedERC721Contract.ownerOfToken(tokenId)
        expect(currentOwner).to.equal(otherAccount.address)
        // Comprobamos que no se permite la transferencia si el remitente no es el propietario.
        await expect(
            deployedERC721Contract.connect(signer).transferFrom(otherAccount.address,signer.address,tokenId)
            ).to.be.revertedWith("ERC721: caller is not token owner or approved")
        // Aprobamos la transferencia a la cuenta signer.
        await deployedERC721Contract.connect(otherAccount).approve(signer.address,tokenId)
        // Obtenemos la dirección aprobada para la transferencia y comprobamos que es la cuenta signer.
        let approvedAddress = await deployedERC721Contract.getApproved(tokenId)
        expect(approvedAddress).to.equal(signer.address)
        // Comprobamos que ahora que se ha aprobado la cuenta signer se puede realizar la transferencia aunque no sea el propietario.
        await deployedERC721Contract.connect(signer).transferFrom(otherAccount.address,signer.address,tokenId)
        // Obtenemos el nuevo propietario del token y comprobamos que es la cuenta a la que se transfirió (signer).
        let newOwner = await deployedERC721Contract.ownerOfToken(tokenId)
        expect(newOwner).to.equal(signer.address)
    });

});