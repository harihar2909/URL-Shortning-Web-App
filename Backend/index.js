import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import {nanoid} from "nanoid";
import dotenv from "dotenv";
dotenv.config();
import QRCode from "qrcode";

const app = express();



app.use(cors());
app.use(express.json());    


// Connection to DB
mongoose.connect(process.env.DATABASE_URL)
.then(() => console.log("DB connected"))
.catch((err) => console.log(err));




const urlSchema = new mongoose.Schema({
    originalUrl : String,
    shortUrl : String,
    clicks:{type: Number, default: 0},
    locations: [{ city: String, country: String }]
});

const Url = mongoose.model("Url", urlSchema); 


app.post('/api/short' , async(req , res) => {
    try{
        const {originalUrl} = req.body;
            if(!originalUrl){
                return res.status(400).json({message:"URL is required"});
            }
            const shortUrl = nanoid(6);
        const url = new Url({
            originalUrl,
            shortUrl
        
        });
        const myUrl = `http://localhost:3000/${shortUrl}`;
        const qrCodeImg = await QRCode.toDataURL(myUrl);
        await url.save();
        return res.status(200).json( { message:"URL Generated" , shortUrl:myUrl , qrCodeImg});

    }catch(err){
        console.log(err);
        res.status(500).json({message:"Server Error"});
    }   
});

/*
app.get("/:shortUrl" , async(req , res) => {
    try{
        const {shortUrl} = req.params;
        const url = await Url.findOne({shortUrl});
        if(url){    
            console.log(url); 
            url.clicks++;
            await url.save();
            return res.redirect(url.originalUrl);
        }else{
            return res.status(404).json({message:"URL not found"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Server Error"});
    }
    });

    */
    app.get("/:shortUrl", async (req, res) => {
        try {
            const { shortUrl } = req.params;
            const url = await Url.findOne({ shortUrl });
    
            if (url) {
                url.clicks++;
    
                // Get user location from request headers (Frontend will send it)
                const { lat, lon } = req.query;
    
                if (lat && lon) {
                    const weatherApiKey = process.env.WEATHER_API_KEY; // Store API key in .env
                    const locationUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`;
    
                    const locationResponse = await fetch(locationUrl);
                    const locationData = await locationResponse.json();
    
                    if (locationData && locationData.name) {
                        url.locations.push({ city: locationData.name, country: locationData.sys.country });
                    }
                }
    
                await url.save();
                return res.redirect(url.originalUrl);
            } else {
                return res.status(404).json({ message: "URL not found" });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    });
    

    app.get("/api/analytics", async (req, res) => {
        try {
            const urls = await Url.find({});
            return res.status(200).json(urls);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    });
    
   
      






app.listen(3000 , ()=>console.log("Server started on port 3000"));
