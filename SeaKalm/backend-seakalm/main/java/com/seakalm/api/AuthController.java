package com.seakalm.api;

// ===== INÍCIO DO BLOCO DE IMPORTAÇÕES CORRIGIDO =====
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.Optional;
// ===== FIM DO BLOCO DE IMPORTAÇÕES CORRIGIDO =====

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // NOTA: Em uma aplicação real, as senhas NUNCA devem ser salvas como texto puro.
    // Usaríamos um encoder como o BCryptPasswordEncoder.
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Erro: Nome de usuário já existe!"));
        }
        // A senha deve ser encriptada aqui
        User savedUser = userRepository.save(user);
        // Em um app real, você geraria e retornaria um token JWT aqui.
        return ResponseEntity.ok(Map.of("message", "Usuário registrado com sucesso!", "user", savedUser));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginDetails) {
        Optional<User> userOptional = userRepository.findByUsername(loginDetails.getUsername());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // Verifique a senha (em um app real, use encoder.matches())
            if (user.getPassword().equals(loginDetails.getPassword())) {
                // Login bem-sucedido. Retornando o objeto do usuário.
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Nome de usuário ou senha inválidos."));
    }
}