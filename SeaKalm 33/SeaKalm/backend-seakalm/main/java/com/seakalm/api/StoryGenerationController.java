package com.seakalm.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class StoryGenerationController {

    @Autowired
    private StoryRepository storyRepository;

    // MUDANÇA AQUI
    @Autowired
    private GoogleGeminiClient geminiClient;

    @PostMapping("/generate-story")
    public ResponseEntity<?> generateStory(@RequestBody Map<String, String> payload) {
        try {
            String userPrompt = payload.get("prompt");

            String titlePrompt = "Crie um título curto e encantador para uma história infantil sobre: " + userPrompt;
            String contentPrompt = "Crie uma história infantil completa (3-4 parágrafos), calmante e positiva sobre '" + userPrompt + "'. Deve ter um final feliz e tranquilo.";

            // MUDANÇAS AQUI
            String generatedTitle = geminiClient.getChatResponse(titlePrompt);
            String generatedContent = geminiClient.getChatResponse(contentPrompt);

            // Restante do código permanece o mesmo
            Story newStory = new Story();
            // ... (código para salvar a história)

            Story savedStory = storyRepository.save(newStory);
            return ResponseEntity.ok(savedStory);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "A IA não conseguiu criar a história no momento."));
        }
    }
}