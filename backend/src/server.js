import express from "express";
import "dotenv/config";

const app = express();
app.use(express.json());


app.listen(process.env.PORT, ()=>{
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});