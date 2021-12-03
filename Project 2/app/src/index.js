import Web3 from 'web3';
import StarNotary from '../../build/contracts/StarNotary.json';

const App = {
  web3: null,
  account: null,
  star: null,

  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = StarNotary.networks[networkId];
      this.star = new web3.eth.Contract(StarNotary.abi, deployedNetwork && deployedNetwork.address);

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error('Could not connect to contract or chain.');
    }
  },

  setStatus: function (message) {
    const status = document.getElementById('status');
    status.innerHTML = message;
  },

  createStar: async function () {
    const { createStar } = this.star.methods;
    const name = document.getElementById('starName').value;
    const id = document.getElementById('starId').value;
    await createStar(name, id).send({ from: this.account });
    App.setStatus(`New Star Owner is ${this.account}.`);
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function () {
    const { lookUptokenIdToStarInfo } = this.star.methods;
    const id = document.getElementById('lookid').value;
    const name = await lookUptokenIdToStarInfo(id).call({ from: this.account });
    App.setStatus(`Star name with id ${id} is ${name}.`);
  },
};

window.App = App;

// Wait for loading completion to avoid race conditions with web3 injection timing.
window.addEventListener('load', async function () {
  // Modern dapp browsers...
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    try {
      // Request account access if needed
      await window.ethereum.enable();
      // Acccounts now exposed
      App.web3 = web3;
    } catch (error) {
      console.error(error);
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    // Use Mist/MetaMask's provider.
    const web3 = window.web3;
    console.log('Injected web3 detected.');
    App.web3 = web3;
  }
  // Fallback to localhost; use dev console port by default...
  else {
    const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
    const web3 = new Web3(provider);
    console.log('No web3 instance injected, using Local web3.');
    App.web3 = web3;
  }

  App.start();
});
