// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArtNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => uint256) public prices;
    mapping(address => uint256) public earnings;
    mapping(uint256 => bool) public purchased;

    constructor() ERC721("ArtNFT", "ART") Ownable(msg.sender) {}

    event ArtMinted(address indexed creator, uint256 tokenId, string tokenURI);
    event ArtSold(address indexed buyer, uint256 tokenId, uint256 price);
    event ArtListed(address indexed seller, uint256 tokenId, uint256 price); 


    function mint(string memory tokenUri) external returns (uint256) {
        uint256 tokenId = nextTokenId;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenUri);
        nextTokenId++;
        emit ArtMinted(msg.sender, tokenId, tokenUri);
        return tokenId;
    }

    function listForSale(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not your token");
        require(!purchased[tokenId], "Token already sold");
        prices[tokenId] = price;
        emit ArtListed(msg.sender, tokenId, price);
    }

    function mintAndList(string memory tokenUri, uint256 price) external returns (uint256) {
        uint256 tokenId = nextTokenId;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenUri);
        nextTokenId++;
        if (price > 0) {
            prices[tokenId] = price;
            emit ArtListed(msg.sender, tokenId, price);
        }
        emit ArtMinted(msg.sender, tokenId, tokenUri);
        return tokenId;
    }

    function buy(uint256 tokenId) external payable {
        uint256 price = prices[tokenId];
        address seller = ownerOf(tokenId);
        
        require(price > 0, "Not for sale");
        require(msg.value >= price, "Insufficient ETH");
        
        _transfer(seller, msg.sender, tokenId);
        
        prices[tokenId] = 0;
        purchased[tokenId] = true;

        earnings[seller] += msg.value;

        // Emit the ArtSold event
        emit ArtSold(msg.sender, tokenId, price);
    }

    function withdraw() external {
        uint256 amount = earnings[msg.sender];
        require(amount > 0, "No earnings");
        earnings[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function totalSupply() external view returns (uint256) {
        return nextTokenId;
    }
}
