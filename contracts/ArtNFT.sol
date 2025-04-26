// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArtNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => uint256) public prices;
    mapping(address => uint256) public earnings;

    constructor() ERC721("ArtNFT", "ART") Ownable(msg.sender) {}

    event ArtMinted(address indexed creator, uint256 tokenId, string tokenURI);
    event ArtSold(address indexed buyer, uint256 tokenId, uint256 price);

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
        prices[tokenId] = price;
    }

    function buy(uint256 tokenId) external payable {
        uint256 price = prices[tokenId];
        address seller = ownerOf(tokenId);
        require(price > 0, "Not for sale");
        require(msg.value >= price, "Insufficient ETH");

        _transfer(seller, msg.sender, tokenId);
        prices[tokenId] = 0;
        earnings[seller] += msg.value;

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
