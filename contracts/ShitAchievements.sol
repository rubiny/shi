// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SHIT Achievement NFTs
 * @notice Soulbound NFTs for SHIT.ARMY achievements
 * @dev Non-transferable (soulbound) — achievements can't be traded
 */
contract ShitAchievements is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Achievement type => metadata URI
    mapping(string => string) public achievementURIs;

    // Prevent duplicate mints: user => achievement => bool
    mapping(address => mapping(string => bool)) public hasMinted;

    event AchievementMinted(address indexed user, uint256 tokenId, string achievement);

    constructor() ERC721("SHIT Achievement", "SHITACH") Ownable(msg.sender) {}

    /// @notice Mint a soulbound achievement NFT
    /// @dev Only callable by owner (platform backend)
    function mintAchievement(address to, string calldata achievement) external onlyOwner {
        require(!hasMinted[to][achievement], "Already earned");
        require(bytes(achievementURIs[achievement]).length > 0, "Unknown achievement");

        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, achievementURIs[achievement]);
        hasMinted[to][achievement] = true;

        emit AchievementMinted(to, tokenId, achievement);
    }

    /// @notice Register a new achievement type
    function setAchievementURI(string calldata achievement, string calldata uri) external onlyOwner {
        achievementURIs[achievement] = uri;
    }

    /// @notice Soulbound — prevent transfers
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // Allow minting (from == address(0)) but block transfers
        require(from == address(0), "Soulbound: non-transferable");
        return super._update(to, tokenId, auth);
    }

    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
