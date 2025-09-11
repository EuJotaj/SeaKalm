package com.seakalm.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {

    // MUDANÇA AQUI
    @Autowired
    private GoogleGeminiClient geminiClient;

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> askLuna(@RequestBody Map<String, String> payload) {
        try {
            String userMessage = payload.get("message");
            String prompt = "Você é Luna, uma psicóloga de IA gentil para crianças. Use linguagem simples e respostas curtas e acolhedoras. Um usuário disse: '" + userMessage + "'. Responda a ele.";

            // MUDANÇA AQUI
            String lunaResponse = geminiClient.getChatResponse(prompt);

            return ResponseEntity.ok(Map.of("reply", lunaResponse));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("reply", "Desculpe, estou com um probleminha para pensar agora. Tente de novo."));
        }
    }
}