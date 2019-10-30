//Load nem-sdk
var nem = require("nem-sdk").default;

//Onsen UI is ready
ons.ready(function () {
  console.log("Onsen UI is ready!");
});

//HTML Escape
function htmlEscape(s) {
  s = s.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
  return s;
}

//Get address from privateKey
function getAddressFromPrivateKey(privateKeyRaw) {
  if (privateKeyRaw) {
    var keyPair = nem.crypto.keyPair.create(htmlEscape(privateKeyRaw).trim());
    var publicKey = keyPair.publicKey.toString();
    var address = nem.model.address.toAddress(publicKey, nem.model.network.data.mainnet.id);
    var isValid = nem.model.address.isValid(address);
    if (isValid) {
      return address;
    } else {
      ons.notification.toast("エラー：アドレスが異常です！適切な秘密鍵を設定タブから登録してください。", {
        timeout: 1000,
        animation: 'fall'
      });
      return "";
    }
  } else {
    ons.notification.toast("エラー：アドレスが異常です！適切な秘密鍵を設定タブから登録してください。", {
      timeout: 1000,
      animation: 'fall'
    });
    return ""
  }
}

//Validate privateKey
function isValidPrivateKey(privateKeyRaw) {
  if (privateKeyRaw) {
    var address = getAddressFromPrivateKey(htmlEscape(privateKeyRaw).trim());
    var isValid = nem.model.address.isValid(address);
    return isValid ? true : false;
  } else {
    return false;
  }
}

//Get privateKey strings
function getPrivateKey(privateKeyRaw) {
  return isValidPrivateKey(privateKeyRaw) ? htmlEscape(privateKeyRaw).trim() : "";
}

//Validate address
function isValidAddress(addressRaw) {
  if (addressRaw) {
    var isValid = nem.model.address.isValid(htmlEscape(addressRaw));
    return isValid ? true : false;
  } else {
    ons.notification.toast("エラー：アドレスが異常です！適切なアドレスを設定してください。", {
      timeout: 1000,
      animation: 'fall'
    });
    return false;
  }
}

//Validate address and if OK get address strings
function getAddress(privateKey) {
  if (privateKey) {
    var keyPair = nem.crypto.keyPair.create(htmlEscape(privateKey));
    var publicKey = keyPair.publicKey.toString();
    var address = nem.model.address.toAddress(publicKey, nem.model.network.data.mainnet.id);
    var isValid = nem.model.address.isValid(address);
    if (isValid) {
      return address;
    } else {
      ons.notification.toast("エラー：アドレスが異常です！適切な秘密鍵を設定タブから登録してください。", {
        timeout: 1000,
        animation: 'fall'
      });
      return "";
    }
  } else {
    ons.notification.toast("秘密鍵が未登録です！設定タブから登録してご利用ください。", {
      timeout: 1000,
      animation: 'fall'
    });
    return "";
  }
}

//Set QR address
function setQrAddress() {
  const url = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="' + getAddress(localStorage.privateKey) + '"';
  document.getElementById("qrAddress").setAttribute("src", url);
}

document.addEventListener('show', function (event) {
  var page = event.target;
  var titleElement = document.querySelector('#toolbar-title');

  if (page.matches('#home-page')) {
    titleElement.innerHTML = 'ホーム';
    document.getElementById("address").innerText = getAddress(localStorage.privateKey);
    setQrAddress();
  } else if (page.matches('#send-page')) {
    titleElement.innerHTML = '送付';
  } else if (page.matches('#receive-page')) {
    titleElement.innerHTML = '受取';
  } else if (page.matches('#history-page')) {
    titleElement.innerHTML = '履歴';
  } else if (page.matches('#settings-page')) {
    titleElement.innerHTML = '設定';
    document.getElementById("privateKeySet").value = getPrivateKey(localStorage.privateKey);
    document.getElementById("addressChecked").innerText = getAddress(localStorage.privateKey);
  }
});

if (ons.platform.isIPhoneX()) {
  document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
  document.documentElement.setAttribute('onsflag-iphonex-landscape', '');
}

//Set private key
function setPrivateKey() {
  const privateKey = htmlEscape(document.getElementById("privateKeySet").value);
  const address = getAddress(privateKey);
  if (address !== null) {
    document.getElementById("addressChecked").value = address;
    localStorage.setItem("privateKey", privateKey);
    document.getElementById("privateKeySet").value = "";
    ons.notification.toast("秘密鍵を登録しました。", {
      timeout: 1000,
      animation: 'fall'
    })
  } else {
    //
  }
}

//Delete private key
function deletePrivateKey() {
  localStorage.removeItem("privateKey");
  ons.notification.toast("秘密鍵を削除しました。", {
    timeout: 1000,
    animation: 'fall'
  });
}

//Set exchange info
function setExchangeInfo() {
  const apiKey = htmlEscape(document.getElementById("apiKeySet").value);
  const apiSecret = htmlEscape(document.getElementById("apiSecretSet").value);
  const depositAddress = htmlEscape(document.getElementById("depositAddress").value);
  const depositMessage = htmlEscape(document.getElementById("depositMessage").value);
  //Todo: Set info must be validated here
  localStorage.setItem("apiKey", apiKey);
  localStorage.setItem("apiSecret", apiSecret);
  localStorage.setItem("depositAddress", depositAddress);
  localStorage.setItem("depositMessage", depositMessage);
  ons.notification.toast("取引所連携情報を登録しました。", {
    timeout: 1000,
    animation: 'fall'
  })
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
    animation: 'fall'
  });
}

//Transfer Tx
function transferTx() {
  const recipientAddress = htmlEscape(document.getElementById("recipientAddress").value).replace(/-/g, "").trim();
  const amount = htmlEscape(document.getElementById("sendAmount").value);
  const message = htmlEscape(document.getElementById("sendMessage").value);
  var transferTx = nem.model.objects.create("transferTransaction")(recipientAddress, amount, message);
  var common = nem.model.objects.create("common")("", localStorage.privateKey);
  var transactionEntity = nem.model.transactions.prepare("transferTransaction")(common, transferTx, nem.model.network.data.mainnet.id);
  var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultMainnet, nem.model.nodes.defaultPort);
  nem.model.transactions.send(common, transactionEntity, endpoint).then(
    function (res) {
      if (htmlEscape(res.message) === "SUCCESS") {
        var transactionResult = "送付に成功しました。";
        var transactionHashResult = htmlEscape(res.transactionHash.data);
        var alertMessage = transactionResult + "\nトランザクションのハッシュは\n" + transactionHashResult + "\nです。";
        document.getElementById("recipientAddress").value = "";
        document.getElementById("sendAmount").value = "";
        document.getElementById("sendMessage").value = "";
      } else {
        var transactionResult = "エラー：送付に失敗しました！";
        var alertMessage = transactionResult;
      }
      ons.notification.toast(alertMessage, {
        timeout: 1000,
        animation: 'fall'
      });
    }
  );
}