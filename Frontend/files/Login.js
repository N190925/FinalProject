document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");
    const passwordToggle = document.getElementById("passwordToggle");

    // Password Toggle Show/Hide
    passwordToggle.addEventListener("click", () => {
        const type = passwordInput.type === "password" ? "text" : "password";
        passwordInput.type = type;
        passwordToggle.innerHTML =
            type === "password"
                ? '<ion-icon name="eye-outline"></ion-icon>'
                : '<ion-icon name="eye-off-outline"></ion-icon>';
        console.log("Password visibility toggled. Current type:", type);
    });

    // Login Validation Logic
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        console.log("Submitted Email:", email);
        console.log("Submitted Password:", password);

        let isValid = true;

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            emailError.textContent = "Please enter a valid email.";
            console.warn("Invalid email format.");
            isValid = false;
        }

        if (password.length < 6) {
            passwordError.textContent = "Password must be at least 6 characters long.";
            console.warn("Password too short.");
            isValid = false;
        } else if (!/[a-z]/.test(password)) {
            passwordError.textContent = "Password must contain at least one lowercase letter.";
            console.warn("Password missing lowercase letter.");
            isValid = false;
        } else if (!/[A-Z]/.test(password)) {
            passwordError.textContent = "Password must contain at least one uppercase letter.";
            console.warn("Password missing uppercase letter.");
            isValid = false;
        } else if (!/\d/.test(password)) {
            passwordError.textContent = "Password must contain at least one number.";
            console.warn("Password missing number.");
            isValid = false;
        } else if (!/[@$!%*?&]/.test(password)) {
            passwordError.textContent = "Password must contain at least one special character (@$!%*?&).";
            console.warn("Password missing special character.");
            isValid = false;
        }

        if (!isValid) {
            console.log("Validation failed. Login request aborted.");
            return;
        }

        console.log("Sending login request to server...");

        fetch("http://192.168.172.124:8989/errordetector/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        })
        .then(res => {
            console.log("Login fetch response:", res);
            if (res.status === 200) {
                console.log("Login successful.");
                localStorage.setItem('isLoggedIn', 'true');

                // Second fetch, just check for 200 OK, no JSON needed
                console.log("Attempting to send email to the second URL...");
                return fetch(`http://192.168.172.124:8989/errordetector/send?email=${encodeURIComponent(email)}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            } else {
                throw new Error("Invalid credentials!");
            }
        })
        .then(response => {
            console.log("Second fetch response status:", response.status);
        
            if (response.ok) {
                window.location.href = "Layout.html";
            } else {
                throw new Error("Second fetch failed with status " + response.status);
            }
        })
        .catch((error) => {
            console.error("Login or second fetch error:", error);
        });
    });
});
