// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMyCoin is IERC20{

    function getBalance(address _account) external view returns(uint256);

    function doTransfer(address _to, uint256 _value) external returns(bool);

    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

}