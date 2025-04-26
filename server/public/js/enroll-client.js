// Select the form
const enrollForm = document.querySelector('.form-container .form');

// Function to populate programs datalist
async function populatePrograms() {
    const programList = document.getElementById('program-list');
    try {
        const response = await fetch('/programs', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch programs');
        }
        const programs = await response.json();
        console.log('Fetched programs:', programs);
        programList.innerHTML = '';
        programs.forEach(program => {
            const option = document.createElement('option');
            option.value = program.name;
            option.textContent = program.name;
            programList.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching programs:', error);
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = 'Failed to load programs. Try again.';
            errorMessage.style.color = 'red';
        }
    }
}

// Initialize datalist on page load
document.addEventListener('DOMContentLoaded', () => {
    populatePrograms();
});

enrollForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Grab user inputs
    const clientContact = document.getElementById('client-contact').value.trim();
    const programName = document.getElementById('program-name').value.trim();
    console.log('Submitting:', { clientContact, programName });

    // Define errorMessage element
    const errorMessage = document.getElementById('error-message');

    try {
        const response = await fetch('/enroll-client', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clientContact, programName }),
        });

        const result = await response.json();
        console.log('Server response:', result);

        if (result.success) {
            console.log('Client enrolled successfully, enrollment ID:', result.enrollment_id);
            errorMessage.textContent = result.message || 'Client enrolled successfully';
            errorMessage.style.color = 'green';
            enrollForm.reset();
            // Optional: Redirect
            // window.location.href = '/search-client';
        } else {
            console.log('Error from server:', result.message);
            errorMessage.textContent = result.message || 'Failed to enroll client';
            errorMessage.style.color = 'red';
        }
    } catch (error) {
        console.error('Submission error:', error);
        errorMessage.textContent = 'Failed to connect to the server. Try again.';
        errorMessage.style.color = 'red';
    }
});