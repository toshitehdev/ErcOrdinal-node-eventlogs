const express = require("express");
const ethers = require("ethers");
const cors = require("cors");
const { contractABI } = require("./constant");
const { db } = require("./config");
require("custom-env").env(true);

const contract_address = process.env.CONTRACT_ADDRESS;
const provider = new ethers.getDefaultProvider(process.env.PROVIDER);
const contract = new ethers.Contract(contract_address, contractABI, provider);

const app = express();

const port = 5000;

app.use(
  cors({
    origin: "*",
  })
);

const uu = async () => {
  contract.on("EligibleIds", (id, eligible_prize) => {
    const obj = {
      id: ethers.toNumber(id),
      is_eligible: eligible_prize.is_eligible,
      prize_amount: ethers.toNumber(eligible_prize.prize_amount),
      is_claimed: eligible_prize.is_claimed,
      from_claiming: eligible_prize.from_claiming,
    };
    console.log(obj);
    //get all eligible ids
    //uniswap resurrect use the same event
    db.collection("EligibleIds")
      .doc(String(ethers.toNumber(id)))
      .set(obj)
      .then(() => {
        console.log("data created");
      })
      .catch((err) => {
        console.log(err);
      });
  });

  contract.on("UnclaimedBounty", (id) => {
    //update existing id to from_claiming = true
    db.collection("EligibleIds")
      .doc(String(ethers.toNumber(id)))
      .update({ from_claiming: true })
      .then(() => {
        console.log("updated");
      })
      .catch((err) => {
        console.log(err);
      });
  });

  contract.on("ClaimBounty", (id, amount) => {
    //update existing id to is_claimed = true
    db.collection("EligibleIds")
      .doc(String(ethers.toNumber(id)))
      .update({ is_claimed: true })
      .then(() => {
        console.log("updated");
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

uu();

//get all eligibleids
app.get("/logs", async (req, res) => {
  try {
    const idRef = db.collection("EligibleIds");
    const response = await idRef.get();
    const respArr = [];
    response.forEach((doc) => {
      respArr.push(doc.data());
    });
    res.send(respArr);
  } catch (error) {
    res.send(error);
  }
});
//get all the logs
app.get("/logs", async (req, res) => {
  try {
    const idRef = db.collection("EligibleIds");
    const response = await idRef.get();
    const respArr = [];
    response.forEach((doc) => {
      respArr.push(doc.data());
    });
    res.send(respArr);
  } catch (error) {
    res.send(error);
  }
});
//get only the unclaimed id
app.get("/logs/unclaimed", async (req, res) => {
  try {
    const idRef = db.collection("EligibleIds");
    const response = await idRef.get();
    const respArr = [];
    response.forEach((doc) => {
      if (!doc.data().is_claimed && !doc.data().from_claiming)
        respArr.push(doc.data());
    });
    res.send(respArr);
  } catch (error) {
    res.send(error);
  }
});

//get only the claimed id
app.get("/logs/claimed", async (req, res) => {
  try {
    const idRef = db.collection("EligibleIds");
    const response = await idRef.get();
    const respArr = [];
    response.forEach((doc) => {
      if (doc.data().is_claimed) respArr.push(doc.data());
    });
    res.send(respArr);
  } catch (error) {
    res.send(error);
  }
});
//get only the the expired ids
app.get("/logs/expired", async (req, res) => {
  try {
    const idRef = db.collection("EligibleIds");
    const response = await idRef.get();
    const respArr = [];
    response.forEach((doc) => {
      if (doc.data().from_claiming) respArr.push(doc.data());
    });
    res.send(respArr);
  } catch (error) {
    res.send(error);
  }
});

app.listen(port, () => {
  console.log("listening on:", port);
});
