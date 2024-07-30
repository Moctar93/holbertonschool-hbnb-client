document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

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
});

async function loginUser(email, password) {
    return fetch('https://localhost:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
}

