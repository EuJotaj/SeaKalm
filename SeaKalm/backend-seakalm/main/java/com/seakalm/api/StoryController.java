package com.seakalm.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/stories")
public class StoryController { // <-- A CLASSE COMEÇA AQUI

    @Autowired
    private StoryRepository storyRepository;

    @CrossOrigin(origins = "*")
    @GetMapping
    public List<Story> getAllStories() {
        return storyRepository.findAll();
    }

    // --- ESTE É O NOVO MÉTODO ---
    // Ele precisa estar DENTRO da classe, como está agora.
    @CrossOrigin(origins = "*")
    @GetMapping("/{id}")
    public ResponseEntity<Story> getStoryById(@PathVariable Long id) {
        Optional<Story> story = storyRepository.findById(id);

        // Se a história for encontrada, retorna 200 OK com a história.
        // Se não, retorna um erro 404 Not Found.
        return story.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

} // <-- A CLASSE TERMINA AQUI. NADA DEVE ESTAR DEPOIS DESTA CHAVE.