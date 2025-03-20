import { useState } from "react";
import "./styles.css"; // Import the updated styles
import axios from "axios";

export default function App() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [analytics, setAnalytics] = useState([]); // Store analytics data

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

  // Fetch analytics when button is clicked
  /*
  const fetchAnalytics = () => {
    axios.get('http://localhost:3000/api/analytics')
    .then((res) => {
        setAnalytics(res.data);
        console.log("Analytics Data", res.data);
    })
    .catch((err) => {
        console.log(err);
    });
  };
*/
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




  return (
    <div className="container">
      <div className="glass-card">
        <h1 className="heading">⭐ URL Shortener ⭐</h1>
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

        {/* Shortened URL & QR Code */}
        {shortUrl && (
  <div className="short-url">
    <p>Shortened URL:</p>
    
    <a href={ `https://url-shortning-web-app.onrender.com/${shortUrl}`} 
       target="_blank" 
       rel="noopener noreferrer"
       onClick={() => trackClick(shortUrl?.shortUrl)}>
      {shortUrl?.shortUrl}
    </a>
    {shortUrl.qrCodeImg && <img src={shortUrl.qrCodeImg} alt="Generated QR Code" />}
  </div>
)}



        {/* Fetch Analytics Button */}
        <button onClick={fetchAnalytics} className="analytics-button">
          📊 Show Click Analytics
        </button>

        {/* Display Analytics Table */}
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

          </div>
        )}
      </div>
    </div>
  );
}
