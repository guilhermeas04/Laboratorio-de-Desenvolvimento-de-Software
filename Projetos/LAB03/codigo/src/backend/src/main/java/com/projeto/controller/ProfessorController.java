package com.projeto.controller;

import com.projeto.dto.EnviarMoedasRequestDTO;
import com.projeto.dto.EnviarMoedasResponseDTO;
import com.projeto.dto.ProfessorRequestDTO;
import com.projeto.dto.ProfessorResponseDTO;
import com.projeto.service.ProfessorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para operações relacionadas a professores
 */
@RestController
@RequestMapping("/api/professores")
@CrossOrigin(origins = "*")
public class ProfessorController {

    @Autowired
    private ProfessorService professorService;

    // ==================== CRUD COMPLETO ====================

    /**
     * Lista todos os professores
     * GET /api/professores
     */
    @GetMapping
    public ResponseEntity<List<ProfessorResponseDTO>> listarTodos() {
        List<ProfessorResponseDTO> professores = professorService.listarTodos();
        return ResponseEntity.ok(professores);
    }

    /**
     * Busca professor por ID
     * GET /api/professores/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProfessorResponseDTO> buscarPorId(@PathVariable Long id) {
        ProfessorResponseDTO professor = professorService.buscarPorIdDTO(id);
        return ResponseEntity.ok(professor);
    }

    /**
     * Cria um novo professor
     * POST /api/professores
     * 
     * Corpo da requisição:
     * {
     *   "nome": "Dr. João Silva",
     *   "documento": "12345678900",
     *   "email": "joao@prof.edu",
     *   "login": "joao.silva",
     *   "senha": "senha123",
     *   "departamento": "Ciência da Computação",
     *   "instituicaoId": 1
     * }
     */
    @PostMapping
    public ResponseEntity<ProfessorResponseDTO> criar(@Valid @RequestBody ProfessorRequestDTO dto) {
        ProfessorResponseDTO professor = professorService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(professor);
    }

    /**
     * Atualiza um professor existente
     * PUT /api/professores/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProfessorResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProfessorRequestDTO dto) {
        ProfessorResponseDTO professor = professorService.atualizar(id, dto);
        return ResponseEntity.ok(professor);
    }

    /**
     * Deleta um professor
     * DELETE /api/professores/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        professorService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint para professor enviar moedas para um aluno
     * POST /api/professores/{professorId}/enviar-moedas
     * 
     * Corpo da requisição:
     * {
     *   "alunoId": 1,
     *   "quantidade": 50.0,
     *   "motivo": "Excelente participação na aula!"
     * }
     * 
     * Regras de negócio:
     * - Professor deve existir
     * - Aluno deve existir
     * - Professor deve ter saldo suficiente
     * - Quantidade deve ser positiva
     * - Motivo é obrigatório
     * - Aluno será notificado por email
     * 
     * @param professorId ID do professor que está enviando as moedas
     * @param request Dados da transferência (alunoId, quantidade, motivo)
     * @return Detalhes da transferência realizada
     */
    @PostMapping("/{professorId}/enviar-moedas")
    public ResponseEntity<EnviarMoedasResponseDTO> enviarMoedas(
            @PathVariable Long professorId,
            @Valid @RequestBody EnviarMoedasRequestDTO request) {
        
        EnviarMoedasResponseDTO response = professorService.enviarMoedas(professorId, request);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * Endpoint para adicionar moedas ao saldo de um professor
     * PATCH /api/professores/{professorId}/adicionar-moedas?quantidade=1000
     * 
     * Usado para distribuição semestral de moedas (1000 moedas por semestre)
     * 
     * @param professorId ID do professor
     * @param quantidade Quantidade de moedas a adicionar
     * @return Mensagem de sucesso
     */
    @PatchMapping("/{professorId}/adicionar-moedas")
    public ResponseEntity<String> adicionarMoedas(
            @PathVariable Long professorId,
            @RequestParam Double quantidade) {
        
        if (quantidade <= 0) {
            return ResponseEntity.badRequest().body("Quantidade deve ser maior que zero");
        }
        
        professorService.adicionarMoedas(professorId, quantidade);
        return ResponseEntity.ok(
            String.format("%.2f moedas adicionadas com sucesso ao professor ID %d", quantidade, professorId)
        );
    }
}
