const { expect } = require("chai");

// Define el conjunto de pruebas para el contrato MyCoin
describe("ERC20 Test Suite", function(){

    // Variables globales para almacenar la instancia del contrato desplegado y las cuentas de usuario.
    let deployedERC20Contract
    let signer, otherAccount

    // Despliegue del contrato MyCoin y espera a que se complete el despliegue.
    it("Deploy Contract", async function(){
        // Obtenemos el contrato MyCoin.
        const ERC20Contract = await ethers.getContractFactory("MyCoin")
        // Desplegamos el contrato con 5000 MyCoins y 2 decimales.
        deployedERC20Contract = await ERC20Contract.deploy(5000,2)
        // Esperamos a que se complete el despliegue.
        await deployedERC20Contract.waitForDeployment()
    })

    // Obtenemos las cuentas de usuario con las que se ejecutran las pruebas.
    it("Get Signers", async function(){
        [signer,otherAccount] = await ethers.getSigners()
    })

    // Comprobamos que los balances iniciales de las cuentas son correctos.
    it("Check Balance", async function(){
        // Comprobamos que el balance de la cuenta que desplegó el contrato es 5000 MyCoin.
        const balance = await deployedERC20Contract.getBalance(signer.address)
        expect(balance).to.equal(5000)
        // Comprobamos que el balance de la otra cuenta es 0 MyCoin.
        const balance2 = await deployedERC20Contract.getBalance(otherAccount.address)
        expect(balance2).to.equal(0)
    })

    // Comprobamos que las transferencias de MyCoin funcionan correctamente.
    it("Check Transfer", async function(){
        // Transferimos 3000 MyCoin de la cuenta que desplegó el contrato a la otra cuenta.
        await deployedERC20Contract.doTransfer(otherAccount.address,3000)
        // Comprobamos que el balance de la cuenta que desplegó el contrato es 2000 MyCoin.
        const balance = await deployedERC20Contract.getBalance(signer.address)
        expect(balance).to.equal(2000)
        // Comprobamos que el balance de la otra cuenta es 3000 MyCoin.
        const balance2 = await deployedERC20Contract.getBalance(otherAccount.address)
        expect(balance2).to.equal(3000)
    })

    // Comprobamos que el mint de MyCoin funciona correctamente.
    it("Check mint", async function(){
        // Comprobamos que el balance de la cuenta que desplegó el contrato es 2000 MyCoin.
        const balance = await deployedERC20Contract.getBalance(signer.address)
        expect(balance).to.equal(2000)
        // Comprobamos que el balance de la otra cuenta es 3000 MyCoin.
        const balance2 = await deployedERC20Contract.getBalance(otherAccount.address)
        expect(balance2).to.equal(3000)
        // Hacemons un mint de 3000 nuevos MyCoin a la otra cuenta.
        const mint = await deployedERC20Contract.mintNewTokens(3000,otherAccount.address)
        // Comprobamos que el balance de la otra cuenta es 6000 MyCoin.
        const balanceFinal2 = await deployedERC20Contract.getBalance(otherAccount.address)
        expect(balanceFinal2).to.equal(6000)
    })

    // Comprobamos el funcionamiento correcto de la función switcher.
    it("Check switcher", async function(){
        // Comprobamos que el estado inicial debe ser true.
        const status = await deployedERC20Contract.status()
        expect(status).to.be.true
        // Ejecutamos la función switcher para cambiar el estado.
        const response = await deployedERC20Contract.switcher()
        // Comprobamos el estado final es false.
        const finalStatus = await deployedERC20Contract.status()
        expect(finalStatus).to.be.false
    })

    // Comprobamos que las transferencias no están permitidas si el estado del contrato es false.
    it("Check Transfers are not allowed", async function(){
        await expect(
            deployedERC20Contract.doTransfer(otherAccount.address,100)
        ).to.be.revertedWith('Transfers are not allowed')
    })

    // Comprobamos el funcionamiento correcto de la función switcherAccount, la cual cambia el estado de una cuenta.
    it("Check switcherAccount", async function(){
        // Comprobamos el estado inicial de la cuenta que desplegó el contrato.
        const status = await deployedERC20Contract.blacklist(signer.address)
        expect(status).to.be.false
        // Ejecutamos la función switcherAccount para cambiar el estado de la cuenta que desplegó el contrato.
        await deployedERC20Contract.switcherAccount(signer.address)
        // Comprobamos el estado final de la cuenta que desplegó el contrato.
        const midStatus = await deployedERC20Contract.blacklist(signer.address)
        expect(midStatus).to.be.true
        // Ejecutamos la función switcherAccount para cambiar nuevamente el estado de la cuenta que desplegó el contrato.
        await deployedERC20Contract.switcherAccount(signer.address)
        // Comprobamos que el estado final de la cuenta que desplegó el contrato es nuevamente false.
        const finalStatus = await deployedERC20Contract.blacklist(signer.address)
        expect(finalStatus).to.be.false
    })

    // Comprobamos que las transferencias no están permitidas para una cuenta que se encuentra blacklisted.
    it("Check transfers are not allowed when sender is blacklisted", async function(){
        // Cambiamos el estado del contrato.
        await deployedERC20Contract.switcher()
        // Comprobamos que el estado del contrato es true, es decir, está activo.
        const contractStatus = await deployedERC20Contract.status()
        expect(contractStatus).to.be.true
        // Cambiamos el estado de la cuenta que desplegó el contrato.
        await deployedERC20Contract.switcherAccount(signer.address)
        // Comprobamos que el estado de la cuenta que desplegó el contrato es true, es decir, está blacklisted.
        const accountStatus = await deployedERC20Contract.blacklist(signer.address)
        expect(accountStatus).to.be.true
        // Como la cuenta que desplegó el contrato está blacklisted, no puede realizar transferencias.
        await expect(
            deployedERC20Contract.doTransfer(signer.address,100)
        ).to.be.revertedWith('Account is not allowed')
    })

    // Comprobamos la función setDecimals que permite cambiar el número de decimales del contrato.
    it("Check setDecimals", async function(){
        // Comprobamos que el valor incial de decimales es 2 (establecido al desplegar el contrato).
        const decimals = await deployedERC20Contract.decimals()
        expect(decimals).to.equal(2)
        // Cambiamos el número de decimales a 3.
        await deployedERC20Contract.setDecimals(3)
        // Comprobamos que el valor final de decimales es 3.
        const finalDecimals = await deployedERC20Contract.decimals()
        expect(finalDecimals).to.equal(3)
    })

}) 