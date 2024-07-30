document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const placesList = document.getElementById('places-list');
    const loginLink = document.getElementById('login-link');
    const countryFilter = document.getElementById('country-filter');

    // Function to get a cookie value by its name
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Check user authentication
    function checkAuthentication() {
        const token = getCookie('token');

        if (!token) {
            loginLink.style.display = 'block';
        } else {
            loginLink.style.display = 'none';
            fetchPlaces(token);
        }
    }

    // Fetch places data from the API
    async function fetchPlaces(token) {
        try {
            const response = await fetch('https://your-api-url/places', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const places = await response.json();
            displayPlaces(places);
        } catch (error) {
            console.error('Error fetching places:', error);
        }
    }

    // Display the places data
    function displayPlaces(places) {
        placesList.innerHTML = ''; // Clear existing list

        places.forEach(place => {
            const placeCard = document.createElement('div');
            placeCard.className = 'place-card';
            placeCard.innerHTML = `
                <h2>${place.name}</h2>
                <p>Price by night: ${place.price}</p>
                <p>Location: ${place.city}, ${place.country}</p>
                <p>${place.description}</p>
            `;
            placesList.appendChild(placeCard);
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();  // Prevent default form submission

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await loginUser(email, password);

                if (response.ok) {
                    const data = await response.json();
                    document.cookie = `token=${data.access_token}; path=/`;  // Store the token in a cookie
                    window.location.href = 'index.html';  // Redirect to the main page
                } else {
                    const errorData = await response.json();
                    errorMessage.textContent = `Login failed: ${errorData.message || response.statusText}`;
                }
            } catch (error) {
                errorMessage.textContent = 'An error occurred. Please try again.';
            }
        });
    }

    // Fetch login credentials
    async function loginUser(email, password) {
        return fetch('https://your-api-url/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
    }

    // Client-side filtering of places by country
    if (countryFilter) {
        countryFilter.addEventListener('change', (event) => {
            const selectedCountry = event.target.value;
            const placeCards = document.getElementsByClassName('place-card');

            Array.from(placeCards).forEach(card => {
                const placeLocation = card.querySelector('p:nth-child(3)').innerText;
                if (selectedCountry === 'all' || placeLocation.includes(selectedCountry)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Initialize authentication check and data fetch
    checkAuthentication();
});
