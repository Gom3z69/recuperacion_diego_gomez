import mongoose from "mongoose";
import { config } from "./config.js";

mongoose.connect(config.db.URI);
const connect = mongoose.connection;

connect.on("open", () =>{
    console.log("DB is connected")
})

connect.on("disconnected", () =>{
    console.log("DB is disconnected")
})

connect.on("error", (error) => {
    console.log("DB error " + error)
})