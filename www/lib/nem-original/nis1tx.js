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