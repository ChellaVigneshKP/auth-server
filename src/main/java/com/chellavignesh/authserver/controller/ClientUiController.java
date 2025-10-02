package com.chellavignesh.authserver.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin/clients")
public class ClientUiController {

    private final ClientManagementController clientService;

    public ClientUiController(ClientManagementController clientService) {
        this.clientService = clientService;
    }

    @GetMapping("/create-form")
    public String showForm(Model model) {
        model.addAttribute("client", new ClientManagementController.ClientRequest());
        return "admin/create-client";
    }

    @PostMapping("/create-ui")
    public String submitForm(@ModelAttribute("client") ClientManagementController.ClientRequest clientRequest,
                             Model model) {
        clientService.createClientForm(clientRequest, model);
        return "admin/create-client"; // redisplay form with message
    }
}