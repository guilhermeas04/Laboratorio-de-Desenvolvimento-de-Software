package com.projeto.repository;

import com.projeto.model.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfessorRepository extends JpaRepository<Professor, Long> {
    
    Optional<Professor> findByEmail(String email);
    Optional<Professor> findByLogin(String login);
    Optional<Professor> findByDocumento(String documento);
    
    boolean existsByEmail(String email);
    boolean existsByLogin(String login);
    boolean existsByDocumento(String documento);
}
