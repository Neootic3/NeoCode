// form & inputs
const form = document.getElementById("registerForm");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");

// form
form.addEventListener('submit',(e) => {
  e.preventDefault();
  // Login User
  loginUser(emailEl.value, passwordEl.value);
});

// Show errors
function showError(input, message) {
    const errorSpan = input.nextElementSibling;
    errorSpan.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>'+message;
    errorSpan.style.display = "block";
    input.classList.add("invalid");
    // shake animation
    errorSpan.classList.remove("shake");
    void errorSpan.offsetWidth;
    errorSpan.classList.add("shake");
};

// Clear errors
function clearError(input) {
    const errorSpan = input.nextElementSibling;
    errorSpan.style.display = "none";
    input.classList.remove("invalid");
};

// Login User
async function loginUser(email, password) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      console.log('User Logged in:', data.user);
    } else {
      console.error('Login error:', data.message);
      showError(emailEl, data.message)
    }

  } catch (err) {
    showError(emailEl, err)
  }
}