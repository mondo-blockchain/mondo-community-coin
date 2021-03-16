// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./token/ERC20/ERC20.sol";
import "./math/SafeMath.sol";
import "./utils/Arrays.sol";
import "./access/Ownable.sol";
import "./ERC20Vested.sol";
import "hardhat/console.sol";

contract ERC20VestedView is ERC20 {
    ERC20Vested private _vestingContract;

    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        ERC20Vested vestingContract
    ) payable ERC20(name, symbol) {
        _vestingContract = vestingContract;
        _mint(_msgSender(), totalSupply);
    }

    function balanceOf(address account)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _vestingContract.totalBalanceOf(account);
    }

    function transfer(address recipient, uint256 amount)
        public
        pure
        override
        returns (bool)
    {
        revert();
    }

    function allowance(address owner, address spender)
        public
        pure
        override
        returns (uint256)
    {
        return 0;
    }

    function approve(address spender, uint256 amount)
        public
        pure
        override
        returns (bool)
    {
        revert();
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public pure override returns (bool) {
        revert();
    }
}
