import React, { useState, useEffect } from "react";
import ChatButton from "./components/ChatButton";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState("");

  const fetchWeather = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/weather?city=${city}`);

      if (!response.ok) {
        throw new Error("City not found");
      }

      const data = await response.json();
      const weather = {
        temp: data.temperature,
        feels_like: data.feels_like,
        description: data.description,
        main: data.main, // <-- added
        iconCode: data.icon,
        icon: `https://openweathermap.org/img/wn/${data.icon}@2x.png`,
        humidity: data.humidity,
        wind: data.wind,
        city: data.city,
        country: data.country
      };

      setWeatherData(weather);
      setError("");
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    }
  };

  useEffect(() => {
    document.body.className = "";

    if (weatherData) {
      const condition = weatherData.main.toLowerCase();
      if (condition.includes("clear")) document.body.classList.add("clear");
      else if (condition.includes("cloud")) document.body.classList.add("cloudy");
      else if (condition.includes("rain")) document.body.classList.add("rainy");
      else if (condition.includes("snow")) document.body.classList.add("snowy");
      else document.body.className = "";
    }
  }, [weatherData]);

  return (
    <div className="App">
      <h1
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <img
          src="https://openweathermap.org/img/wn/04d@2x.png"
          alt="Weather Icon"
          style={{ width: "40px", height: "40px" }}
        />
        Weather Dashboard
      </h1>

      <form onSubmit={fetchWeather}>
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit">Get Weather</button>
      </form>

      {error && <div className="error">{error}</div>}

      {weatherData && (
        <div className="weather-info">
          <h2>
            {weatherData.city}, {weatherData.country}
          </h2>
          <img src={weatherData.icon} alt={weatherData.description} />
          <p><strong>{weatherData.description}</strong></p>
          <p>Temperature: <strong>{weatherData.temp} °C</strong></p>
          <p>Feels Like: <strong>{weatherData.feels_like} °C</strong></p>
          <p>Humidity: <strong>{weatherData.humidity}%</strong></p>
          <p>Wind Speed: <strong>{weatherData.wind} m/s</strong></p>
        </div>
      )}

      <ChatButton weatherData={weatherData} />
      
    </div>
  );
}

export default App;
