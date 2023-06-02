const mongoose = require("mongoose");
const fs = require("fs");
const { EventEmitter } = require("./../service/socket-sender");
const config = {};

const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "../.env" });

// Schema
// Load All Model
const streamFiles = new Promise((resolve, reject) => {
  fs.readdir("./models", (err, files) => {
    if (err) throw Error("Error Reading File");
    let fileArray = [];
    for (file of files) {
      let name = String(file).split(".")[0].toLowerCase();
      fileArray.push({
        event: name,
        model: require(`./../models/${String(file).split(".")[0]}`),
      });
    }
    resolve(fileArray);
  });
});

// DB Connection
config.__db_conect = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const connection = mongoose.connection;
    connection.once("open", async () => {
      console.log(`Mongodb Connected`);
      const files = await streamFiles;
      watchStream(files);
    });
  } catch (error) {
    console.log("Error Occured", error);
  }
};

function watchStream(models) {
  models.forEach((each) => {
    // const stream = each.model.watch();
    // stream.on('change', ({ fullDocument: doc }) => {
    // 	EventEmitter.emit('io-event', { event: each.event, payload: doc });
    // });
  });
}

module.exports = config;
