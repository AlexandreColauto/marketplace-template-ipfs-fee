//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC1155, Ownable {
    uint256 public fee;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address creator;

    constructor(
        address marketAddress,
        uint256 _fee,
        address _owner
    ) ERC1155("https://ipfs.io/ipfs/f01701220{id}") {
        setApprovalForAll(marketAddress, true);
        fee = _fee;
        creator = _owner;
    }

    function mint(address reciever, uint256 id) public onlyOwner {
        _tokenIds.increment();
        _mint(reciever, id, 1, "");
    }

    function burn(uint256 id) public onlyOwner {
        _burn(msg.sender, id, 1);
    }

    function currentId() public view returns (uint256) {
        return _tokenIds.current();
    }

    function getFee() public view returns (uint256) {
        return fee;
    }

    function getCreator() public view returns (address) {
        return creator;
    }

    function uint2hexstr(uint256 i) public pure returns (string memory) {
        if (i == 0) return "0";
        uint256 j = i;
        uint256 length;
        while (j != 0) {
            length++;
            j = j >> 4;
        }
        uint256 mask = 15;
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (i != 0) {
            uint256 curr = (i & mask);
            bstr[--k] = curr > 9
                ? bytes1(uint8(55 + curr))
                : bytes1(uint8(48 + curr)); // 55 = 65 - 10
            i = i >> 4;
        }
        return string(bstr);
    }

    function uri(uint256 _tokenID)
        public
        view
        override
        returns (string memory)
    {
        string memory hexstringtokenID;
        hexstringtokenID = uint2hexstr(_tokenID);

        return
            string(
                abi.encodePacked(
                    "https://ipfs.io/ipfs/f01701220",
                    hexstringtokenID
                )
            );
    }
}
