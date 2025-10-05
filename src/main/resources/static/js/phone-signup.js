let iti;
let phoneInputInitialized = false;
let utilsLoaded = false;

document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("toggle-contact");
    const emailContainer = document.getElementById("email-input-container");
    const phoneContainer = document.getElementById("phone-input-container");
    const emailInput = document.getElementById("email-input");
    const phoneInput = document.getElementById("phone-input");

    if (!phoneInput) {
        return;
    }

    // 1️⃣ Fetch country & initialize phone input
    fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((data) =>
            initPhoneInput(data.country_code?.toLowerCase() || "us")
        )
        .catch(() => initPhoneInput("us"));

    function initPhoneInput(countryCode) {
        try {
            iti = window.intlTelInput(phoneInput, {
                initialCountry: countryCode,
                strictMode: true, // ✅ replaces manual keydown filter
                separateDialCode: true,
                preferredCountries: ["us", "in", "gb"],
                loadUtils: () =>
                    import(
                        "https://cdn.jsdelivr.net/npm/intl-tel-input@25.11.2/build/js/utils.js"
                        ),
            });

            window.iti = iti;
            window.phoneInput = phoneInput;

            if (iti.promise) {
                iti.promise
                    .then(() => {
                        phoneInputInitialized = true;
                        utilsLoaded = true;

                        if (window.validateAll) setTimeout(window.validateAll, 300);
                    })
                    .catch((err) => {
                        utilsLoaded = false;
                    });
            }

            attachDropdownListener();
        } catch (err) {
            phoneInputInitialized = false;
        }
    }

    // Expose phone state
    window.isPhoneReady = () => phoneInputInitialized && utilsLoaded;
    window.getPhoneInstance = () => iti;

    // Theme Sync
    const debounce = (fn, delay = 100) => {
        let timer;
        return () => {
            clearTimeout(timer);
            timer = setTimeout(fn, delay);
        };
    };

    const observer = new MutationObserver(debounce(updateDropdownTheme));
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
    });
    phoneInput.addEventListener("focus", () =>
        setTimeout(updateDropdownTheme, 50)
    );

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

        dropdown.querySelectorAll(".iti__country").forEach((el) => {
            el.style.color = textColor;
            el.style.backgroundColor = "transparent";
            el.onmouseenter = () => (el.style.backgroundColor = hoverBg);
            el.onmouseleave = () => (el.style.backgroundColor = "transparent");
        });

        const searchInput = dropdown.querySelector(".iti__search-input");
        if (searchInput) {
            searchInput.style.backgroundColor = isDark ? "#374151" : "#fff";
            searchInput.style.color = textColor;
            searchInput.style.borderColor = isDark ? "#4b5563" : "#ccc";
        }

        const clearBtn = dropdown.querySelector(".iti__search-clear");
        if (clearBtn) clearBtn.style.color = textColor;
    }

    function attachDropdownListener() {
        if (!iti) return;
        const selectedCountry =
            phoneInput.parentElement.querySelector(".iti__selected-country");
        if (selectedCountry) {
            selectedCountry.addEventListener("click", () =>
                setTimeout(updateDropdownTheme, 50)
            );
        }
    }

    // ❌ Removed manual keydown filter — handled by strictMode:true

    // Toggle Email ↔ Phone
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

            if (!phoneInputInitialized && !iti)
                setTimeout(() => initPhoneInput("us"), 100);
        }

        setTimeout(() => {
            if (window.validateAll) window.validateAll();
        }, 200);
    });
});