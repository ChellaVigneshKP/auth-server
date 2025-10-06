package com.chellavignesh.authserver.controller;

import com.chellavignesh.authserver.entity.UserEntity;
import com.chellavignesh.authserver.repository.UserRepository;
import com.chellavignesh.authserver.service.TurnstileService;
import io.getunleash.Unleash;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class UserController {

    @Value("${turnstile.site-key}")
    private String turnstileSiteKey;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Unleash unleash;
    private final TurnstileService turnstileService;

    @GetMapping("/register")
    public String showRegisterForm(Model model, HttpServletRequest request) {
        request.getSession(true);

        // Always ensure "user" is available for Thymeleaf binding
        if (!model.containsAttribute("user")) {
            model.addAttribute("user", new UserDto());
        }

        // Add feature flags safely
        Map<String, Boolean> socialLoginFlags = new HashMap<>();
        socialLoginFlags.put("google", unleash.isEnabled("enable-google-login"));
        socialLoginFlags.put("apple", unleash.isEnabled("enable-apple-login"));
        socialLoginFlags.put("github", unleash.isEnabled("enable-github-login"));

        model.addAttribute("socialLoginFlags", socialLoginFlags);
        model.addAttribute("enablePhoneSignup", unleash.isEnabled("enable-phone-signup"));
        model.addAttribute("turnstileSiteKey", turnstileSiteKey);
        model.addAttribute("anySocialLoginEnabled",
                socialLoginFlags.values().stream().anyMatch(Boolean::booleanValue));

        return "register";
    }

    @PostMapping("/register")
    @Transactional
    public String registerUser(@Valid @ModelAttribute("user") UserDto user,
                               BindingResult bindingResult,
                               HttpServletRequest request,
                               RedirectAttributes redirectAttributes) {

        String turnstileToken = request.getParameter("cf-turnstile-response");
        if (turnstileToken == null || !turnstileService.verifyToken(turnstileToken, request.getRemoteAddr())) {
            bindingResult.reject("turnstile", "CAPTCHA verification failed");
            return redirectWithErrors(user, bindingResult, redirectAttributes);
        }

        // Handle validation errors early
        if (bindingResult.hasErrors()) {
            return redirectWithErrors(user, bindingResult, redirectAttributes);
        }

        // Business rule: Passwords must match
        if (!user.getPassword().equals(user.getConfirmPassword())) {
            bindingResult.rejectValue("confirmPassword", "error.confirmPassword", "Passwords do not match");
            return redirectWithErrors(user, bindingResult, redirectAttributes);
        }

        // Business rule: Email must be unique
        if (userRepository.findByEmail(user.getEmail().trim().toLowerCase()).isPresent()) {
            bindingResult.rejectValue("email", "error.email", "Email already registered");
            return redirectWithErrors(user, bindingResult, redirectAttributes);
        }

        // Normalize inputs before persistence
        String normalizedFullName = user.getFullName().trim();
        String normalizedEmail = user.getEmail().trim().toLowerCase();

        UserEntity entity = UserEntity.builder()
                .fullName(normalizedFullName)
                .email(normalizedEmail)
                .password(passwordEncoder.encode(user.getPassword()))
                .enabled(true)
                .createdAt(OffsetDateTime.now()) // timezone-aware timestamp
                .build();

        userRepository.save(entity);

        return "redirect:/login?registered=true";
    }

    /**
     * Helper method to redirect with errors while preserving validation state.
     */
    private String redirectWithErrors(UserDto user,
                                      BindingResult bindingResult,
                                      RedirectAttributes redirectAttributes) {
        redirectAttributes.addFlashAttribute("org.springframework.validation.BindingResult.user", bindingResult);
        redirectAttributes.addFlashAttribute("user", user);
        return "redirect:/register";
    }

    /**
     * DTO for user registration with validation annotations.
     */
    @Data
    public static class UserDto {

        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        private String password;

        @NotBlank(message = "Confirm Password is required")
        private String confirmPassword;

        // Optional metadata
        private String fingerprint;
        private String botdFingerprint;
        private String phone;
        private String timezone;
    }
}