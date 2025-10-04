const translations = {
    en: {
        title: "Create Account",
        subtitle: "Join C-Cloud to centralize your VMs at Single Sign-On",
        name: "Name",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        createAccount: "Create Account",
        orSignUp: "Or sign up with",
        alreadyAccount: "Already have an account?",
        login: "Log in",
        footer: "By signing up, you agree to our Terms of Service and Privacy Policy.",
        help: "Help Center",
        status: "Status",
        blog: "Blog",
        currentLang: "English"
    }, es: {
        title: "Crear Cuenta",
        subtitle: "Únete a C-Cloud para centralizar tus máquinas virtuales con inicio de sesión único",
        name: "Nombre",
        email: "Correo electrónico",
        password: "Contraseña",
        confirmPassword: "Confirmar Contraseña",
        createAccount: "Crear Cuenta",
        orSignUp: "O regístrate con",
        alreadyAccount: "¿Ya tienes una cuenta?",
        login: "Iniciar Sesión",
        footer: "Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad.",
        help: "Centro de Ayuda",
        status: "Estado",
        blog: "Blog",
        currentLang: "Español"
    }, fr: {
        title: "Créer un Compte",
        subtitle: "Rejoignez C-Cloud pour centraliser vos machines virtuelles avec l'authentification unique",
        name: "Nom",
        email: "E-mail",
        password: "Mot de passe",
        confirmPassword: "Confirmer le mot de passe",
        createAccount: "Créer un Compte",
        orSignUp: "Ou inscrivez-vous avec",
        alreadyAccount: "Vous avez déjà un compte ?",
        login: "Se connecter",
        footer: "En vous inscrivant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.",
        help: "Centre d'Aide",
        status: "Statut",
        blog: "Blog",
        currentLang: "Français"
    }, de: {
        title: "Konto Erstellen",
        subtitle: "Treten Sie C-Cloud bei, um Ihre VMs mit Single Sign-On zu zentralisieren",
        name: "Name",
        email: "E-Mail",
        password: "Passwort",
        confirmPassword: "Passwort Bestätigen",
        createAccount: "Konto Erstellen",
        orSignUp: "Oder registrieren Sie sich mit",
        alreadyAccount: "Haben Sie bereits ein Konto?",
        login: "Anmelden",
        footer: "Mit der Registrierung stimmen Sie unseren Nutzungsbedingungen und Datenschutzbestimmungen zu.",
        help: "Hilfe-Center",
        status: "Status",
        blog: "Blog",
        currentLang: "Deutsch"
    }, zh: {
        title: "创建账户",
        subtitle: "加入 C-Cloud，通过单点登录集中管理您的虚拟机",
        name: "姓名",
        email: "电子邮件",
        password: "密码",
        confirmPassword: "确认密码",
        createAccount: "创建账户",
        orSignUp: "或使用以下方式注册",
        alreadyAccount: "已有账户？",
        login: "登录",
        footer: "注册即表示您同意我们的服务条款和隐私政策。",
        help: "帮助中心",
        status: "状态",
        blog: "博客",
        currentLang: "中文"
    }, ja: {
        title: "アカウント作成",
        subtitle: "シングルサインオンでVMを一元管理するC-Cloudに参加",
        name: "名前",
        email: "メールアドレス",
        password: "パスワード",
        confirmPassword: "パスワード確認",
        createAccount: "アカウント作成",
        orSignUp: "または以下でサインアップ",
        alreadyAccount: "既にアカウントをお持ちですか？",
        login: "ログイン",
        footer: "サインアップすることで、利用規約とプライバシーポリシーに同意したものとみなされます。",
        help: "ヘルプセンター",
        status: "ステータス",
        blog: "ブログ",
        currentLang: "日本語"
    }, hi: {
        title: "खाता बनाएं",
        subtitle: "सिंगल साइन-ऑन पर अपने वीएम को केंद्रीकृत करने के लिए C-Cloud से जुड़ें",
        name: "नाम",
        email: "ईमेल",
        password: "पासवर्ड",
        confirmPassword: "पासवर्ड की पुष्टि करें",
        createAccount: "खाता बनाएं",
        orSignUp: "या इसके साथ साइन अप करें",
        alreadyAccount: "पहले से ही एक खाता है?",
        login: "लॉग इन करें",
        footer: "साइन अप करके, आप हमारी सेवा की शर्तें और गोपनीयता नीति से सहमत होते हैं।",
        help: "सहायता केंद्र",
        status: "स्थिति",
        blog: "ब्लॉग",
        currentLang: "हिन्दी"
    }, ta: {
        title: "கணக்கை உருவாக்குக",
        subtitle: "ஒற்றை உள்நுழைவில் உங்கள் VM-களை மையப்படுத்த C-Cloud இல் சேருங்கள்",
        name: "பெயர்",
        email: "மின்னஞ்சல்",
        password: "கடவுச்சொல்",
        confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்துக",
        createAccount: "கணக்கை உருவாக்குக",
        orSignUp: "அல்லது இதனுடன் பதிவு செய்யவும்",
        alreadyAccount: "ஏற்கனவே ஒரு கணக்கு உள்ளதா?",
        login: "உள்நுழைய",
        footer: "பதிவு செய்வதன் மூலம், நீங்கள் எங்கள் சேவை விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை ஏற்கிறீர்கள்.",
        help: "உதவி மையம்",
        status: "நிலை",
        blog: "வலைப்பதிவு",
        currentLang: "தமிழ்"
    }
};

