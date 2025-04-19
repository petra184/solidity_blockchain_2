// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArtNFT is ERC721, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => uint256) public prices;
    mapping(address => uint256) public earnings;

    constructor() ERC721("ArtNFT", "ART") Ownable(msg.sender) {}

    event ArtMinted(address indexed creator, uint256 tokenId);
    event ArtSold(address indexed buyer, uint256 tokenId, uint256 price);

    function mint() external returns (uint256) {
        uint256 tokenId = nextTokenId;
        _mint(msg.sender, tokenId);
        nextTokenId++;
        emit ArtMinted(msg.sender, tokenId);
        return tokenId;
    }

    function listForSale(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not your art");
        prices[tokenId] = price;
    }

    function buy(uint256 tokenId) external payable {
        uint256 price = prices[tokenId];
        address seller = ownerOf(tokenId);
        require(price > 0, "Not for sale");
        require(msg.value >= price, "Not enough ETH");

        _transfer(seller, msg.sender, tokenId);
        earnings[seller] += msg.value;
        prices[tokenId] = 0;

        emit ArtSold(msg.sender, tokenId, price);
    }

    function withdraw() external {
        uint256 amount = earnings[msg.sender];
        require(amount > 0, "No earnings");
        earnings[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    // Add the totalSupply function here
    function totalSupply() external view returns (uint256) {
        return nextTokenId;
    }
    
    mapping(uint256 => string) private _tokenURIs;

    function setTokenURI(uint256 tokenId, string memory uri) external {
        require(ownerOf(tokenId) == msg.sender, "Not your art");
        _tokenURIs[tokenId] = uri;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }
}
