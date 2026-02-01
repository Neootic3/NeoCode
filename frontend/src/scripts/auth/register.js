// form & inputs
const form = document.getElementById("registerForm");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");

// Popup
const popup = document.getElementById("emailPopup");
const closePopupBtn = document.getElementById("closePopup");

// Popup
closePopupBtn.addEventListener('click',() => {
  popup.classList.remove('visible')
});

// form
form.addEventListener('submit',(e) => {
  e.preventDefault();




  // Validate Credentials
  if (!validatePassword() && !validateEmail() && !validateUsername()) {
    return;
  };

  // Create User
  registerUser(username.value, email.value, password.value);
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

// Validate username
function validateUsername() {
    const value = username.value.trim();
    if (value.length < 3 || value.length > 10) {
        showError(username, "Username must be 3-10 characters");
        return false;
    }
    clearError(username);
    return true;
};

// Validate email
function validateEmail() {
    const value = email.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        showError(email, "Please enter a valid email");
        return false;
      }
    clearError(email)
    return true;
  };

// Validate password
function validatePassword() {
    const value = password.value.trim();
    const passRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>[\]\\\/~`_\-+=;']).*$/;
      if (value.length < 6 || value.toLowerCase === "password" || !passRegex.test(value)) {
          showError(password, "Please Include Special Characters and Numbers.");
          return false;
      };
    clearError(password)
    return true;
  };

// Create User
async function registerUser(username, email, password) {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (data.success) {
      console.log('User created:', data.user);
      console.log('Verify token:', data.verifyToken);
      popup.classList.add('visible');
    } else {
      console.error('Registration error:', data.message);
      alert("Registration Failed, Try again.");
    }

  } catch (err) {
    console.error('Network error:', err);
    alert('Something went wrong. Try again.');
  }
}