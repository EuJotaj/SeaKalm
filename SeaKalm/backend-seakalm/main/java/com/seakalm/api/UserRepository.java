package com.seakalm.api;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional; // <-- A LINHA QUE FALTAVA

public interface UserRepository extends JpaRepository<User, Long> {
    // Este método busca um usuário pelo seu nome de usuário.
    // O Optional é uma forma segura de dizer que o usuário pode ou não ser encontrado.
    Optional<User> findByUsername(String username);
}