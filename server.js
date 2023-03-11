const express = require("express");
const ethers = require("ethers");
const cors = require("cors");
const { contractABI } = require("./constant");
const { db } = require("./config");
require("custom-env").env(true);

const contract_address = process.env.CONTRACT_ADDRESS;
const provider = new ethers.getDefaultProvider(process.env.PROVIDER);
const contract = new ethers.Contract(contract_address, contractABI, provider);
provider.pollingInterval = 1000;

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
    //console.log(obj);
    //get all eligible ids
    //uniswap resurrect use the same event
    db.collection(process.env.COLLECTION)
      .doc(String(ethers.toNumber(id)))
      .set(obj)
      .then(() => {
        console.log("data created");
      })
      .catch((err) => {
        console.log(err);
      });
  });

  contract.on("ExpiredBounty", (id) => {
    //update existing id to from_claiming = true
    db.collection(process.env.COLLECTION)
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
    db.collection(process.env.COLLECTION)
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

app.get("/logs", async (req, res) => {
  try {
    const idRef = db.collection(process.env.COLLECTION);
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
//wait to render claim
app.get("/claim", async (req, res) => {
  try {
    //update existing id to is_claimed = true
    await db.collection("w").doc("p").set({ is_claimed: true });
    await db.collection("x").doc("y").set({ is_claimed: true });

    const idRef = db.collection(process.env.COLLECTION);
    const response = await idRef.get();
    const respArr = [];
    response.forEach((doc) => {
      respArr.push(doc.data());
    });
    res.send(respArr);
    console.log("updated");
  } catch (error) {
    res.send(error);
  }
});
//get only the unclaimed id
app.get("/logs/unclaimed", async (req, res) => {
  try {
    const idRef = db.collection(process.env.COLLECTION);
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
    const idRef = db.collection(process.env.COLLECTION);
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
    const idRef = db.collection(process.env.COLLECTION);
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

//force update in case something wrong happen to this logger
app.get("/forceupdate", async (req, res) => {
  try {
    const filter = contract.filters.EligibleIds();
    const events = await contract.queryFilter(filter);
    const eventIds = events.map((item, idx) => {
      const logs = contract.interface.parseLog({
        data: item.data,
        topics: item.topics,
      });
      return ethers.toNumber(logs.args.id);
    });

    eventIds.forEach(async (item, index) => {
      const getDataObject = await contract.idIsEligible(item);
      const obj = {
        id: item,
        is_eligible: getDataObject.is_eligible,
        prize_amount: ethers.toNumber(getDataObject.prize_amount),
        is_claimed: getDataObject.is_claimed,
        from_claiming: getDataObject.from_claiming,
      };
      await db
        .collection(process.env.COLLECTION)
        .doc(String(item))
        .set(obj)
        .then(() => {
          console.log("data created");
        })
        .catch((err) => {
          console.log(err);
        });
    });

    res.send("ok");
  } catch (error) {
    res.send(error);
  }
});

app.listen(port, () => {
  console.log("listening on:", port);
});
