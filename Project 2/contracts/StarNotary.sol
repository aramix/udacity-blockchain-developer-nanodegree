// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {
    /// @custom:security-contact aram.bv@gmail.com
    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {}

    struct Star {
        string name;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    function createStar(string memory _name, uint256 _tokenId) public {
        Star memory newStar = Star(_name);

        tokenIdToStarInfo[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price)
        public
        onlyOwner(_tokenId)
    {
        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable onlyIfOnSale(_tokenId) {
        uint256 starCost = starsForSale[_tokenId];
        address starOwner = ownerOf(_tokenId);
        require(msg.value > starCost);
        _transfer(starOwner, msg.sender, _tokenId);
        payable(starOwner).transfer(starCost);

        if (msg.value > starCost) {
            payable(msg.sender).transfer(msg.value - starCost);
        }
    }

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo(uint256 _tokenId)
        public
        view
        returns (string memory)
    {
        return tokenIdToStarInfo[_tokenId].name;
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        //1. Passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
        //2. You don't have to check for the price of the token (star)
        //3. Get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId1)
        //4. Use _transferFrom function to exchange the tokens.
        address tokenId1_owner = ownerOf(_tokenId1);
        address tokenId2_owner = ownerOf(_tokenId2);

        // Unclear what is exactly needed to be done starting from here
        require(
            tokenId1_owner == msg.sender || tokenId2_owner == msg.sender,
            "You can exchange only the stars you own"
        );

        _transfer(tokenId1_owner, tokenId2_owner, _tokenId1);
        _transfer(tokenId2_owner, tokenId1_owner, _tokenId2);
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
        //1. Check if the sender is the ownerOf(_tokenId)
        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        address tokenId_owner = ownerOf(_tokenId);
        require(
            tokenId_owner == msg.sender,
            "You can exchange only the stars you own"
        );

        safeTransferFrom(msg.sender, _to1, _tokenId);
    }

    modifier onlyOwner(uint256 _tokenId) {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You can't put the Star on sale you don't own"
        );
        _;
    }

    modifier onlyIfOnSale(uint256 _tokenId) {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        _;
    }
}
