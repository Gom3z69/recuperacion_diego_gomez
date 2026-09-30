import mongoose, { connection, mongo } from "mongoose";
import { config } from "./config.js";

mongoose.connect(config.db.URI);
const connect = mongoose.connection;

connection.on("open", () =>{
    console.log("DB is connected")
})

connection.on("disconected", (error) =>{
    console.log("DB is disconnected" + error)
})

connection.on("error", (error) => {
    console.log("DB is disconnected" + error)
})