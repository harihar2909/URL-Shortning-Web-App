This project effectively shortens URLs, tracks clicks, and provides analytics with location data and also generates and displays a QR Code for each shortened URL using the qrcode package, allowing users to scan and visit the link easily. 

It is built with MongoDB, Node.js, React.js, and uses nanoid & OpenWeather API for extra features.

Following are the complete Details about the Project along the Code Snippets : 


1 ) Tech Choices for the Project : 

a) Cloud Provider : 
For Backend : Deployed on Render ( For hosting Node.js Server ) 
For Frontend : Deployed on Netlify ( For hosting React UI ) 

b) Database : MongoDB ( MongoDB Atlas ) for storing the URLs and analytics along with Location ( City name and Country ) . 

c) 
Backend : Build with Node.js 
Frontend : Developed a simple visually appealing UI with React JS. 


2 ) Flow of the Data in the Website : 

- Step 1 : URL Shortening Process 


-The user enters a long URL in the textbox given on the Frontend. 
-When the user clicks on 'Shorten Now' button , a Post request is sent to /api/short in the Backend. 

Following are some Code Snippets showing above 2 steps :-
{
// Code Blocks showing the Same 
Front End : 

TextBox and Submit Button :- 
  <input
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          type="text"
          placeholder="Enter your URL here..."
          className="input-box"
        />
    <button onClick={handleSubmit} className="crazy-button">
          🚀 Shorten Now
    </button>

handleSubmit function that sends a post request to the Backend :-
const handleSubmit = () => {
    axios.post('https://url-shortning-web-app.onrender.com/api/short', { originalUrl })
    .then((res) => {
        setShortUrl(res.data);
        console.log("API Response", res.data);
    })
    .catch((err) => {
        console.log(err);
    });
  };

}

-Then the Backend generated a ShortID using the Nanoid Package. 
-The short URL and the Original URL are stored in MongoDB
-A QR Code is generated using the QR Code Package  

{ Code Snippet for above 3 Steps : 

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
}

-The ShortURL got from the Backend is displayed on the Front End by the following code Block : 
{
    {shortUrl && (
  <div className="short-url">
    <p>Shortened URL:</p>
    
    <a href={ `https://url-shortning-web-app.onrender.com/{shortUrl?.shortUrl}`} 
       target="_blank" 
       rel="noopener noreferrer"
       onClick={() => trackClick(shortUrl?.shortUrl)}>
      {shortUrl?.shortUrl}
    </a>
    {shortUrl.qrCodeImg && <img src={shortUrl.qrCodeImg} alt="Generated QR Code" />}
  </div>
)}

}


- Step 2 : Redirecting to Original URL :

  -When the user clicks on the Short URL , the frontend calls the backend /shortUrl endpoint.

{  // Code Snippet for this 
  <a href={ `https://url-shortning-web-app.onrender.com/{shortUrl?.shortUrl}`} 
       target="_blank" 
       rel="noopener noreferrer"
       onClick={() => trackClick(shortUrl?.shortUrl)}>
      {shortUrl?.shortUrl}
    </a>
  } 
On clicking this Link , also the trackCLick function is executed which calls the backend /shortUrl?lat=${latitude}&lon=${longitude} endpoint for fetching the Location and tracking the Click Count. 

{  // trackClick Function : 
const trackClick = (shortUrl) => {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
          
          axios.get(`https://url-shortning-web-app.onrender.com/${shortUrl}?lat=${latitude}&lon=${longitude}`)
          .then(() => console.log("Click tracked with location"))
          .catch(err => console.log(err));
      }, (error) => {
          console.log("Geolocation error:", error);
      });
  } else {
      console.log("Geolocation not supported");
  }
};

}



- The Backend fetches the Original URL from the Database.
- The backend increments the click count and tracks the location using geolocation api of Open Weather Site.
- Then the user is redirected to the original URL.

{ Backend Code Snippet : 

app.get("/:shortUrl", async (req, res) => {
        try {
            const { shortUrl } = req.params;
            const url = await Url.findOne({ shortUrl });
    
  if (url) {
        url.clicks++;
    
     // Get user location from request headers (Frontend will send it)
  const { lat, lon } = req.query;
    
  if(lat && lon) {
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

} 


So by this ,  when each time short URL is accessed ,   geolocation data ( City & Country ) is retreived using the OpenWeather API and the Data is Stored in MongoDB Database.


- Step 3 ) When the user clicks the 'Show CLick Analytics' Button , a get Request is sent to the Backend at /api/analytics Route.

  { // Code Snippet

 <button onClick={fetchAnalytics} className="analytics-button">
          📊 Show Click Analytics
  </button>

  Following is the fetchAnalytics Function : 
  
  const fetchAnalytics = () => {
  axios.get('https://url-shortning-web-app.onrender.com/api/analytics')
  .then((res) => {
      setAnalytics(res.data);
      console.log("Analytics Data", res.data);
  })
  .catch((err) => {
      console.log(err);
  });
};

}
  
- The frontend fetches the Data about Location and click Count using the /api/analytics endpoint and Displays it in the Form of a Table.

{ Code Snippet for /api/analytics route of Backend 

  app.get("/api/analytics", async (req, res) => {
        try {
            const urls = await Url.find({});
            return res.status(200).json(urls);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Server Error" });
        }
    });

// Front End Code for displaying the Data in form of a Table  : 


  {analytics.length > 0 && (
          <div className="analytics-container">
           <table className="analytics-table">
    <thead>
        <tr>
            <th>Short URL</th>
            <th>Original URL</th>
            <th>Clicks</th>
            <th>Locations</th>
        </tr>
    </thead>
    <tbody>
        {analytics.map((url, index) => (
            <tr key={index}>
                <td>
                <a href={`https://url-shortning-web-app.onrender.com/${url.shortUrl}`}
   target="_blank" 
   rel="noopener noreferrer" 
   onClick={() => trackClick(url.shortUrl)}>
   {url.shortUrl}
</a>
                </td>
                <td>{url.originalUrl}</td>
                <td>{url.clicks}</td>
                <td>
                    {url.locations && url.locations.length > 0 ? (
                        url.locations.map((loc, i) => (
                            <div key={i}>{loc.city}, {loc.country}</div>
                        ))
                    ) : (
                        "No Data"
                    )}
                </td>
            </tr>
        ))}
    </tbody>
</table>


}





3 ) APIs Used in the Project : 

a) Creating a ShortURL :

API/Endpoint used : /api/short    --> Post Request on this API

b) Redirecting and Tracking Clicks : 

Api/Endpoint used : /:shortUrl?lat={latitude}&lon={longitude} --> Get request on this API
Functionility : 
Fetches Original URL , Increase Click Count , fetches geolocation , Redirects the User

c) Fetching Analytics: 

Api/Endpoint Used : /api/analytics --> Get Request on this API 

External APIs Used : OpenWeather API for knowing the current location of the User cicking on the Shortened URL 


4 ) some steps/strategies for Optimising the Flow :

-Error handlers for invalid URLS or API failures. 
-Asynchronous API Requests for better User experience. 
-Caching frequently accessed Data ( e.g Previously generated Short URL ) 


       



    

    


  










  


