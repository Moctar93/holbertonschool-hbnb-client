document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const placesList = document.getElementById('places-list');
    const loginLink = document.getElementById('login-link');
    const countryFilter = document.getElementById('country-filter');
    const addReviewForm = document.getElementById('review-form');
    const placeDetailsSection = document.getElementById('place-details');
    const reviewsSection = document.getElementById('reviews');
    const addReviewSection = document.getElementById('add-review');

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
            window.location.href = 'index.html';
        } else {
            loginLink.style.display = 'none';
            return token;
        }
    }

    // Fetch places data from the API
    async function fetchPlaces(token) {
        try {
            const response = await fetch('https://localhost/5000/places', {
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

    // Fetch place details from the API
    async function fetchPlaceDetails(token, placeId) {
        try {
            const response = await fetch(`https://localhost/5000/places/${placeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const place = await response.json();
            displayPlaceDetails(place);
        } catch (error) {
            console.error('Error fetching place details:', error);
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
                <button class="details-button" onclick="location.href='place.html?id=${place.id}'">View Details</button>
            `;
            placesList.appendChild(placeCard);
        });
    }

    // Display the place details data
    function displayPlaceDetails(place) {
        placeDetailsSection.querySelector('h1').textContent = place.name;
        placeDetailsSection.querySelector('.place-image-large').src = place.image_url;
        placeDetailsSection.querySelector('.place-info').innerHTML = `
            <p><strong>Host:</strong> ${place.host}</p>
            <p><strong>Price:</strong> $${place.price} per night</p>
            <p><strong>Location:</strong> ${place.city}, ${place.country}</p>
            <p><strong>Description:</strong> ${place.description}</p>
            <p><strong>Amenities:</strong> ${place.amenities.join(', ')}</p>
        `;

        displayReviews(place.reviews);
    }

    // Display the reviews data
    function displayReviews(reviews) {
        reviewsSection.innerHTML = '<h2>Reviews</h2>';
        reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';
            reviewCard.innerHTML = `
                <p><strong>User:</strong> ${review.user}</p>
                <p><strong>Comment:</strong> ${review.comment}</p>
                <p class="review-rating">Rating: ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</p>
            `;
            reviewsSection.appendChild(reviewCard);
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await loginUser(email, password);

                if (response.ok) {
                    const data = await response.json();
                    document.cookie = `token=${data.access_token}; path=/`;
                    window.location.href = 'index.html';
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
        return fetch('https://localhost/5000/login', {
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

    // Handle add review form submission
    if (addReviewForm) {
        addReviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const reviewText = document.getElementById('review-text').value;
            const reviewRating = document.getElementById('review-rating').value;
            const placeId = getPlaceIdFromURL();
            const token = checkAuthentication();

            try {
                const response = await fetch(`https://localhost/5000/places/${placeId}/reviews`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ comment: reviewText, rating: reviewRating })
                });

                if (response.ok) {
                    alert('Review submitted successfully!');
                    addReviewForm.reset();
                    fetchPlaceDetails(token, placeId);
                } else {
                    const errorData = await response.json();
                    alert(`Failed to submit review: ${errorData.message || response.statusText}`);
                }
            } catch (error) {
                alert('Error adding review. Please try again.');
                console.error('Error adding review:', error);
            }
        });
    }

    // Function to get the place ID from the URL
    function getPlaceIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    // Initialize authentication check and data fetch
    checkAuthentication();
});

