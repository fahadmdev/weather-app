import React, { useState, useEffect } from "react";
import {
  Sun,
  Cloud,
  Droplets,
  Wind,
  Sunrise,
  Sunset,
  ThermometerSun,
  ThermometerSnowflake,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  Heart,
} from "lucide-react";
import moment from "moment";
import "../Componentstyle/Main.css";

const Maindata = ({ city, setBackgroundImageURL }) => {
  const [data, setData] = useState();
  const [cityvalid, setCityvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState(city);
  const [searchTrue, setSearchTrue] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [unit, setUnit] = useState("metric");

  useEffect(() => {
    if (searchValue) {
      fetchSuggestions(searchValue);
    } else {
      setSuggestions([]);
    }
  }, [searchValue]);
  const fetchSuggestions = async (query) => {
    const API_KEY =
      "pk.eyJ1Ijoid2FqZWVoc2hhaWtoIiwiYSI6ImNtMzV5bno1bjA3czYyaW9qb3lpa3lsenoifQ.ZoUhye10TZXvBYt-1j0NnA";
    if (query.length > 5) {
      setSuggestions([]);
      return;
    }

    try {
      const url = new URL(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json`
      );

      url.searchParams.append("access_token", API_KEY);
      url.searchParams.append("types", "place,region,country");
      url.searchParams.append("autocomplete", "true");
      url.searchParams.append("limit", "5");

      const response = await fetch(url);
      const data = await response.json();

      const results = data.features.map((feature) => ({
        name: feature.place_name,
        city: feature.text,
      }));

      setSuggestions(results);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };
  const getCoordinates = async (cityName) => {
    console.log(cityName);
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=8572220901080675373f4efc2146d45d&units=metric`
    );
    const data = await response.json();
    if (data.coord) {
      return { lat: data.coord.lat, lon: data.coord.lon };
    } else {
      throw new Error("City not found");
    }
  };

  const Dweather = async (cityName) => {
    try {
      const { lat, lon } = await getCoordinates(cityName);
      const key = process.env.REACT_APP_API_KEY;

      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=286e81f6bd2ebdb5a82357f607fa4b47&units=${unit}`
      );
      const actualData = await weatherResponse.json();

      if (actualData.city) {
        setCityvalid(true);
        setData(actualData);
      } else {
        setCityvalid(false);
      }
    } catch (error) {
      console.error(error);
      setCityvalid(false);
    }
  };

  const favorite = localStorage.getItem("favorite");
  useEffect(() => {
    if (!searchTrue) {
      Dweather(city);
      setSearchValue(city);
    } else {
      Dweather(searchValue);
      setSearchValue(searchValue);
    }

    if (favorite == city && searchTrue == false) {
      setIsFavorite(true);
    } else {
      setIsFavorite(false);
    }
  }, [city, unit]);

  useEffect(() => {
    setBackgroundImageURL(data?.list[0].weather[0].icon);
  }, [data, setBackgroundImageURL]);

  if (!data) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  const handleSearch = async () => {
    if (favorite === searchValue) {
      setIsFavorite(true);
    } else {
      setIsFavorite(false);
    }

    setLoading(true);
    await Dweather(searchValue);
    setTimeout(() => setLoading(false), 1000);
  };

  const getWeatherIcon = (weather) => {
    switch (weather) {
      case "Clear":
        return <Sun className="forecast-icon" color="yellow" />;
      case "Clouds":
        return <Cloud className="forecast-icon" color="white" />;
      case "Rain":
        return <CloudRain className="forecast-icon" />;
      case "Snow":
        return <CloudSnow className="forecast-icon" />;
      case "Drizzle":
        return <CloudDrizzle className="forecast-icon" />;
      default:
        return <Cloud className="forecast-icon" />;
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  const handleSearchInput = (value) => {
    setSearchValue(value);
    setSearchTrue(true);
    if (suggestions.length >= 1) setShowSuggestions(true);
  };

  const handleFavorite = (value) => {
    setIsFavorite(value);
    if (value) {
      localStorage.setItem("favorite", searchValue);
    } else {
      localStorage.setItem("favorite", "");
    }
  };
  const setDrowpdown = (city) => {
    setSearchValue(city);
    setSuggestions([]);
    setShowSuggestions(false);
  };
  return (
    <div className="weather-container">
      <div className="main-content">
        <div className="header-controls">
          <h3 className="forecast-title">Anytime Weather</h3>
          <div className="search-container">
            <h6 className="forecast-day">Enter City Below</h6>
            <input
              type="text"
              placeholder="Search location..."
              className="search-input"
              value={searchValue}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {showSuggestions && (
              <ul className="suggestions ">
                {suggestions.map((suggestion, index) => (
                  <li key={index} onClick={() => setDrowpdown(suggestion.city)}>
                    {suggestion.city}
                  </li>
                ))}
              </ul>
            )}
            <div className="temp-unit-toggle">
              <label>
                <input
                  type="radio"
                  name="unit"
                  value="metric"
                  checked={unit === "metric"}
                  onChange={() => setUnit("metric")}
                />
                °C
              </label>
              <label>
                <input
                  type="radio"
                  name="unit"
                  value="imperial"
                  checked={unit === "imperial"}
                  onChange={() => setUnit("imperial")}
                />
                °F
              </label>
            </div>
            <div className="search-controls">
              <button className="search-button" onClick={handleSearch}>
                Enter
              </button>
            </div>
          </div>
        </div>
        <div className="weather-view">
          <div className="weather-card">
            {loading ? (
              <div className="searchLoader"></div>
            ) : (
              <>
                <div className="weather-top-result">
                  <div className="city-info">
                    <h1 className="city-name">{data.city.name}</h1>
                    <p className="date">
                      {moment
                        .utc(new Date().setTime(data.list[0].dt * 1000))
                        .add(data.city.timezone, "seconds")
                        .format("dddd, MMMM Do YYYY")}
                    </p>
                  </div>

                  <div className="current-weather">
                    <div className="weather-main">
                      <div className="weather-display">
                        <img
                          src={`./icons/${data.list[0].weather[0].icon}.svg`}
                          alt="weather"
                          className="weather-icon"
                        />
                        <div className="temperature-container">
                          <h2 className="temperature">
                            {data.list[0].main.temp.toFixed(1)}°
                            {unit === "metric" ? "C" : "F"}
                          </h2>
                          <p className="weather-description">
                            {data.list[0].weather[0].description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="weather-details">
                  {[
                    {
                      icon: (
                        <ThermometerSun className="detail-icon high-temp" />
                      ),
                      label: "High",
                      value: `${data.list[0].main.temp_max.toFixed(1)}${
                        unit === "metric" ? "°C" : "°F"
                      }`,
                    },
                    {
                      icon: (
                        <ThermometerSnowflake className="detail-icon low-temp" />
                      ),
                      label: "Low",
                      value: `${data.list[0].main.temp_min.toFixed(1)}${
                        unit === "metric" ? "°C" : "°F"
                      }`,
                    },
                    {
                      icon: <Wind className="detail-icon wind" />,
                      label: "Wind",
                      value: `${data.list[0].wind.speed.toFixed(1)} km/h`,
                    },
                    {
                      icon: <Droplets className="detail-icon humidity" />,
                      label: "Humidity",
                      value: `${data.list[0].main.humidity}%`,
                    },
                    {
                      icon: <Sunrise className="detail-icon sunrise" />,
                      label: "Sunrise",
                      value: moment
                        .utc(data.city.sunrise, "X")
                        .add(data.city.timezone, "seconds")
                        .format("h:mm a"),
                    },
                    {
                      icon: <Sunset className="detail-icon sunset" />,
                      label: "Sunset",
                      value: moment
                        .utc(data.city.sunset, "X")
                        .add(data.city.timezone, "seconds")
                        .format("h:mm a"),
                    },
                  ].map((item, index) => (
                    <div key={index} className="detail-card">
                      <div className="detail-header">
                        {item.icon}
                        <span className="detail-label">{item.label}</span>
                      </div>
                      <div className="detail-value">{item.value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="below-display-container">
            <h3 className="forecast-title">5-Day Forecast</h3>
            <label className="favorite-city">
              <input
                type="checkbox"
                onChange={(e) => {
                  handleFavorite(e.target.checked);
                }}
                checked={isFavorite}
              />
              Save as Favorite
            </label>
          </div>

          <div className="forecast-grid">
            {[7, 15, 23, 31, 39].map((index) => (
              <div key={index} className="forecast-card">
                {loading ? (
                  <div className="searchLoader"></div>
                ) : (
                  <>
                    <h4 className="forecast-day">
                      {moment(new Date(data.list[index].dt * 1000)).format(
                        "ddd"
                      )}
                    </h4>
                    {getWeatherIcon(data.list[index].weather[0].main)}
                    <div className="forecast-details">
                      <div className="forecast-temp">
                        {data.list[index].main.temp.toFixed(1)}
                        {unit === "metric" ? "°C" : "°F"}
                      </div>
                      <div className="forecast-feels-like">
                        Feels like {data.list[index].main.feels_like.toFixed(1)}
                        {unit === "metric" ? "°C" : "°F"}
                      </div>
                      <div className="forecast-humidity">
                        Humidity {data.list[index].main.humidity}%
                      </div>
                      <div className="forecast-condition">
                        {data.list[index].weather[0].main}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maindata;
