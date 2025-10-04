document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("toggle-contact");
    const emailContainer = document.getElementById("email-input-container");
    const phoneContainer = document.getElementById("phone-input-container");
    const emailInput = document.getElementById("email-input");
    const phoneInput = document.getElementById("phone-input");

    const iti = window.intlTelInput(phoneInput, {
        initialCountry: "us",
        separateDialCode: true,
        preferredCountries: ["us", "in", "gb"],
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@25.11.2/build/js/utils.js"
    });

    toggleBtn.addEventListener("click", () => {
        if (emailContainer.classList.contains("hidden")) {
            // Switch to Email
            phoneContainer.classList.add("hidden");
            emailContainer.classList.remove("hidden");
            toggleBtn.textContent = "Use phone instead";

            emailInput.required = true;
            phoneInput.required = false;
        } else {
            // Switch to Phone
            emailContainer.classList.add("hidden");
            phoneContainer.classList.remove("hidden");
            toggleBtn.textContent = "Use email instead";

            phoneInput.required = true;
            emailInput.required = false;
        }
    });
});