const programForm = document.querySelector('.form-container .form');

programForm.addEventListener("submit", async (e) => {
  e.preventDefault();
 

  //grab user inputs-medic maybe
  const programName = document.getElementById("program-name").value.trim();
  const treatment = document.getElementById("treatment").value.trim();
  const followUps = document.getElementById("follow-ups").value.trim();
  console.log('Submitting:', { programName, treatment, followUps });

  //the error element
  const errorMessage = document.getElementById('error-message'); 

  //try sending them to the database
  try {
    const response = await fetch("/create-program", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ programName, treatment, followUps }),
    });

    const result = await response.json();
    console.log("Server response:", result);

    if (result.success) {
      // Display success message and clear form
      document.getElementById("error-message").textContent = result.message || "Program created successfully";
      errorMessage.style.color = 'green';
      programForm.reset(); // Clear form fields
      // Optional: Redirect
      // window.location.href = '/search-client';
    } else {
      document.getElementById("error-message").textContent = result.message || "Failed to create program";
      errorMessage.style.color = 'red';
    }
  } catch (error) {
    console.error("Submission error:", error);
    document.getElementById("error-message").textContent = "Failed to connect to the server. Try again.";
  }
});
