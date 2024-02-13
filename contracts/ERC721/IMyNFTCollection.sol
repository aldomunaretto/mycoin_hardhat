// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IMyNFTCollection is IERC721{

    function mintNewToken() external returns(uint256);

    function doTransfer(address _to, uint256 _tokenId) external;

    function ownerOfToken(uint256 _tokenId) external view returns(address);

    function transferFrom(address from, address to, uint256 tokenId) external;

    function approve(address to, uint256 tokenId) external;
}