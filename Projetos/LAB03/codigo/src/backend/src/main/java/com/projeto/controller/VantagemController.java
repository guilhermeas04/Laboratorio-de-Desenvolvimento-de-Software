package com.projeto.controller;

import com.projeto.dto.VantagemRequestDTO;
import com.projeto.dto.VantagemResponseDTO;
import com.projeto.dto.PageResponseDTO;
import com.projeto.service.VantagemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Controller REST para operações relacionadas a vantagens
 */
@RestController
@RequestMapping("/api/vantagens")
@CrossOrigin(origins = "*")
public class VantagemController {

      @Autowired
      private VantagemService vantagemService;

      /**
       * Lista todas as vantagens disponíveis com paginação
       * GET /api/vantagens?page=0&size=10&sort=descricao,asc
       */
      @GetMapping
      public ResponseEntity<PageResponseDTO<VantagemResponseDTO>> listarTodas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
            
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") 
                  ? Sort.Direction.DESC 
                  : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            PageResponseDTO<VantagemResponseDTO> response = vantagemService.listarTodas(pageable);
            return ResponseEntity.ok(response);
      }

      /**
       * Busca uma vantagem específica por ID
       * GET /api/vantagens/{id}
       */
      @GetMapping("/{id}")
      public ResponseEntity<VantagemResponseDTO> buscarPorId(@PathVariable Long id) {
            Optional<VantagemResponseDTO> vantagem = vantagemService.buscarPorId(id);
            return vantagem.map(ResponseEntity::ok)
                        .orElseGet(() -> ResponseEntity.notFound().build());
      }

      /**
       * Lista vantagens de uma empresa específica com paginação
       * GET /api/vantagens/empresa/{empresaId}?page=0&size=10
       */
      @GetMapping("/empresa/{empresaId}")
      public ResponseEntity<PageResponseDTO<VantagemResponseDTO>> listarPorEmpresa(
            @PathVariable Long empresaId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
            
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") 
                  ? Sort.Direction.DESC 
                  : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            PageResponseDTO<VantagemResponseDTO> response = vantagemService.listarPorEmpresa(empresaId, pageable);
            return ResponseEntity.ok(response);
      }

      /**
       * Cria uma nova vantagem
       * POST /api/vantagens
       * 
       * Corpo da requisição:
       * {
       * "descricao": "10% de desconto em produtos",
       * "foto": "base64_encoded_image_or_url",
       * "custoMoedas": 50.0,
       * "empresaId": 1
       * }
       */
      @PostMapping
      public ResponseEntity<VantagemResponseDTO> criar(@Valid @RequestBody VantagemRequestDTO dto) {
            VantagemResponseDTO vantagem = vantagemService.criar(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(vantagem);
      }

      /**
       * Atualiza uma vantagem existente
       * PUT /api/vantagens/{id}
       */
      @PutMapping("/{id}")
      public ResponseEntity<VantagemResponseDTO> atualizar(
                  @PathVariable Long id,
                  @Valid @RequestBody VantagemRequestDTO dto) {
            Optional<VantagemResponseDTO> vantagem = vantagemService.atualizar(id, dto);
            return vantagem.map(ResponseEntity::ok)
                        .orElseGet(() -> ResponseEntity.notFound().build());
      }

      /**
       * Deleta uma vantagem
       * DELETE /api/vantagens/{id}
       */
      @DeleteMapping("/{id}")
      public ResponseEntity<Void> deletar(@PathVariable Long id) {
            boolean deletado = vantagemService.deletar(id);
            if (deletado) {
                  return ResponseEntity.noContent().build();
            } else {
                  return ResponseEntity.notFound().build();
            }
      }

      /**
       * Resgata uma vantagem (aluno troca moedas por vantagem)
       * POST /api/vantagens/{vantagemId}/resgatar
       * 
       * @param vantagemId ID da vantagem a ser resgatada
       * @param alunoId    ID do aluno que está resgatando (query param)
       * @return Detalhes do resgate incluindo cupom de resgate
       */
      @PostMapping("/{vantagemId}/resgatar")
      public ResponseEntity<?> resgatarVantagem(
                  @PathVariable Long vantagemId,
                  @RequestParam Long alunoId) {
            try {
                  var resultado = vantagemService.resgatarVantagem(vantagemId, alunoId);
                  return ResponseEntity.ok(resultado);
            } catch (IllegalArgumentException e) {
                  return ResponseEntity.badRequest().body(e.getMessage());
            } catch (Exception e) {
                  return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                              .body("Erro ao resgatar vantagem: " + e.getMessage());
            }
      }
}
