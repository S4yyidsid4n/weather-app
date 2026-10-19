
const API_KEY = "2a007e69fdc4a41114abe0dac474b16a";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const themeBtn = document.getElementById("themeBtn");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("errorMsg");
const weatherCard = document.getElementById("weatherCard");
const favoritesList = document.getElementById("favoritesList");

let currentCity = "";
let timer;


// 1. GET WEATHER DATA
async function getWeather(city) {
    const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    const response = await fetch(url);

    if (response.status === 404) {
        throw new Error("City not found. Please enter a valid city.");
    }

    if (response.status === 401) {
        throw new Error("Invalid API key. Please check your API key.");
    }

    if (!response.ok) {
        throw new Error("Unable to get weather. Please try again.");
    }

    const data = await response.json();

    return {
        city: data.name,
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed
    };
}


async function searchWeather(city = cityInput.value.trim()) {
    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    errorMsg.textContent = "";
    loading.textContent = "Loading weather...";
    loading.style.display = "block";
    weatherCard.style.display = "none";

    try {
        const weather = await getWeather(city);

        currentCity = weather.city;

        weatherCard.innerHTML = `
            <h2>${weather.city}</h2>
            <h1>${weather.temp}°C</h1>
            <p>Feels like: ${weather.feelsLike}°C</p>
            <p>Weather: ${weather.description}</p>
            <p>Humidity: ${weather.humidity}%</p>
            <p>Wind speed: ${weather.windSpeed} m/s</p>
            <button id="favoriteBtn">⭐ Add Favorite</button>
        `;

        weatherCard.style.display = "block";

        document
            .getElementById("favoriteBtn")
            .addEventListener("click", () => {
                addFavorite(currentCity);
            });

    } catch (error) {
        showError(error.message);

    } finally {
        loading.style.display = "none";
    }
}


function showError(message) {
    errorMsg.textContent = message;
}


function addFavorite(city) {
    if (!city) return;

    const favorites = JSON.parse(
        localStorage.getItem("favorites") || "[]"
    );

    // Prevent duplicate favorite cities.
    if (favorites.includes(city)) {
        alert("This city is already in your favorites.");
        return;
    }

    favorites.push(city);

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    loadFavorites();
}


function loadFavorites() {
    const favorites = JSON.parse(
        localStorage.getItem("favorites") || "[]"
    );

    favoritesList.innerHTML = "";

    favorites.forEach(city => {
        const item = document.createElement("div");

        const viewButton = document.createElement("button");
        viewButton.textContent = city;

        viewButton.addEventListener("click", () => {
            cityInput.value = city;
            searchWeather(city);
        });

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", () => {
            const updatedFavorites = favorites.filter(
                favorite => favorite !== city
            );

            localStorage.setItem(
                "favorites",
                JSON.stringify(updatedFavorites)
            );

            loadFavorites();
        });

        item.append(viewButton, removeButton);
        favoritesList.appendChild(item);
    });
}


function debounceSearch() {
    clearTimeout(timer);

    timer = setTimeout(() => {
        const city = cityInput.value.trim();

        if (city) {
            searchWeather(city);
        }
    }, 500);
}


function loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";

    if (savedTheme === "dark") {
        document.body.style.backgroundColor = "#222";
        document.body.style.color = "white";
        themeBtn.textContent = "☀️ Light Mode";
    } else {
        document.body.style.backgroundColor = "white";
        document.body.style.color = "black";
        themeBtn.textContent = "🌙 Dark Mode";
    }
}


function toggleTheme() {
    const currentTheme = localStorage.getItem("theme") || "light";

    const newTheme =
        currentTheme === "dark" ? "light" : "dark";

    localStorage.setItem("theme", newTheme);

    loadTheme();
}


document.addEventListener("DOMContentLoaded", function () {

    searchBtn.addEventListener("click", () => {
        searchWeather();
    });

    cityInput.addEventListener("input", debounceSearch);

    themeBtn.addEventListener("click", toggleTheme);

    // Load saved favorites and theme when the page opens.
    loadFavorites();
    loadTheme();

    loading.style.display = "none";
    errorMsg.textContent = "";
});

