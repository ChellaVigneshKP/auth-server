document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const submitBtn = document.getElementById("submit-button");
    const nameInput = document.getElementById("name-input");
    const emailInput = document.getElementById("email-input");
    const phoneInput = document.getElementById("phone-input");
    const passwordInput = document.getElementById("password-input");
    const confirmPasswordInput = document.getElementById("confirm-password-input");
    const phoneContainer = document.getElementById("phone-input-container");
    const emailContainer = document.getElementById("email-input-container");

    // Error divs
    function createErrorDiv(input) {
        const div = document.createElement("div");
        div.className = "field-error text-red-600 text-sm mt-1 hidden";
        input.closest(".form-group").appendChild(div);
        return div;
    }

    const errorDivs = {
        name: createErrorDiv(nameInput),
        email: createErrorDiv(emailInput),
        phone: createErrorDiv(phoneInput),
        password: createErrorDiv(passwordInput),
        confirmPassword: createErrorDiv(confirmPasswordInput),
    };

    setSubmitState(false);

    function setSubmitState(enabled) {
        submitBtn.disabled = !enabled;
        submitBtn.style.opacity = enabled ? "1" : "0.6";
        submitBtn.style.cursor = enabled ? "pointer" : "not-allowed";
    }

    const blurred = {
        name: false,
        email: false,
        phone: false,
        password: false,
        confirmPassword: false,
    };

    // Validation functions
    const validate = {
        name: (v) => /^[a-zA-Z\s]{2,}$/.test(v.trim()),
        email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
        phone: () => {
            if (!phoneContainer || phoneContainer.classList.contains("hidden"))
                return true;
            if (!window.isPhoneReady || !window.getPhoneInstance) return false;

            const phoneInstance = window.getPhoneInstance();
            const fullNumber = phoneInstance.getNumber();
            const isValid = phoneInstance.isValidNumber();

            return isValid === true;
        },
        password: (v) =>
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(v),
        confirmPassword: () =>
            confirmPasswordInput.value === passwordInput.value,
        passwordStrength: (v) => zxcvbn(v).score >= 3,
    };

    function checkField(key, value) {
        const errorDiv = errorDivs[key];
        if (!errorDiv) return true;

        let valid = false;
        let message = "";

        switch (key) {
            case "name":
                valid = validate.name(value);
                if (!valid) message = "Name must be at least 2 letters.";
                break;
            case "email":
                if (!emailContainer.classList.contains("hidden")) {
                    valid = validate.email(value);
                    if (!valid) message = "Enter a valid email address.";
                } else valid = true;
                break;
            case "phone":
                if (phoneContainer && !phoneContainer.classList.contains("hidden")) {
                    if (!phoneInput.value.trim()) {
                        valid = false;
                        message = "Phone number is required.";
                    } else {
                        valid = validate.phone();
                        if (!valid) {
                            message = !window.isPhoneReady
                                ? "Phone validation initializing..."
                                : "Enter a valid phone number.";
                        }
                    }
                } else valid = true;
                break;
            case "password":
                valid = validate.password(value) && validate.passwordStrength(value);
                if (!validate.password(value))
                    message =
                        "Password must be 8+ chars, include upper, lower, number & symbol.";
                else if (!validate.passwordStrength(value))
                    message = "Password strength must be at least Good.";
                break;
            case "confirmPassword":
                valid = validate.confirmPassword();
                if (!valid) message = "Passwords do not match.";
                break;
        }

        if (!valid && blurred[key]) {
            errorDiv.textContent = message;
            errorDiv.classList.remove("hidden");
        } else {
            errorDiv.textContent = "";
            errorDiv.classList.add("hidden");
        }

        return valid;
    }

    function validateAll() {
        const values = {
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput ? phoneInput.value : "",
            password: passwordInput.value,
            confirmPassword: confirmPasswordInput.value,
        };

        const allValid = Object.keys(values).every((k) =>
            checkField(k, values[k])
        );
        setSubmitState(allValid);
        return allValid;
    }

    window.validateAll = validateAll;

    // Input & blur listeners
    [
        { input: nameInput, key: "name" },
        { input: emailInput, key: "email" },
        { input: phoneInput, key: "phone" },
        { input: passwordInput, key: "password" },
        { input: confirmPasswordInput, key: "confirmPassword" },
    ].forEach((f) => {
        if (!f.input) return;

        f.input.addEventListener("input", () => {
            if (blurred[f.key]) {
                checkField(f.key, f.input.value);
            }
            validateAll();
        });

        f.input.addEventListener("blur", () => {
            blurred[f.key] = true;
            checkField(f.key, f.input.value);
            validateAll();
        });
    });

    // Toggle contact
    const toggleBtn = document.getElementById("toggle-contact");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            setTimeout(() => {
                blurred.email = false;
                blurred.phone = false;
                validateAll();
            }, 300);
        });
    }

    // On form submit
    form.addEventListener("submit", (e) => {
        Object.keys(blurred).forEach((k) => (blurred[k] = true));
        const isValid = validateAll();
        if (!isValid) {
            e.preventDefault();
            const firstError = document.querySelector(".field-error:not(.hidden)");
            if (firstError)
                firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });

    // Initial delayed validation
    setTimeout(validateAll, 1500);
    setTimeout(validateAll, 3000);
});