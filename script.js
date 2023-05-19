const apiKey = 'c27f41406c620b7bb836935a9059cdf0';
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const previousSearch = document.getElementById('previousSearch');
const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const emojiWeather = document.getElementById('emojiWeather');
const currentTemp = document.getElementById('currentTemp');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const forecastContainer = document.getElementById('forecastContainer');

searchForm.addEventListener('submit', searchCity);

function searchCity(event) {
  event.preventDefault();
  const city = searchInput.value.trim();

  if (city) {
    getWeatherData(city);
    saveSearch(city);
    searchInput.value = '';
  }
}

function saveSearch(city) {
  let searches = JSON.parse(localStorage.getItem('searches')) || [];
  searches.push(city);
  localStorage.setItem('searches', JSON.stringify(searches));
  displayPreviousSearches();
}

function displayPreviousSearches() {
    const searches = JSON.parse(localStorage.getItem('searches')) || [];
    previousSearch.innerHTML = '';
  
    // Get the last 5 cities searched
    const lastFiveSearches = searches.slice(-5);
  
    lastFiveSearches.forEach((city) => {
      const button = document.createElement('button');
      button.textContent = city;
      button.setAttribute('id', 'PreviousSearched');
      button.setAttribute('class', 'button is-primary');
      previousSearch.appendChild(button);
  
      // Add event listener to the button
      button.addEventListener('click', () => {
        getWeatherData(city);
      });
    });
  
    // Get the last searched city from local storage
    const lastSearchedCity = searches[searches.length - 1];
  
    // Check if there is a last searched city and fetch its weather data
    if (lastSearchedCity) {
      getWeatherData(lastSearchedCity);
    }
  }

function getWeatherData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error fetching weather data: ' + response.status);
      }
      return response.json();
    })
    .then((data) => {
      const {
        name,
        weather: [{ main, description }],
        main: { temp, humidity },
        wind: { speed },
      } = data;

      cityName.textContent = name;
      currentDate.textContent = getCurrentDate();
      emojiWeather.innerHTML = getWeatherEmoji(main);
      currentTemp.textContent = Math.round(convertKelvinToFahrenheit(temp)) + ' °F';
      humidity.textContent = 'Humidity: ' + humidity + '%';
      windSpeed.textContent = 'Wind Speed: ' + convertMeterPerSecToMph(speed).toFixed(1) + ' mph';
      getForecastData(city);
    })
    .catch((error) => {
      console.log('Error fetching weather data:', error);
    });
}

function getForecastData(city) {
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
    fetch(forecastApiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error fetching forecast data: ' + response.status);
        }
        return response.json();
      })
      .then((data) => {
        const forecastList = data.list;
        const forecastCards = document.querySelectorAll('.card.day');
        let cardIndex = 0;
  
        forecastList.forEach((forecast) => {
          const date = forecast.dt_txt;
          const temperature = forecast.main.temp;
          const weather = forecast.weather[0].main;
          const windSpeed = forecast.wind.speed;
          const humidity = forecast.main.humidity;
  
          if (cardIndex < forecastCards.length) {
            const card = forecastCards[cardIndex];
            const dateElement = card.querySelector('.date');
            const weatherElement = card.querySelector('.emojiWeather');
            const tempElement = card.querySelector('.temp');
            const windSpeedElement = card.querySelector('.windSpeed');
            const humidityElement = card.querySelector('.humidity');
  
            dateElement.textContent = formatDate(date);
            weatherElement.innerHTML = getWeatherEmoji(weather);
            tempElement.textContent = Math.round(convertKelvinToFahrenheit(temperature)) + ' °F';
            windSpeedElement.textContent = 'Wind Speed: ' + convertMeterPerSecToMph(windSpeed).toFixed(1) + ' mph';
            humidityElement.textContent = 'Humidity: ' + humidity + '%';
  
            cardIndex++;
          }
        });
      })
      .catch((error) => {
        console.log('Error fetching forecast data:', error);
      });
  }
  function getWeatherEmoji(weather) {
    // Define the mapping of weather conditions to emojis
    const weatherEmojiMap = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Drizzle: '🌦️',
      Thunderstorm: '⛈️',
      Snow: '❄️',
    };
    // Return the corresponding emoji based on the weather condition
    return weatherEmojiMap[weather] || '';
  }

function getCurrentDate() {
  const now = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  return now.toLocaleDateString(undefined, options);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

function convertKelvinToFahrenheit(kelvin) {
  return ((kelvin - 273.15) * 9) / 5 + 32;
}

function convertMeterPerSecToMph(meterPerSec) {
  return meterPerSec * 2.237;
}

displayPreviousSearches();
