import React, { useEffect, useState } from "react";
import "./App.css";
import Maindata from "./Components/Maindata";
import Search from "./Components/Search";
import { ThemeProvider } from "./Components/ThemeContext.jsx";
import ThemeToggle from "./Components/ThemeToggle.jsx";

function App() {
  const [location, setLocation] = useState();
  const [backgroundImageURL, setBackgroundImageURL] = useState("01n");

  const handle = (e) => {
    setBackgroundImageURL(e);
  };

  useEffect(() => {
    const favorite = localStorage.getItem("favorite");
    if (favorite) {
      setLocation(favorite);
    } else {
      const getCity = async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const response = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=pk.95a050c0a4b0b9acd047628b3bc4d189&lat=${latitude}&lon=${longitude}&format=json`
          );
          const json = await response.json();
          if (json?.address?.city) {
            setLocation(json.address.city);
          } else {
            setLocation("New York");
          }
        } catch (error) {
          console.error("Error fetching location:", error);
          setLocation("New York");
        }
      };

      navigator.geolocation.getCurrentPosition(getCity, (error) => {
        console.warn("Geolocation error:", error);
        setLocation("New York");
      });
    }
  }, []);

  return (
    <ThemeProvider>
      <div
        className="mainpage"
        style={{
          backgroundImage: `url("./pics/${backgroundImageURL}.jpg")`,
          backgroundSize: "cover",
        }}
      >
        <ThemeToggle />
        <Maindata city={location} setBackgroundImageURL={handle} />
      </div>
    </ThemeProvider>
  );
}

export default App;
