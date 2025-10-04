document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("toggle-contact");
    const emailContainer = document.getElementById("email-input-container");
    const phoneContainer = document.getElementById("phone-input-container");
    const emailInput = document.getElementById("email-input");
    const phoneInput = document.getElementById("phone-input");

    let iti;

    // 1️⃣ Initialize intl-tel-input after fetching country
    fetch("https://ipapi.co/json/")
        .then(res => res.json())
        .then(data => initPhoneInput(data.country_code ? data.country_code.toLowerCase() : "us"))
        .catch(err => {
            console.error("Failed to fetch country:", err);
            initPhoneInput("us");
        });

    function initPhoneInput(countryCode) {
        iti = window.intlTelInput(phoneInput, {
            initialCountry: countryCode,
            separateDialCode: true,
            preferredCountries: ["us", "in", "gb"],
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@25.11.2/build/js/utils.js",
        });

        // Attach event listener for dropdown after iti init
        attachDropdownListener();
    }

    function attachDropdownListener() {
        const selectedCountry = phoneInput.parentElement.querySelector(".iti__selected-country");
        if (selectedCountry) {
            selectedCountry.addEventListener("click", () => setTimeout(updateDropdownTheme, 50));
        }
    }

    // 2️⃣ Restrict to numbers only
    phoneInput.addEventListener("keydown", (e) => {
        const allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab", "Home", "End"];
        if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) e.preventDefault();
    });

    phoneInput.addEventListener("input", () => {
        phoneInput.value = phoneInput.value.replace(/\D/g, "");
    });

    // 3️⃣ Toggle between phone and email
    toggleBtn.addEventListener("click", () => {
        const isPhoneVisible = !phoneContainer.classList.contains("hidden");
        if (isPhoneVisible) {
            phoneContainer.classList.add("hidden");
            emailContainer.classList.remove("hidden");
            toggleBtn.textContent = "Use phone instead";
            emailInput.required = true;
            phoneInput.required = false;
        } else {
            emailContainer.classList.add("hidden");
            phoneContainer.classList.remove("hidden");
            toggleBtn.textContent = "Use email instead";
            phoneInput.required = true;
            emailInput.required = false;
        }
    });

    // 4️⃣ Theme syncing with debounce
    const debounce = (fn, delay = 100) => {
        let timer;
        return () => {
            clearTimeout(timer);
            timer = setTimeout(fn, delay);
        };
    };
    const observer = new MutationObserver(debounce(updateDropdownTheme));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // 5️⃣ Apply theme when dropdown opens
    phoneInput.addEventListener("focus", () => setTimeout(updateDropdownTheme, 50));

    function updateDropdownTheme() {
        if (!iti) return;

        const dropdown = document.querySelector(".iti__dropdown-content");
        if (!dropdown) return;

        const isDark = document.documentElement.classList.contains("dark");

        const bg = isDark ? "#1f2937" : "#fff";
        const textColor = isDark ? "#f9fafb" : "#111";
        const hoverBg = isDark ? "#374151" : "#f0f0f0";

        dropdown.style.backgroundColor = bg;
        dropdown.style.color = textColor;

        dropdown.querySelectorAll(".iti__country").forEach(el => {
            el.style.color = textColor;
            el.style.backgroundColor = "transparent";

            el.onmouseenter = () => el.style.backgroundColor = hoverBg;
            el.onmouseleave = () => el.style.backgroundColor = "transparent";
        });

        const searchInput = dropdown.querySelector(".iti__search-input");
        if (searchInput) {
            searchInput.style.backgroundColor = isDark ? "#374151" : "#fff";
            searchInput.style.color = isDark ? "#f9fafb" : "#111";
            searchInput.style.borderColor = isDark ? "#4b5563" : "#ccc";
        }

        const clearBtn = dropdown.querySelector(".iti__search-clear");
        if (clearBtn) clearBtn.style.color = isDark ? "#f9fafb" : "#111";
    }
});