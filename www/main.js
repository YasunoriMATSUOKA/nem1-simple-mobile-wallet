//Load nem-sdk
var nem = require("nem-sdk").default;

//proxyUrl
const proxyUrl = "https://cors-anywhere.herokuapp.com/";

//Onsen UI is ready
ons.ready(function () {
  console.log("Onsen UI is ready!");
});

//HTML Escape
function htmlEscape(s) {
  s = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
  return s;
}

//Get address from privateKey
function getAddressFromPrivateKey(privateKeyRaw) {
  if (privateKeyRaw !== undefined) {
    var keyPair = nem.crypto.keyPair.create(htmlEscape(privateKeyRaw).trim());
    var publicKey = keyPair.publicKey.toString();
    var address = nem.model.address.toAddress(
      publicKey,
      nem.model.network.data.mainnet.id
    );
    var isValid = nem.model.address.isValid(address);
    if (isValid) {
      return address;
    } else {
      ons.notification.toast(
        "エラー：アドレスが異常です！適切な秘密鍵を設定タブから登録してください。", {
          timeout: 1000,
          animation: "fall"
        }
      );
      return "";
    }
  } else {
    ons.notification.toast(
      "秘密鍵がまだ登録されていないようです。秘密鍵を設定タブから登録してください。", {
        timeout: 1000,
        animation: "fall"
      }
    );
    return "";
  }
}

//Validate privateKey
function isValidPrivateKey(privateKeyRaw) {
  if (privateKeyRaw !== undefined) {
    var address = getAddressFromPrivateKey(htmlEscape(privateKeyRaw).trim());
    var isValid = nem.model.address.isValid(address);
    return isValid ? true : false;
  } else {
    return false;
  }
}

//Get privateKey
function getPrivateKey(privateKeyRaw) {
  if (privateKeyRaw !== undefined) {
    return isValidPrivateKey(privateKeyRaw) ?
      htmlEscape(privateKeyRaw).trim() :
      "";
  }
}

//Validate address
function isValidAddress(addressRaw) {
  if (addressRaw !== undefined) {
    var isValid = nem.model.address.isValid(htmlEscape(addressRaw));
    return isValid ? true : false;
  } else {
    ons.notification.toast(
      "エラー：アドレスが異常です！適切なアドレスを設定してください。", {
        timeout: 1000,
        animation: "fall"
      }
    );
    return false;
  }
}

//Get address
function getAddress(AddressRaw) {
  if (isValidAddress(AddressRaw)) {
    return htmlEscape(AddressRaw).trim();
  } else {
    ons.notification.toast(
      "秘密鍵が未登録です！設定タブから登録してご利用ください。", {
        timeout: 1000,
        animation: "fall"
      }
    );
    return "";
  }
}

//Set QR Address
function setQrAddress(address) {
  if (isValidAddress(address)) {
    $(function () {
      $("#qrAddress").qrcode({
        width: 150,
        height: 150,
        text: htmlEscape(address)
      });
    });
  }
}

//Get random https node url
async function getRandomHttpsNodeUrl() {
  const nis1node = new NIS1Node();
  await nis1node.getAllList();
  const httpsRandomNodeUrl = nis1node.httpsRandomNodeUrl;
  return httpsRandomNodeUrl;
}

//Get XEM balance
async function getXemBalance(address) {
  if (isValidAddress(getAddress(address))) {
    const endpointUrl = await getRandomHttpsNodeUrl() + "/account/get?address=" + getAddress(address);
    const url = proxyUrl + endpointUrl;
    var abortController = new AbortController();
    setTimeout(() => abortController.abort(), 10000);
    try {
      const res = await fetch(url, {
        signal: abortController.signal
      });
      const json = await res.json();
      const balance = json.account.balance / 1000000;
      return balance;
    } catch {
      error => {
        console.error(error);
        ons.notification.toast(error, {
          timeout: 1000,
          animation: "fall"
        });
      }
    }
  }
}

//Get last price
async function getLastPrice() {
  document.getElementById("lastPrice").innerHTML =
    '<ons-icon icon="fa-spinner"></ons-icon>';
  const endpointUrl = "https://api.zaif.jp/api/1/last_price/xem_jpy";
  const url = proxyUrl + endpointUrl;
  var abortController = new AbortController();
  setTimeout(() => abortController.abort(), 10000);
  await fetch(url, {
      signal: abortController.signal
    })
    .then(res => res.json())
    .then(res => {
      document.getElementById("lastPrice").innerText = res.last_price;
    })
    .catch(error => {
      ons.notification.toast(error);
      document.getElementById("lastPrice").innerText = 0;
    });
}

//Calculate Amount Todo: This function is not completed yet
function calculateAmount() {
  const address = getAddressFromPrivateKey(localStorage.privateKey);
  const invoiceCurrency = document.getElementById("invoiceCurrency").value;
  const lastPrice = document.getElementById("lastPrice").value;
  if (invoiceCurrency === "XEM") {
    const invoiceAmount = document.getElementById("invoiceAmount").value;
    const amount = Math.floor(invoiceAmount * 1000000);
    document.getElementById("calculatedCurrency").value = "JPY";
  } else if (invoiceCurrency === "JPY") {
    //
  } else {
    ons.notification.alert("エラー：通貨が特定できません！");
  }
}

