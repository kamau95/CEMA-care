console.log('search-client.js loaded');

// Select the form
const searchForm = document.querySelector('.form-container .form');
const errorMessage = document.getElementById('error-message');

console.log('searchForm:', searchForm);
if (!searchForm || !errorMessage) {
    console.error('Form or error message element not found');
}

// Handle form submission
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Search form submitted');

    // Grab user input
    const clientContact = document.getElementById('client-contact').value.trim();
    console.log('Searching for:', { clientContact });

    // Reset previous errors
    errorMessage.textContent = '';

    // Validate input
    if (!clientContact) {
        console.log('Validation failed: Client contact is required');
        errorMessage.textContent = 'Client contact is required';
        errorMessage.style.color = 'red';
        return;
    }
    const contactRegex = /^(\+?\d{10,15}|[\w.-]+@[\w.-]+\.\w+)$/;
    if (!contactRegex.test(clientContact)) {
        console.log('Validation failed: Invalid contact format');
        errorMessage.textContent = 'Contact must be a valid email or phone number';
        errorMessage.style.color = 'red';
        return;
    }

    // Debug: Log payload
    const payload = { clientContact };
    console.log('Sending payload:', JSON.stringify(payload));

    try {
        const response = await fetch('/search-client', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Non-JSON response:', response.status, response.statusText);
            errorMessage.textContent = 'Session expired. Please log in again.';
            errorMessage.style.color = 'red';
            return;
        }

        const result = await response.json();
        console.log('Server response:', result);

        if (result.success && result.clientId) {
            console.log('Client found, redirecting to:', `/client-profile/${result.clientId}`);
            window.location.href = `/client-profile/${result.clientId}`;
        } else {
            console.log('No client found:', result.message);
            errorMessage.textContent = result.message || 'No such client found';
            errorMessage.style.color = 'red';
        }
    } catch (error) {
        console.error('Search error:', error);
        errorMessage.textContent = 'Failed to connect to the server. Try again.';
        errorMessage.style.color = 'red';
    }
});