const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');

const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryimg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');

const forecastItemsContainer = document.querySelector('.forecast-items-container');

const apiKey = '0f62f2a1652732077790834ec71a01d6';
const baseUrl = 'https://api.openweathermap.org/data/2.5/';

let isFahrenheit = false;

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() !== '') {
        handleWeatherSearch(cityInput.value);
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityInput.value.trim() !== '') {
        handleWeatherSearch(cityInput.value);
    }
});

function handleWeatherSearch(city) {
    setLoading(true);
    updateWeatherInfo(city.trim());
    cityInput.value = '';
    cityInput.blur();
}

async function getFetchData(endpoint, city) {
    const apiUrl = `${baseUrl}${endpoint}?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    return 'clouds.svg';
}

function getCurrentDate() {
    const currentDate = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    };
    return currentDate.toLocaleDateString('en-GB', options);
}

function convertTemp(temp, toFahrenheit = false) {
    return toFahrenheit ? Math.round((temp * 9) / 5 + 32) : Math.round(temp);
}

function setLoading(isLoading) {
    searchBtn.disabled = isLoading;
    searchBtn.textContent = isLoading ? 'Loading...' : 'Search';
}

async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);

    if (!weatherData || weatherData.cod !== 200) {
        toggleSections(notFoundSection);
        setLoading(false);
        return;
    }

    const {
        name: cityName,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed }
    } = weatherData;

    countryTxt.textContent = cityName;
    tempTxt.textContent = `${convertTemp(temp, isFahrenheit)} ${isFahrenheit ? '℉' : '℃'}`;
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = `${humidity}%`;
    windValueTxt.textContent = `${speed} M/s`;

    currentDateTxt.textContent = getCurrentDate();
    weatherSummaryimg.src = `assets/assets/weather/${getWeatherIcon(id)}`;

    await updateForecastsInfo(city);
    toggleSections(weatherInfoSection);
    setLoading(false);
}

async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city);

    if (!forecastsData || !forecastsData.list || forecastsData.list.length === 0) {
        forecastItemsContainer.innerHTML = '<p>No forecast data available.</p>';
        return;
    }

    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];

    forecastItemsContainer.innerHTML = '';
    forecastsData.list.forEach((forecastWeather) => {
        if (
            forecastWeather.dt_txt.includes(timeTaken) &&
            !forecastWeather.dt_txt.includes(todayDate)
        ) {
            updateForecastItems(forecastWeather);
        }
    });
}

function updateForecastItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData;

    const dateTaken = new Date(date);
    const dateOption = {
        day: '2-digit',
        month: 'short'
    };
    const dateResult = dateTaken.toLocaleDateString('en-GB', dateOption);

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="assets/assets/weather/${getWeatherIcon(id)}" class="forecast-item-img">
            <h5 class="forecast-item-temp">${convertTemp(temp, isFahrenheit)} ${isFahrenheit ? '℉' : '℃'}</h5>
        </div>
    `;

    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

function toggleSections(showSection) {
    const sections = [weatherInfoSection, searchCitySection, notFoundSection];
    sections.forEach((section) => {
        section.style.display = section === showSection ? 'flex' : 'none';
    });
}

// Fahrenheit/Celsius toggle button logic
document.querySelector('.toggle-temp-btn').addEventListener('click', () => {
    isFahrenheit = !isFahrenheit;
    const cityName = countryTxt.textContent;
    if (cityName) {
        updateWeatherInfo(cityName);
    }
});
