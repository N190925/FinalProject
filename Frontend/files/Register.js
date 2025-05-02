document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    const passwordInput = document.getElementById("password");
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
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const userName = document.getElementById("userName").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
  
      // Basic validation
      if (!userName || !email || !password) {
        alert("All fields are required.");
        console.warn("❌ Validation failed: Missing fields");
        return;
      }
  
      if (!/^[a-zA-Z0-9]+$/.test(userName)) {
        alert("Username can only contain letters and numbers.");
        console.warn("❌ Validation failed: Invalid username format");
        return;
      }
  
      if (!/\S+@\S+\.\S+/.test(email)) {
        alert("Please enter a valid email address.");
        console.warn("❌ Validation failed: Invalid email format");
        return;
      }
  
      if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        console.warn("❌ Validation failed: Password too short");
        return;
      }

      const payload = { userName, email, password };
      console.log("📤 Sending registration request with payload:", payload);
  
      fetch("http://192.168.172.124:8989/errordetector/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then((res) => {
          console.log("🌐 Server response status:", res.status);
  
          // If the response status is 200 or 201, no need to parse the body
          if (res.ok) {
            alert("Registration successful. Please log in.");
            console.log("✅ Registration successful.");
            window.location.href = "Login.html";
          } else {
            // Only parse response if it's not 200/201
            return res.text().then((data) => {
              alert("Registration failed: " + (data || "Unknown error"));
              console.error("❌ Error message from server:", data);
            });
          }
        })
        .catch((error) => {
          console.error("❌ Registration error:", error);
          alert("Registration failed: " + error.message);
        });
    });
});