const ethers = require("ethers");

function getTotalBoughtAmount(txs) {
  let totalSubscriptionAmount = 0;
  let lastSubscriptionTx = null;
  let lastSubscriptionIdx = 0;
  txs.forEach((tx) => {
    const { type, boughtTokens } = tx;
    if (type === "subscription") {
      lastSubscriptionTx = tx;
      lastSubscriptionIdx++;
    } else {
      totalSubscriptionAmount += Number(ethers.formatEther(boughtTokens));
    }
  });
  if (lastSubscriptionTx) {
    const total =
      totalSubscriptionAmount +
      Number(ethers.formatEther(lastSubscriptionTx.boughtTokens));
    return total;
  }
  return totalSubscriptionAmount;
}

function getCurrentBoughtAmount(tx, txs) {
  if (tx.type === "subscription") {
    const subTxs = [];
    txs.forEach((t) => {
      if (t.type === "subscription" && tx._id !== t._id) {
        subTxs.push(t);
      }
    });
    if (subTxs.length === 0) {
      return Number(ethers.formatEther(tx.boughtTokens));
    }
    return (
      Number(ethers.formatEther(tx.boughtTokens)) -
      Number(ethers.formatEther(subTxs[subTxs.length - 1].boughtTokens))
    );
  }
  return Number(ethers.formatEther(tx.boughtTokens));
}

module.exports = { getTotalBoughtAmount, getCurrentBoughtAmount };
