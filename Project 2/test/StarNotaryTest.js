const StarNotary = artifacts.require('StarNotary');

contract('StarNotary', (accounts) => {
  beforeEach(async () => {
    contract = await StarNotary.new('TestNotary', 'TSN', { from: accounts[0] });
  });

  describe('can create a star', () => {
    it('can create a star and get its name', async () => {
      await contract.createStar('awesome star!', 1, { from: accounts[0] });

      assert.equal(await contract.tokenIdToStarInfo(1), 'awesome star!');
    });
  });

  describe('buying and selling stars', () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let randomMaliciousUser = accounts[3];

    let starId = 1;
    let starPrice = web3.utils.toWei('0.01');

    beforeEach(async () => {
      await contract.createStar('awesome star!', starId, { from: user1 });
    });

    it('user1 can put up their star for sale', async () => {
      assert.equal(await contract.ownerOf(starId), user1);
      await contract.putStarUpForSale(starId, starPrice, { from: user1 });

      assert.equal(await contract.starsForSale(starId), starPrice);
    });

    describe('user2 can buy a star that was put up for sale', () => {
      beforeEach(async () => {
        await contract.putStarUpForSale(starId, starPrice, { from: user1 });
      });

      it('user2 is the owner of the star after they buy it', async () => {
        await contract.buyStar(starId, { from: user2, value: web3.utils.toWei('0.010001'), gasPrice: 0 });
        assert.equal(await contract.ownerOf(starId), user2);
      });

      it('user2 ether balance changed correctly', async () => {
        let overpaidAmount = web3.utils.toWei('0.05');
        const balanceBeforeTransaction = await web3.eth.getBalance(user2);
        await contract.buyStar(starId, { from: user2, value: overpaidAmount, gasPrice: 0 });
        const balanceAfterTransaction = await web3.eth.getBalance(user2);
        const finalBalance = balanceBeforeTransaction - balanceAfterTransaction;
        assert.equal(finalBalance, starPrice);
      });
    });
  });

  describe('can create StarNotary contract', () => {
    it('can add the star name and star symbol properly', async () => {
      const _name = 'TestNotary';
      const _symbol = 'TSN';
      const instance = await StarNotary.new(_name, _symbol);
      const name = await instance.name();
      const symbol = await instance.symbol();
      assert.equal(_name, name, 'Token name is incorrect');
      assert.equal(_symbol, symbol, 'Token symbol is incorrect');
    });
  });

  describe('lets users exchange and transfer stars they own', () => {
    it('lets 2 users exchange stars', async () => {
      const user1 = accounts[1];
      const user2 = accounts[2];
      const starId1 = 1;
      const starId2 = 2;
      await contract.createStar('User1Star', starId1, { from: user1 });
      await contract.createStar('User2Star', starId2, { from: user2 });
      // console.log('before exchange');
      // console.log('owner of star1', await contract.ownerOf(starId1));
      // console.log('owner of star2', await contract.ownerOf(starId2));
      await contract.exchangeStars(starId1, starId2, { from: user1, gasPrice: 0 });
      // console.log('after exchange');
      // console.log('owner of star1', await contract.ownerOf(starId1));
      // console.log('owner of star2', await contract.ownerOf(starId2));
      assert.equal(await contract.ownerOf(starId1), user2, 'User1Star has not been transferred to user2');
      assert.equal(await contract.ownerOf(starId2), user1, 'User2Star has not been transferred to user1');
    });

    it('lets a user transfer a star', async () => {
      const user1 = accounts[1];
      const user2 = accounts[2];
      const starId = 3;
      await contract.createStar('User3Star', starId, { from: user1 });
      await contract.transferStar(user2, starId, { from: user1, gasPrice: 0 });
      assert.equal(await contract.ownerOf(starId), user2, 'User3Star has not been transferred to user2');
    });
  });
});
