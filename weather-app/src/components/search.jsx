import { useState,useEffect } from "react"
import WeatherData from "./getWeather"
import searchIcon from '../assets/search.svg';
const Search = () => {
  const [location,setLocation]=useState('')
  const [coordinates,setCoordinates]=useState()
  useEffect(()=>{
    setLocation('Kathmandu');
    setCoordinates({ lon: 85.3205817, lat: 27.708317 });
  },[])
  const handleSubmit=async (e)=>{
    e.preventDefault();
    const apiKey = import.meta.env.VITE_GEOCODE_API;
    const apiURL = 'https://api.geoapify.com/v1/geocode/search?apiKey='+apiKey+'&text='+location;
    try {
      const response = await fetch(apiURL);
      const data = await response.json();
      const {lon,lat}=data.features[0].properties;
      setCoordinates({
        lon,
        lat
      });
    } catch (error) {
      console.error('Error fetching data:',error);
    }
  }
  return (
    <>
      <div className='main-card'>
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type='text'
            value={location}
            placeholder='Enter the city name'
            spellCheck={false}
            className='search-field'
            onChange={(e) => setLocation(e.target.value)}
          />
          <button className='search-btn'>
            <img src={searchIcon} alt="Search Icon" height={"20rem"} />
          </button>
        </form>
        {coordinates && (
          <div>
            <WeatherData
              lon={coordinates.lon}
              lat={coordinates.lat}
            ></WeatherData>
          </div>
        )}
      </div>
    </>
  );
}
export default Search