// Current language
let currentLanguage = 'en';

// Function to change language
function changeLanguage(lang) {
    currentLanguage = lang;
    const t = translations[lang];

    // Update all text elements
    document.getElementById('page-title').textContent = t.title;
    document.getElementById('page-subtitle').textContent = t.subtitle;
    document.getElementById('name-input').placeholder = t.name;
    document.getElementById('email-input').placeholder = t.email;
    document.getElementById('password-input').placeholder = t.password;
    document.getElementById('confirm-password-input').placeholder = t.confirmPassword;
    document.getElementById('submit-button').textContent = t.createAccount;
    document.getElementById('divider-text').textContent = t.orSignUp;
    document.getElementById('login-prompt').textContent = t.alreadyAccount;
    document.getElementById('login-link').textContent = t.login;
    document.getElementById('footer-text').innerHTML = t.footer.replace('Terms of Service', '<a href="#" class="hover:underline">' + (lang === 'en' ? 'Terms of Service' : 'Terms of Service') + '</a>').replace('Privacy Policy', '<a href="#" class="hover:underline">' + (lang === 'en' ? 'Privacy Policy' : 'Privacy Policy') + '</a>');
    document.getElementById('help-link').textContent = t.help;
    document.getElementById('status-link').textContent = t.status;
    document.getElementById('blog-link').textContent = t.blog;
    document.getElementById('current-language').textContent = t.currentLang;

    // Update active state in dropdown
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.lang === lang) {
            option.classList.add('active');
        }
    });

    // Save preference to localStorage
    localStorage.setItem('preferred-language', lang);
}

// Password strength indicator
const passwordInput = document.querySelector('input[type="password"][th\\:field="*{password}"]');
const strengthBar = document.getElementById('password-strength-bar');

if (passwordInput && strengthBar) {
    passwordInput.addEventListener('input', function () {
        const password = this.value;
        let strength = 0;

        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;

        strengthBar.style.width = strength + '%';

        if (strength < 50) {
            strengthBar.style.background = 'var(--error)';
        } else if (strength < 75) {
            strengthBar.style.background = 'var(--warning)';
        } else {
            strengthBar.style.background = 'var(--success)';
        }
    });
}

// Language selector functionality
const languageButton = document.getElementById('language-button');
const languageDropdown = document.getElementById('language-dropdown');

languageButton.addEventListener('click', function () {
    languageDropdown.classList.toggle('show');
    languageButton.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    if (!languageButton.contains(event.target) && !languageDropdown.contains(event.target)) {
        languageDropdown.classList.remove('show');
        languageButton.classList.remove('active');
    }
});

// Language option selection
document.querySelectorAll('.language-option').forEach(option => {
    option.addEventListener('click', function () {
        const lang = this.dataset.lang;
        changeLanguage(lang);
        languageDropdown.classList.remove('show');
        languageButton.classList.remove('active');
    });
});


// Initialize FingerprintJS
function initializeFingerprint() {
    const fpPromise = FingerprintJS.load();
    fpPromise
        .then(fp => fp.get())
        .then(result => {
            document.getElementById("fingerprint").value = result.visitorId;
            console.log(result.visitorId);
        })
        .catch(() => {
        });
}

// Initialize page with saved language preference
function initializePage() {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    changeLanguage(savedLanguage);
    initializeFingerprint();
}

// Run initialization when page loads
window.addEventListener('load', initializePage);