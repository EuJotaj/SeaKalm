// Crie na pasta: com/seakalm/api/
package com.seakalm.api;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// JpaRepository<Tipo da Entidade, Tipo da Chave Primária>
public interface StoryRepository extends JpaRepository<Story, Long> {
    // Spring Data JPA cria os métodos para nós!
}