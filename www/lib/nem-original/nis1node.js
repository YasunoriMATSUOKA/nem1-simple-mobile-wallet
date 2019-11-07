(function () {
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