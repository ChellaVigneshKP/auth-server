package com.chellavignesh.authserver.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {
    @GetMapping("/login")
    String login(Model model) {
        model.addAttribute("showPhone", true);
        return "login";
    }
}
