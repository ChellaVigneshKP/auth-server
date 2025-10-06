package com.chellavignesh.authserver.service;


import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class TurnstileService {
    @Value("${turnstile.secret-key}")
    private String secret;

    private final RestTemplate restTemplate;

    public boolean verifyToken(String token, String remoteIp) {
        String url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("secret", secret);
        params.add("response", token);
        params.add("remoteip", remoteIp);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
        return response != null && Boolean.TRUE.equals(response.get("success"));
    }
}
