//This file doesn't work well and is not used yet
(async () => {
  const getNodeList = async () => {
    const proxy = "https://cors-anywhere.herokuapp.com/";
    const endpoint = "https://s3-ap-northeast-1.amazonaws.com/xembook.net/data/v4/node.json";
    const url = proxy + endpoint;
    const abortController = new AbortController();
    setTimeout(() => abortController.abort(), 10000);
    const nodeList = await fetch(url, {
        signal: abortController.signal
      })
      .then((res) => {
        return res.json();
      }).then((json) => {
        return json;
      }).catch((error) => {
        console.log(error);
        return {};
      });
    return nodeList;
  }
  const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  }
  var nem = require("nem-sdk");
  window.NemSdkHelper = {
    Node: {
      list: await getNodeList(),
      https: nodeList.https,
      httpsRandomNode: new URL(getRandomElement(this.https)),
      httpsRandomNodeUrl: httpsRandomNode.href
    },
    Tx: (recipientAddress, amount, message) => {
      this.recipientAddress = recipientAddress;
      this.amount = amount;
      this.message = message;
      const invoiceTemplate = {
        "data": {
          "addr": "",
          "amount": 0,
          "msg": "",
          "name": "NEM1-SIMPLE-MOBILE-WALLET"
        },
        "type": 2,
        "v": 2
      }
      invoiceTemplate.data.addr = this.recipientAddress;
      invoiceTemplate.data.amount = Math.round(this.amount * 1000000);
      invoiceTemplate.data.message = this.message;
      this.invoiceObject = invoiceTemplate;
      this.invoiceString = JSON.stringify(this.invoiceObject);
      this.result = undefined;
      this.hash = undefined;
      this.senderPublicKey = undefined;
      this.senderAddress = undefined;
      this.send = async (privateKey) => {
        //
      };
      this.receive = async () => {
        //
      }
    }
  };
  NemSdkHelper.getHttpsRandomNodeUrl = async () => {
    const nodeList = await getNodeList;
    const httpsRandomNode = new URL(getRandomElement(nodeList.https));
    const httpsRandomNodeUrl = httpsRandomNode.href;
    return httpsRandomNodeUrl;
  };
  window.NIS1Node = class {
    constructor() {
      this.all = {};
      this.http = [];
      this.https = [];
      this.apostille = [];
      this.httpRandomNode = "";
      this.httpsRandomNode = "";
      this.apostilleRandomNode = "";
      this.httpRandomNodeUrl = "";
      this.httpsRandomNodeUrl = "";
      this.apostilleRandomNodeUrl = "";
    }
    async getAllList() {
      try {
        this.all = await getNodeList();
        this.http = this.all.http;
        this.https = this.all.https;
        this.apostille = this.all.apostille;
        this.httpRandomNode = new URL("http://" + getRandomElement(this.http) + ":7890");
        this.httpRandomNodeUrl = this.httpRandomNode.href;
        this.httpsRandomNode = new URL(getRandomElement(this.https));
        this.httpsRandomNodeUrl = this.httpsRandomNode.href;
        this.apostilleRandomNode = new URL("http://" + getRandomElement(this.apostille) + ":7890");
        this.apostilleRandomNodeUrl = this.apostilleRandomNode.href;
      } catch (error) {
        console.log(error);
      }
    }
  }
})();
(async () => {
  var nem = require("nem-sdk").default;
  const nis1node = new NIS1Node();
  await nis1node.getAllList();
  const invoiceTemplate = {
    "data": {
      "addr": "",
      "amount": 0,
      "msg": "",
      "name": "NEM1-SIMPLE-MOBILE-WALLET"
    },
    "type": 2,
    "v": 2
  }
  window.XemTx = class {
    constructor(recipientAddress, amount, message) {
      this.recipientAddress = recipientAddress;
      this.amount = amount;
      this.message = message;
      this.nodeUrl = nis1node.httpsRandomNodeUrl.replace(/:7891\//g, "");
      this.endpoint = nem.model.objects.create("endpoint")(
        this.nodeUrl,
        7891
      );
      this.txObject = nem.model.object.create("transferTransaction")(
        this.recipientAddress,
        this.amount,
        this.message
      );
      invoiceTemplate.data.addr = this.recipientAddress;
      invoiceTemplate.data.amount = Math.round(this.amount * 1000000);
      invoiceTemplate.data.message = this.message;
      this.invoiceObject = invoiceTemplate;
      this.invoiceString = JSON.stringify(this.invoiceObject);
    }
    async send(privateKey) {
      const txCommon = nem.model.object.create("common")(
        "",
        privateKey
      );
      const txEntity = nem.model.transaction.prepare("transferTransaction")(
        txCommon,
        this.txObject,
        nem.model.network.data.mainnet.id
      );
      nem.model.transactions
        .send(txCommon, txEntity, this.endpoint)
        .then((res) => {
          console.log(res);
          return res;
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
    }
    async receive() {
      //
    }
    async monitor(txHash) {
      //
    }
  }
})();