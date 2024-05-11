import { fetchWeatherApi } from 'openmeteo';
// WeatherData.jsx
import React, { useState, useEffect, useRef } from 'react';
import precipitationIcon from '../assets/icons8-precipitation-50.png'
import windIcon from '../assets/icons8-wind-50.png'
import humidityIcon from '../assets/icons8-humidity-50.png'

const processResponses = (responses) => {
  // Helper function to form time ranges
  const range = (start, stop, step) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];

  // Attributes for timezone and location
  const utcOffsetSeconds = response.utcOffsetSeconds();
  const timezone = response.timezone();
  const timezoneAbbreviation = response.timezoneAbbreviation();
  const latitude = response.latitude();
  const longitude = response.longitude();

  const current = response.current();
  const hourly = response.hourly();
  const daily = response.daily();

  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = {
    current: {
      time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      temperature2m: parseInt(current.variables(0).value()),
      precipitation: current.variables(1).value(),
      rain: current.variables(2).value(),
      weatherCode: current.variables(3).value(),
      windSpeed10m: parseInt(current.variables(4).value()),
      relativeHumidity2m: current.variables(5).value(),
    },
    hourly: {
      time: range(
        Number(hourly.time()),
        Number(hourly.timeEnd()),
        hourly.interval()
      ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
      temperature2m: hourly.variables(0).valuesArray(),
      precipitationProbability: hourly.variables(1).valuesArray(),
      rain: hourly.variables(2).valuesArray(),
      weatherCode: hourly.variables(3).valuesArray(),
      windSpeed10m: hourly.variables(4).valuesArray(),
    },
    daily: {
      time: range(
        Number(daily.time()),
        Number(daily.timeEnd()),
        daily.interval()
      ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
      temperature2mMax: daily.variables(0).valuesArray(),
      temperature2mMin: daily.variables(1).valuesArray(),
      precipitationProbabilityMax: daily.variables(2).valuesArray(),
      weatherCode: daily.variables(3).valuesArray(),
    },
  };

  return weatherData;
};

const getWeatherDescription = (weatherCode) => {
  switch (true) {
    case weatherCode === 0:
      return 'Clear sky';
    case weatherCode === 1 || weatherCode === 2 || weatherCode === 3:
      return 'Mainly clear, partly cloudy, and overcast';
    case weatherCode === 45 || weatherCode === 48:
      return 'Fog and depositing rime fog';
    case weatherCode === 51 || weatherCode === 53 || weatherCode === 55:
      return 'Drizzle: Light, moderate, and dense intensity';
    case weatherCode === 56 || weatherCode === 57:
      return 'Freezing Drizzle: Light and dense intensity';
    case weatherCode === 61 || weatherCode === 63 || weatherCode === 65:
      return 'Rain: Slight, moderate and heavy intensity';
    case weatherCode === 66 || weatherCode === 67:
      return 'Freezing Rain: Light and heavy intensity';
    case weatherCode === 71 || weatherCode === 73 || weatherCode === 75:
      return 'Snow fall: Slight, moderate, and heavy intensity';
    case weatherCode === 77:
      return 'Snow grains';
    case weatherCode === 80 || weatherCode === 81 || weatherCode === 82:
      return 'Rain showers: Slight, moderate, and violent';
    case weatherCode === 85 || weatherCode === 86:
      return 'Snow showers slight and heavy';
    case weatherCode === 95:
      return 'Thunderstorm: Slight or moderate';
    case weatherCode === 96 || weatherCode === 99:
      return 'Thunderstorm with slight and heavy hail';
    default:
      return 'Unknown weather condition';
  }
};
const getWeatherIcon = (weatherCode) => {
  switch (true) {
    case weatherCode === 0:
      return (
        <img
          src='https://www.ibm.com/docs/en/SSRQLT_suite/images/Sunny.png'
          alt='Sunny'
        />
      );
    case weatherCode === 1 || weatherCode === 2 || weatherCode === 3:
      return (
        <img
          src='https://www.ibm.com/docs/en/SSRQLT_suite/images/Partly_cloudy_sun.png'
          alt='Cloudy'
        />
      );
    case weatherCode === 45 || weatherCode === 48:
      return (
        <img
          src='https://www.ibm.com/docs/en/SSRQLT_suite/images/Foggy.png'
          alt='Foggy'
        />
      );
    case weatherCode === 51 || weatherCode === 53 || weatherCode === 55:
      return (
        <img
          src='https://www.ibm.com/docs/en/SSRQLT_suite/images/Drizzle.png'
          alt='Drizzle'
        />
      );
    case weatherCode === 56 || weatherCode === 57:
      return (
        <img
          src='https://www.ibm.com/docs/en/SSRQLT_suite/images/Freezing_drizzle.png'
          alt='Freezing Drizzle'
        />
      );
    case weatherCode === 61 || weatherCode === 63 || weatherCode === 65:
      return (
        <img
          src='https://www.ibm.com/docs/en/SSRQLT_suite/images/Rain.png'
          alt='Rain'
        />
      );
    case weatherCode === 66 || weatherCode === 67:
      return (
        <img
          src='https://www.ibm.com/docs/en/SSRQLT_suite/images/Freezing_rain.png'
          alt='Freezing Rain'
        />
      );
    case weatherCode === 71 || weatherCode === 73 || weatherCode === 75:
      return (
        <img
          src='https://www.ibm.com/docs/en/SSRQLT_suite/images/Snow.png'
          alt='Snow'
        />
      );
    case weatherCode === 77:
      return (
        <img
          src='https://www.ibm.com/docs/en/SSRQLT_suite/images/Hail.png'
          alt='Hail'
        />
      );
    case weatherCode === 80 || weatherCode === 81 || weatherCode === 82:
      return (
        <img
          src='https://www.ibm.com/docs/en/SSRQLT_suite/images/Showers.png'
          alt='Rain Shower'
        />
      );
    case weatherCode === 85 || weatherCode === 86:
      return (
        <img
          src='https://www.ibm.com/docs/en/SSRQLT_suite/images/Snow_showers.png'
          alt='Snow Shower'
        />
      );
    case weatherCode === 95:
      return (
        <img
          src='https://www.ibm.com/docs/en/SSRQLT_suite/images/Thunderstorms.png'
          alt='Thunderstorm'
        />
      );
    case weatherCode === 96 || weatherCode === 99:
      return (
        <img
          src='https://www.ibm.com/docs/en/SSRQLT_suite/images/Strong_storms.png'
          alt='Heavy Thunderstorm'
        />
      );
    default:
      return (
        <img
          src='https://www.ibm.com/docs/en/SSRQLT_suite/images/Not_available.png'
          alt='Unknown Weather'
        />
      );
  }
};
const WeatherData = ({ lon, lat }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCel, setIsCel] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = {
          latitude: lat,
          longitude: lon,
          current: [
            'temperature_2m',
            'precipitation',
            'rain',
            'weather_code',
            'wind_speed_10m',
            'relative_humidity_2m',
          ],
          hourly: [
            'temperature_2m',
            'precipitation_probability',
            'rain',
            'weather_code',
            'wind_speed_10m',
          ],
          daily: [
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_probability_max',
            'weather_code',
          ],
          timezone: 'auto',
          past_days: 0,
          forecast_days: 5,
        };

        const url = 'https://api.open-meteo.com/v1/forecast';
        const responses = await fetchWeatherApi(url, params);

        // Process the responses and set the weatherData state
        setWeatherData(processResponses(responses));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (lon && lat) {
      fetchData();
    }
  }, [lon, lat]);
  const toFah = (cel) => {
    return parseInt((9 / 5) * cel + 32);
  };
  const handleCelClick = () => {
    if (!isCel) {
      setIsCel(true);
    }
  };

  const handleFahClick = () => {
    if (isCel) {
      setIsCel(false);
    }
  };

  const getCurrentHourData = () => {
    if (!weatherData || !weatherData.hourly) return null;

    const currentHour = new Date().getUTCHours(); // Get the current hour in UTC
    const utcOffsetSeconds =
      weatherData.hourly.time[0].getTimezoneOffset() * 60; // Get the UTC offset in seconds

    const currentHourData = weatherData.hourly.time.find((time, index) => {
      const adjustedTime = new Date(time.getTime() + utcOffsetSeconds * 1000); // Adjust the time for the correct time zone
      return adjustedTime.getUTCHours() === currentHour; // Compare with the current hour in UTC
    });

    const currentHourIndex = weatherData.hourly.time.indexOf(currentHourData);

    if (currentHourIndex === -1) return null;

    return {
      time: currentHourData,
      temperature2m: weatherData.hourly.temperature2m[currentHourIndex],
      precipitationProbability:
        weatherData.hourly.precipitationProbability[currentHourIndex],
      rain: weatherData.hourly.rain[currentHourIndex],
      weatherCode: weatherData.hourly.weatherCode[currentHourIndex],
      windSpeed10m: weatherData.hourly.windSpeed10m[currentHourIndex],
    };
  };

  const currentHourData = getCurrentHourData();
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!weatherData) {
    return <div>No weather data available</div>;
  }

  // Render the weather data using the weatherData object
  return (
    <div>
      <p>{getWeatherDescription(weatherData.current.weatherCode)}</p>
      <div className='current-weather'>
        {getWeatherIcon(weatherData.current.weatherCode)}
        <div className='current-temperature'>
          <h1>
            {isCel
              ? weatherData.current.temperature2m
              : toFah(weatherData.current.temperature2m)}
            °
          </h1>
          <p>
            {' '}
            {isCel
              ? parseInt(weatherData.daily.temperature2mMax[0])
              : toFah(weatherData.daily.temperature2mMax[0])}
            ° /{' '}
            {isCel
              ? parseInt(weatherData.daily.temperature2mMin[0])
              : toFah(weatherData.daily.temperature2mMin[0])}
            °
          </p>
        </div>
        <div className='current-stats'>
          <div className='each-current'>
            <img src={precipitationIcon} alt='Precipitation' />
            <p>
              {currentHourData.precipitationProbability}
              <span>%</span>
            </p>
          </div>
          <div className='each-current'>
            <img src={windIcon} alt='wind' />
            <p>
              {weatherData.current.windSpeed10m}
              <span>kph</span>
            </p>
          </div>
          <div className='each-current'>
            <img src={humidityIcon} alt='humidity' />
            <p>
              {weatherData.current.relativeHumidity2m}
              <span>%</span>
            </p>
          </div>
        </div>
      </div>
      <div className='daily-weather'>
        {weatherData.daily.time.slice(1).map((time, index) => {
          const date = new Date(time);
          const weekday = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ][date.getDay()];

          return (
            <div key={time.toString()}>
              {getWeatherIcon(weatherData.daily.weatherCode[index + 1])}
              <p>
                {' '}
                {isCel
                  ? parseInt(weatherData.daily.temperature2mMax[index + 1])
                  : toFah(weatherData.daily.temperature2mMax[index + 1])}
                ° /{' '}
                {isCel
                  ? parseInt(weatherData.daily.temperature2mMin[index + 1])
                  : toFah(weatherData.daily.temperature2mMin[index + 1])}
                °
              </p>
              <p>{weekday}</p>
            </div>
          );
        })}
      </div>
      <div className='toggle-area'>
        <button
          className={`cel-btn ${isCel ? 'active' : ''}`}
          onClick={handleCelClick}
          autoFocus={isCel}
        >
          °C
        </button>
        <button
          className={`fah-btn ${!isCel ? 'active' : ''}`}
          onClick={handleFahClick}
          autoFocus={!isCel}
        >
          °F
        </button>
      </div>
    </div>
  );
};

export default WeatherData;
