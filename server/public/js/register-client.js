const clientForm = document.querySelector('.form-container .form');


clientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submitted');

    // Grab user inputs
    const clientName = document.getElementById('client-name').value.trim();
    const age = document.getElementById('client-age').value.trim();
    const gender = document.getElementById('client-gender').value.trim();
    const contact = document.getElementById('client-contact').value.trim();
    console.log('Submitting:', { clientName, age, gender, contact });

    // Define errorMessage element
    const errorMessage = document.getElementById('error-message');

    if (!age || isNaN(age) || age < 0) {
        console.log('Client validation failed: Valid age is required');
        errorMessage.textContent = 'Valid age is required';
        errorMessage.style.color = 'red';
        return;
    }
 
    //send data to the server
    try {
        const response = await fetch('/register-client', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clientName, age, gender, contact }),
        });


        const result = await response.json();
        console.log('Server response:', result);

        if (result.success) {
            console.log('Client registered successfully, ID:', result.id);
            errorMessage.textContent = result.message || 'Client registered successfully';
            errorMessage.style.color = 'green';
            clientForm.reset();
            // Optional: Redirect
            // window.location.href = '/search-client';
        } else {
            console.log('Error from server:', result.message);
            errorMessage.textContent = result.message || 'Failed to register client';
            errorMessage.style.color = 'red';
        }
    } catch (error) {
        console.error('Submission error:', error);
        errorMessage.textContent = 'Failed to connect to the server. Try again.';
        errorMessage.style.color = 'red';
    }
});