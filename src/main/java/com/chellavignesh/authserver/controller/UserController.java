package com.chellavignesh.authserver.controller;

import com.chellavignesh.authserver.entity.UserEntity;
import com.chellavignesh.authserver.repository.UserRepository;
import io.getunleash.Unleash;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Unleash unleash;

    @GetMapping("/register")
    public String showRegisterForm(Model model) {
        model.addAttribute("user", new UserDto());

        // Add feature flags to the model
        Map<String, Boolean> socialLoginFlags = new HashMap<>();
        socialLoginFlags.put("google", unleash.isEnabled("enable-google-login"));
        socialLoginFlags.put("apple", unleash.isEnabled("enable-apple-login"));
        socialLoginFlags.put("github", unleash.isEnabled("enable-github-login"));

        model.addAttribute("socialLoginFlags", socialLoginFlags);

        // Check if any social login is enabled
        boolean anySocialLoginEnabled = unleash.isEnabled("enable-google-login") || unleash.isEnabled("enable-apple-login") || unleash.isEnabled("enable-github-login");
        model.addAttribute("anySocialLoginEnabled", anySocialLoginEnabled);

        return "register";
    }

    @PostMapping("/register")
    public String registerUser(@ModelAttribute("user") UserDto user, Model model) {
        // Password check
        if (!user.getPassword().equals(user.getConfirmPassword())) {
            model.addAttribute("error", "Passwords do not match");
            model.addAttribute("user", user);
            return "register";
        }

        // Email uniqueness check
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            model.addAttribute("error", "Email already registered");
            model.addAttribute("user", user);
            return "register";
        }

        // Save user
        UserEntity entity = UserEntity.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .password(passwordEncoder.encode(user.getPassword()))
                .enabled(true)
                .build();

        userRepository.save(entity);

        return "redirect:/login";
    }

    @Getter
    @Setter
    public static class UserDto {
        private String fullName;
        private String email;
        private String password;
        private String confirmPassword;
        private String fingerprint;
    }
}