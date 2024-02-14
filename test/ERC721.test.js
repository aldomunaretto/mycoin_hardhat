const { expect } = require("chai");

describe("MyNFTCollection Test Suite", function () {

    let deployedERC721Contract

    let signer, otherAccount

    it("Deploy Contract", async function(){
        const ERC721Contract = await ethers.getContractFactory("MyNFTCollection")
        deployedERC721Contract = await ERC721Contract.deploy("MyKeepCodingNFT","KCNFT")
        await deployedERC721Contract.waitForDeployment()
        console.log(deployedERC721Contract.target)
    })

    it("Get Signers", async function(){
        [signer,otherAccount] = await ethers.getSigners()
        console.log(signer.address)
        console.log(otherAccount.address)
    })

    it("Deployed contract have correct name and symbol", async function () {
      expect(await deployedERC721Contract.name()).to.equal("MyKeepCodingNFT");
      expect(await deployedERC721Contract.symbol()).to.equal("KCNFT");
    });

    it("Initial tokenId counter is zero", async function() {
        let tokenIdCounter = await deployedERC721Contract.tokenIdCounter()
        expect(tokenIdCounter).to.equal(0)
    });

    it("Mint a new token increase the TokenId counter", async function(){
        let oldTokenIdCounter = await deployedERC721Contract.tokenIdCounter()
        expect(oldTokenIdCounter).to.equal(0)
        await deployedERC721Contract.mintNewToken()
        let newTokenIdCounter = await deployedERC721Contract.tokenIdCounter()
        expect(newTokenIdCounter).to.equal(1)
    });

    it("Minted token is owned by the sender", async function(){
        await deployedERC721Contract.connect(otherAccount).mintNewToken()
        let tokenId = await deployedERC721Contract.tokenIdCounter()
        let owner = await deployedERC721Contract.ownerOfToken(tokenId)
        expect(owner).to.equal(otherAccount.address)
    });

    it("Transfer token to another account using doTransfer function", async function(){
        await deployedERC721Contract.connect(otherAccount).mintNewToken()
        let tokenId = await deployedERC721Contract.tokenIdCounter()
        let currentOwner = await deployedERC721Contract.ownerOfToken(tokenId)
        expect(currentOwner).to.equal(otherAccount.address)
        await deployedERC721Contract.connect(otherAccount).doTransfer(signer.address,tokenId)
        let newOwner = await deployedERC721Contract.ownerOfToken(tokenId)
        expect(newOwner).to.equal(signer.address)
    });

    it("Transfers are not allowed if sender is not the owner when use doTranfer function", async function(){
        await deployedERC721Contract.connect(otherAccount).mintNewToken()
        let tokenId = await deployedERC721Contract.tokenIdCounter()
        let currentOwner = await deployedERC721Contract.ownerOfToken(tokenId)
        expect(currentOwner).to.equal(otherAccount.address)
        await expect(deployedERC721Contract.connect(signer).doTransfer(otherAccount.address,tokenId)).to.be.revertedWith("ERC721: caller is not token owner or approved")
        await deployedERC721Contract.connect(otherAccount).approve(signer.address,tokenId)
        let approvedAddress = await deployedERC721Contract.getApproved(tokenId)
        expect(approvedAddress).to.equal(signer.address)
        await expect(deployedERC721Contract.connect(signer).doTransfer(signer.address,tokenId)).to.be.revertedWith("ERC721: transfer from incorrect owner")

    });

    it("Transfer token to another account using transferFrom function", async function(){
        await deployedERC721Contract.connect(otherAccount).mintNewToken()
        let tokenId = await deployedERC721Contract.tokenIdCounter()
        let currentOwner = await deployedERC721Contract.ownerOfToken(tokenId)
        expect(currentOwner).to.equal(otherAccount.address)
        await deployedERC721Contract.connect(otherAccount).transferFrom(otherAccount.address,signer.address,tokenId)
        let newOwner = await deployedERC721Contract.ownerOfToken(tokenId)
        expect(newOwner).to.equal(signer.address)
    });

    it("Transfers are not allowed if sender is not the owner or approved when use transferFrom function", async function(){
        await deployedERC721Contract.connect(otherAccount).mintNewToken()
        let tokenId = await deployedERC721Contract.tokenIdCounter()
        let currentOwner = await deployedERC721Contract.ownerOfToken(tokenId)
        expect(currentOwner).to.equal(otherAccount.address)
        await expect(deployedERC721Contract.connect(signer).transferFrom(otherAccount.address,signer.address,tokenId)).to.be.revertedWith("ERC721: caller is not token owner or approved")
        await deployedERC721Contract.connect(otherAccount).approve(signer.address,tokenId)
        let approvedAddress = await deployedERC721Contract.getApproved(tokenId)
        expect(approvedAddress).to.equal(signer.address)
        await deployedERC721Contract.connect(signer).transferFrom(otherAccount.address,signer.address,tokenId)
        let newOwner = await deployedERC721Contract.ownerOfToken(tokenId)
        expect(newOwner).to.equal(signer.address)
    });

});