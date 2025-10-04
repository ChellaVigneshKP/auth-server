// Password strength indicator
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password-input');
    const togglePassword = document.getElementById('toggle-password');
    const strengthContainer = document.getElementById('password-strength-container');
    const strengthBar = document.getElementById('password-strength-bar');
    const strengthText = document.getElementById('password-strength-text');
    const feedbackDiv = document.getElementById('password-feedback');

    passwordInput.addEventListener('input', function () {
        const password = this.value.trim();

        // Show/Hide toggle and meter only if user has typed something
        const isEmpty = password.length === 0;
        togglePassword.classList.toggle('hidden', isEmpty);
        strengthContainer.classList.toggle('hidden', isEmpty);

        if (isEmpty) {
            // Reset when empty
            strengthBar.style.width = '0%';
            strengthBar.style.backgroundColor = '';
            strengthText.textContent = '';
            feedbackDiv.textContent = '';
            passwordInput.style.borderColor = '';
            return;
        }

        const result = zxcvbn(password);
        const score = result.score; // 0–4

        const strengthMap = [
            { label: 'Very Weak', color: '#ef4444', width: '20%' },
            { label: 'Weak', color: '#f97316', width: '40%' },
            { label: 'Fair', color: '#eab308', width: '60%' },
            { label: 'Good', color: '#10b981', width: '80%' },
            { label: 'Strong', color: '#22c55e', width: '100%' }
        ];

        const { label, color, width } = strengthMap[score];

        // Update strength bar and label
        strengthBar.style.width = width;
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = `Strength: ${label}`;
        strengthText.style.color = color;
        passwordInput.style.borderColor = color;

        // Show suggestions only when not strong
        if (score < 4 && result.feedback.suggestions.length > 0) {
            feedbackDiv.textContent = result.feedback.suggestions.join(' ');
            feedbackDiv.style.color = color;
        } else {
            feedbackDiv.textContent = '';
        }
    });

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.textContent = type === 'password' ? 'Show' : 'Hide';
    });
});