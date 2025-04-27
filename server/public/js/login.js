const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent form from doing normal submit

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
            
        });

        const result = await response.json();

        if (result.success) {
            window.location.href = result.redirectUrl;
        } else {
            errorMessage.textContent = 'Invalid login credentials';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'Server error. Try again.';
    }
});
