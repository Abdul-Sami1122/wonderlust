const mongoose = require("mongoose");
const initData = require("./data");
const listing = require("../Models/listing");


// Creating connection to data base
const MONGO_URL = "mongodb://127.0.0.1:27017/wonderLust";
async function main(){
    await mongoose.connect(MONGO_URL);
};
// Calling a main function of Data Base

main().then(()=>{
    console.log("Connection established");
})
.catch(()=>{
    console.log("Connection Failed");
});


const intializeDB = async ()=>{
    await listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj, owner: "68d6a09f3ecb074082a91c13"}));
    await listing.insertMany(initData.data);
    console.log("data was intialized");
};

intializeDB();

