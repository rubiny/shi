// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SHIT Token
 * @notice ERC20 token for the SHIT.ARMY platform on Base
 * @dev Mintable by owner (platform), burnable by holders
 */
contract ShitToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion max supply

    constructor() ERC20("SHIT", "$SHIT") Ownable(msg.sender) {
        // Mint initial supply to deployer (platform treasury)
        _mint(msg.sender, 100_000_000 * 10**18); // 100M initial supply
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
}
