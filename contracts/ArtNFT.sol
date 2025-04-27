// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArtNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => uint256) public prices;
    mapping(address => uint256) public earnings;
    mapping(uint256 => bool) public purchased; // Track if the NFT has been purchased

    constructor() ERC721("ArtNFT", "ART") Ownable(msg.sender) {}

    event ArtMinted(address indexed creator, uint256 tokenId, string tokenURI);
    event ArtSold(address indexed buyer, uint256 tokenId, uint256 price);

    // Mint the NFT and list it for sale immediately
    function mintAndListForSale(string memory tokenUri, uint256 price) external returns (uint256) {
        uint256 tokenId = nextTokenId;
        
        // Mint the NFT
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenUri);
        nextTokenId++;

        // List the NFT for sale
        prices[tokenId] = price;
        
        // Emit events
        emit ArtMinted(msg.sender, tokenId, tokenUri);

        return tokenId;
    }

    // Function to list the NFT for sale (this is optional now as it's handled by mintAndListForSale)
    function listForSale(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not your token");
        prices[tokenId] = price;
    }

    // Buy the NFT from the owner
    function buy(uint256 tokenId) external payable {
        uint256 price = prices[tokenId];
        address seller = ownerOf(tokenId);
        
        require(price > 0, "Not for sale");
        require(msg.value >= price, "Insufficient ETH");

        // Transfer the NFT to the buyer
        _transfer(seller, msg.sender, tokenId);

        // Mark the price as zero (no longer for sale)
        prices[tokenId] = 0;

        // Mark the artwork as purchased
        purchased[tokenId] = true;

        // Transfer the earnings to the seller
        earnings[seller] += msg.value;

        // Emit the ArtSold event
        emit ArtSold(msg.sender, tokenId, price);
    }

    // Withdraw earnings from sales
    function withdraw() external {
        uint256 amount = earnings[msg.sender];
        require(amount > 0, "No earnings");
        earnings[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    // Get total supply of minted NFTs
    function totalSupply() external view returns (uint256) {
        return nextTokenId;
    }
}