document.addEventListener("show", async function (event) {
  var page = event.target;
  var titleElement = document.querySelector("#toolbar-title");

  if (page.matches("#home-page")) {
    titleElement.innerHTML = "ホーム";
    document.getElementById("address").innerText = getAddressFromPrivateKey(
      localStorage.privateKey
    );
    document.getElementById("qrAddress").innerText = "";
    setQrAddress(getAddressFromPrivateKey(localStorage.privateKey));
    document.getElementById("balance").textContent = await getXemBalance(getAddressFromPrivateKey(localStorage.privateKey));
  } else if (page.matches("#send-page")) {
    titleElement.innerHTML = "送付";
  } else if (page.matches("#receive-page")) {
    titleElement.innerHTML = "受取";
    getLastPrice();
  } else if (page.matches("#history-page")) {
    titleElement.innerHTML = "履歴";
  } else if (page.matches("#settings-page")) {
    titleElement.innerHTML = "設定";
    document.getElementById("privateKeySet").value = getPrivateKey(
      localStorage.privateKey
    );
    document.getElementById(
      "addressChecked"
    ).innerText = getAddressFromPrivateKey(localStorage.privateKey);
  }
});

if (ons.platform.isIPhoneX()) {
  document.documentElement.setAttribute("onsflag-iphonex-portrait", "");
  document.documentElement.setAttribute("onsflag-iphonex-landscape", "");
}

//Set private key
function setPrivateKey() {
  const privateKey = htmlEscape(document.getElementById("privateKeySet").value);
  const address = getAddressFromPrivateKey(privateKey);
  if (address !== "") {
    document.getElementById("addressChecked").innerText = address;
    localStorage.setItem("privateKey", privateKey);
    ons.notification.toast("秘密鍵を登録しました。", {
      timeout: 1000,
      animation: "fall"
    });
  }
}

//Delete private key
function deletePrivateKey() {
  localStorage.removeItem("privateKey");
  document.getElementById("privateKeySet").value = "";
  document.getElementById("addressChecked").innerText = "";
  ons.notification.toast("秘密鍵を削除しました。", {
    timeout: 1000,
    animation: "fall"
  });
}

//Set exchange info
function setExchangeInfo() {
  const apiKey = htmlEscape(document.getElementById("apiKeySet").value);
  const apiSecret = htmlEscape(document.getElementById("apiSecretSet").value);
  const depositAddress = htmlEscape(
    document.getElementById("depositAddress").value
  );
  const depositMessage = htmlEscape(
    document.getElementById("depositMessage").value
  );
  //Todo: Set info must be validated here
  localStorage.setItem("apiKey", apiKey);
  localStorage.setItem("apiSecret", apiSecret);
  localStorage.setItem("depositAddress", depositAddress);
  localStorage.setItem("depositMessage", depositMessage);
  ons.notification.toast("取引所連携情報を登録しました。", {
    timeout: 1000,
    animation: "fall"
  });
  document.getElementById("apiKeySet").value = "";
  document.getElementById("apiSecret").value = "";
  document.getElementById("depositAddress").value = "";
  document.getElementById("depositMessage").value = "";
}

//delete exchange info
function deleteExchangeInfo() {
  localStorage.removeItem("apiKey");
  localStorage.removeItem("apiSecret");
  localStorage.removeItem("depositAddress");
  localStorage.removeItem("depositMessage");
  ons.notification.toast("取引所連携情報を削除しました。", {
    timeout: 1000,
    animation: "fall"
  });
}

//Transfer Tx
function transferTx() {
  const recipientAddress = getAddress(
    htmlEscape(document.getElementById("recipientAddress").value)
    .replace(/-/g, "")
    .trim()
  );
  const amount = htmlEscape(document.getElementById("sendAmount").value);
  const message = htmlEscape(document.getElementById("sendMessage").value);
  var transferTx = nem.model.objects.create("transferTransaction")(
    recipientAddress,
    amount,
    message
  );
  var common = nem.model.objects.create("common")("", localStorage.privateKey);
  var transactionEntity = nem.model.transactions.prepare("transferTransaction")(
    common,
    transferTx,
    nem.model.network.data.mainnet.id
  );
  var endpoint = nem.model.objects.create("endpoint")(
    nem.model.nodes.defaultMainnet,
    nem.model.nodes.defaultPort
  );
  console.log(endpoint);
  nem.model.transactions
    .send(common, transactionEntity, endpoint)
    .then(function (res) {
      if (htmlEscape(res.message) === "SUCCESS") {
        var transactionResult = "送付に成功しました。";
        var transactionHashResult = htmlEscape(res.transactionHash.data);
        var alertMessage =
          transactionResult +
          "\nトランザクションのハッシュは\n" +
          transactionHashResult +
          "\nです。";
        document.getElementById("recipientAddress").value = "";
        document.getElementById("sendAmount").value = "";
        document.getElementById("sendMessage").value = "";
      } else {
        var transactionResult = "エラー：送付に失敗しました！";
        var alertMessage = transactionResult;
      }
      ons.notification.toast(alertMessage, {
        timeout: 1000,
        animation: "fall"
      });
    });
}