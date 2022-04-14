const { expect } = require("chai");
const { ethers } = require("hardhat");
require("@nomiclabs/hardhat-waffle");
let nft;
let market;
let token_id;
describe("NFT", function () {
  beforeEach(async () => {
    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy(
      "0x96858Ea614c48Ff07caB52b7d2879676e6AD87cF",
      "8500",
      "0xbC2B75994438A7426De54BEf4Ff4f7991Bf2a656"
    );
    await nft.deployed();
    const metadata = {
      name: "test",
      description: "test",
      imgUrl:
        "https://ipfs.io/ipfs/QmWvz9BtsNuDUcmCCEHKaGT4cWZiYp9hifyK89yXFh2HRk?filename=7cjb0kh9qiz31.gif",
    };
    token_id =
      "0x6123c37b7f883d6c5f6e8605be731746c1885f5b5511306073e63a33b9a98140";
  });

  it("Should deploy the contract and return the address", async function () {
    expect(nft.address).to.be.ok;
  });
  it("Should be able to mint one token", async () => {
    const owner = await ethers.getSigners();
    await nft.mint(owner[0].address, token_id);
    expect(await nft.balanceOf(owner[0].address, token_id)).to.equal(
      1,
      "invalid final balance"
    );
  });
  it("Should be able to burn one token", async () => {
    const owner = await ethers.getSigners();
    await nft.mint(owner[0].address, token_id);
    expect(await nft.balanceOf(owner[0].address, token_id)).to.equal(
      1,
      "invalid final balance"
    );

    nft.burn(token_id);
    expect(await nft.balanceOf(owner[0].address, token_id)).to.equal(
      0,
      "Burn method failed"
    );
  });
});

describe("NFTMarket", function () {
  beforeEach(async () => {
    const owner = await ethers.getSigners();
    const NFTMarket = await ethers.getContractFactory("NFTMarket");
    market = await NFTMarket.deploy();
    await market.deployed();

    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy(
      market.address,
      "85",
      "0xbC2B75994438A7426De54BEf4Ff4f7991Bf2a656"
    );
    await nft.deployed();
    token_id =
      "0x6123c37b7f883d6c5f6e8605be731746c1885f5b5511306073e63a33b9a98140";
  });

  it("Should deploy the contract and return the address", async function () {
    expect(market.address).to.be.ok;
  });
  it("Should Be able to list my nft", async function () {
    const owner = await ethers.getSigners();
    await nft.mint(owner[0].address, token_id);
    await nft.setApprovalForAll(market.address, true);
    await market.ListNFT(nft.address, nft.address, token_id, 10);
  });

  it("Should Be able to fetch all nfts", async function () {
    const owner = await ethers.getSigners();
    await nft.mint(owner[0].address, token_id);
    nft.setApprovalForAll(market.address, true);
    market.ListNFT(nft.address, nft.address, token_id, 10);
    const collection = await market.fetchAllCollection();

    expect(collection.length).to.equal(1, "not all the items were fetched");
  });

  it("Should Be able to Buy one nft", async function () {
    const owner = await ethers.getSigners();
    await nft.mint(owner[0].address, token_id);
    nft.setApprovalForAll(market.address, true);
    market.ListNFT(
      nft.address,
      nft.address,
      token_id,
      ethers.utils.parseEther("10")
    );
    const marketUser = market.connect(owner[1]);
    await marketUser.performATransaction(1, {
      value: ethers.utils.parseEther("10"),
    });
    collection = await market.fetchAllCollection();
  });
  it("Should have the fee on the wallet", async function () {
    const owner = await ethers.getSigners();
    const _balance = await owner[5].getBalance();
    await nft.mint(owner[0].address, token_id);
    nft.setApprovalForAll(market.address, true);
    market.ListNFT(
      nft.address,
      nft.address,
      token_id,
      ethers.utils.parseEther("100")
    );
    const marketUser = market.connect(owner[1]);
    await marketUser.performATransaction(1, {
      value: ethers.utils.parseEther("100"),
    });
    collection = await market.fetchAllCollection();

    const balance = await owner[5].getBalance();
    const result = balance - _balance;
    const ether = ethers.utils.formatUnits(result.toString(), "ether");

    const uri = await nft.uri(token_id);

    console.log(uri);
  });
});
