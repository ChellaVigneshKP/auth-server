document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const submitBtn = document.getElementById("submit-button");

    const fields = {
        name: document.getElementById("name-input"),
        email: document.getElementById("email-input"),
        phone: document.getElementById("phone-input"),
        password: document.getElementById("password-input"),
        confirmPassword: document.getElementById("confirm-password-input")
    };

    const containers = {
        phone: document.getElementById("phone-input-container"),
        email: document.getElementById("email-input-container")
    };

    // Create and store error divs
    const errorDivs = {};
    Object.keys(fields).forEach(key => {
        const input = fields[key];
        const div = document.createElement("div");
        div.className = "field-error text-red-600 text-sm mt-1 hidden";
        input.closest(".form-group").appendChild(div);
        errorDivs[key] = div;
    });

    // Track blurred state
    const blurred = {};
    Object.keys(fields).forEach(k => blurred[k] = false);

    // Enable/disable submit button
    function setSubmitState(enabled) {
        submitBtn.disabled = !enabled;
        submitBtn.style.opacity = enabled ? "1" : "0.6";
        submitBtn.style.cursor = enabled ? "pointer" : "not-allowed";
    }
    setSubmitState(false);

    // Centralized validation rules
    const fieldRules = {
        name: {
            required: "Name is required.",
            validate: v => /^[a-zA-Z\s]{2,}$/.test(v.trim()),
            invalidMsg: "Name must be at least 2 letters."
        },
        email: {
            required: "Email is required.",
            validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
            invalidMsg: "Enter a valid email address.",
            hiddenCheck: () => containers.email.classList.contains("hidden")
        },
        phone: {
            required: "Phone number is required.",
            validate: () => {
                if (!containers.phone || containers.phone.classList.contains("hidden")) return true;
                if (!window.isPhoneReady || !window.getPhoneInstance) return false;
                return window.getPhoneInstance().isValidNumber();
            },
            invalidMsg: "Enter a valid phone number.",
            hiddenCheck: () => containers.phone.classList.contains("hidden")
        },
        password: {
            required: "Password is required.",
            validate: v => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(v),
            strengthCheck: v => zxcvbn(v).score >= 3,
            invalidMsg: "Password must be 8+ chars, include upper, lower, number & symbol.",
            weakMsg: "Password strength must be at least Good."
        },
        confirmPassword: {
            required: "Please confirm your password.",
            validate: () => fields.confirmPassword.value === fields.password.value,
            invalidMsg: "Passwords do not match."
        }
    };

    // Check a single field
    function checkField(key, value) {
        const rule = fieldRules[key];
        const errorDiv = errorDivs[key];
        if (!rule || !errorDiv) return true;

        let valid = true;
        let message = "";

        if (rule.hiddenCheck?.()) {
            valid = true;
        } else if (!value.trim()) {
            valid = false;
            message = rule.required;
        } else if (!rule.validate(value)) {
            valid = false;
            message = rule.invalidMsg;
        } else if (rule.strengthCheck && !rule.strengthCheck(value)) {
            valid = false;
            message = rule.weakMsg;
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

    // Validate all fields
    function validateAll() {
        const allValid = Object.keys(fields).every(key => {
            const value = fields[key] ? fields[key].value : "";
            return checkField(key, value);
        });
        setSubmitState(allValid);
        return allValid;
    }

    window.validateAll = validateAll;

    // Attach listeners
    Object.keys(fields).forEach(key => {
        const input = fields[key];
        if (!input) return;

        input.addEventListener("input", () => {
            if (blurred[key]) checkField(key, input.value);
            validateAll();
        });

        input.addEventListener("blur", () => {
            blurred[key] = true;
            checkField(key, input.value);
            validateAll();
        });
    });

    // Toggle contact fields
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

    // Form submit
    form.addEventListener("submit", e => {
        Object.keys(blurred).forEach(k => blurred[k] = true);
        const isValid = validateAll();
        if (!isValid) {
            e.preventDefault();
            const firstError = document.querySelector(".field-error:not(.hidden)");
            if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });

    // Initial delayed validation
    setTimeout(validateAll, 1500);
    setTimeout(validateAll, 3000);
});