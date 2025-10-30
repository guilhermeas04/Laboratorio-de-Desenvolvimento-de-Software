package com.projeto.service;

import com.projeto.dto.EnviarMoedasRequestDTO;
import com.projeto.dto.EnviarMoedasResponseDTO;
import com.projeto.dto.ProfessorRequestDTO;
import com.projeto.dto.ProfessorResponseDTO;
import com.projeto.model.Aluno;
import com.projeto.model.InstituicaoEnsino;
import com.projeto.model.Professor;
import com.projeto.model.Transacao;
import com.projeto.repository.ProfessorRepository;
import com.projeto.repository.AlunoRepository;
import com.projeto.repository.InstituicaoEnsinoRepository;
import com.projeto.repository.TransacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfessorService {

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private TransacaoRepository transacaoRepository;

    @Autowired
    private InstituicaoEnsinoRepository instituicaoRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Envia moedas de um professor para um aluno
     * Regras de negócio:
     * - Professor deve ter saldo suficiente
     * - Quantidade deve ser positiva
     * - Motivo é obrigatório
     * - Aluno será notificado por email
     * - Transação é registrada
     */
    @Transactional
    public EnviarMoedasResponseDTO enviarMoedas(Long professorId, EnviarMoedasRequestDTO request) {
        // 1. Buscar professor e validar existência
        Professor professor = professorRepository.findById(professorId)
            .orElseThrow(() -> new RuntimeException("Professor não encontrado com ID: " + professorId));

        // 2. Buscar aluno e validar existência
        Aluno aluno = alunoRepository.findById(request.getAlunoId())
            .orElseThrow(() -> new RuntimeException("Aluno não encontrado com ID: " + request.getAlunoId()));

        // 3. Validar saldo do professor
        if (professor.getSaldoMoedas() < request.getQuantidade()) {
            throw new RuntimeException(
                String.format("Saldo insuficiente. Saldo atual: %.2f, Quantidade solicitada: %.2f", 
                    professor.getSaldoMoedas(), request.getQuantidade())
            );
        }

        // 4. Debitar moedas do professor
        professor.setSaldoMoedas(professor.getSaldoMoedas() - request.getQuantidade());
        professorRepository.save(professor);

        // 5. Creditar moedas ao aluno
        aluno.setSaldoMoedas(aluno.getSaldoMoedas() + request.getQuantidade());
        alunoRepository.save(aluno);

        // 6. Criar registro de transação
        // Professor é o remetente (usuario), Aluno é o destinatário (usuarioDestino)
        Transacao transacao = new Transacao(
            professor,              // usuario (remetente - professor)
            aluno,                  // usuarioDestino (destinatário - aluno)
            new Date(),             // data
            request.getQuantidade(), // valor
            "TRANSFERENCIA_PROFESSOR_ALUNO", // tipo
            request.getMotivo()     // motivo
        );
        transacao = transacaoRepository.save(transacao);

        // 7. Notificar aluno por email
        emailService.notificarRecebimentoMoedas(aluno, professor, request.getQuantidade(), request.getMotivo());

        // 8. Retornar resposta com detalhes da transação
        return new EnviarMoedasResponseDTO(
            transacao.getId(),
            professor.getNome(),
            aluno.getNome(),
            request.getQuantidade(),
            request.getMotivo(),
            transacao.getData(),
            professor.getSaldoMoedas(),
            aluno.getSaldoMoedas(),
            String.format("Transferência de %.2f moedas realizada com sucesso!", request.getQuantidade())
        );
    }

    /**
     * Busca um professor por ID
     */
    public Professor buscarPorId(Long id) {
        return professorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Professor não encontrado com ID: " + id));
    }

    /**
     * Adiciona moedas ao saldo de um professor (para distribuição semestral)
     */
    @Transactional
    public void adicionarMoedas(Long professorId, Double quantidade) {
        Professor professor = buscarPorId(professorId);
        professor.setSaldoMoedas(professor.getSaldoMoedas() + quantidade);
        professorRepository.save(professor);
    }

    // ==================== CRUD COMPLETO ====================

    /**
     * Lista todos os professores
     */
    public List<ProfessorResponseDTO> listarTodos() {
        return professorRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Busca professor por ID e retorna DTO
     */
    public ProfessorResponseDTO buscarPorIdDTO(Long id) {
        Professor professor = buscarPorId(id);
        return convertToDTO(professor);
    }

    /**
     * Cria um novo professor
     */
    @Transactional
    public ProfessorResponseDTO criar(ProfessorRequestDTO dto) {
        // Validar duplicados
        if (professorRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado: " + dto.getEmail());
        }
        if (professorRepository.findByLogin(dto.getLogin()).isPresent()) {
            throw new RuntimeException("Login já cadastrado: " + dto.getLogin());
        }
        if (professorRepository.findByDocumento(dto.getDocumento()).isPresent()) {
            throw new RuntimeException("Documento já cadastrado: " + dto.getDocumento());
        }

        // Buscar instituição
        InstituicaoEnsino instituicao = instituicaoRepository.findById(dto.getInstituicaoId())
            .orElseThrow(() -> new RuntimeException("Instituição não encontrada com ID: " + dto.getInstituicaoId()));

        // Criar professor com saldo inicial 0
        Professor professor = new Professor(
            dto.getNome(),
            dto.getDocumento(),
            dto.getEmail(),
            dto.getLogin(),
            dto.getSenha(), // Em produção: hash com BCrypt
            dto.getDepartamento(),
            0.0, // Saldo inicial zero
            instituicao
        );

        professor = professorRepository.save(professor);
        return convertToDTO(professor);
    }

    /**
     * Atualiza um professor existente
     */
    @Transactional
    public ProfessorResponseDTO atualizar(Long id, ProfessorRequestDTO dto) {
        Professor professor = buscarPorId(id);

        // Validar duplicados (exceto o próprio professor)
        professorRepository.findByEmail(dto.getEmail()).ifPresent(p -> {
            if (!p.getId().equals(id)) {
                throw new RuntimeException("Email já cadastrado: " + dto.getEmail());
            }
        });
        professorRepository.findByLogin(dto.getLogin()).ifPresent(p -> {
            if (!p.getId().equals(id)) {
                throw new RuntimeException("Login já cadastrado: " + dto.getLogin());
            }
        });
        professorRepository.findByDocumento(dto.getDocumento()).ifPresent(p -> {
            if (!p.getId().equals(id)) {
                throw new RuntimeException("Documento já cadastrado: " + dto.getDocumento());
            }
        });

        // Buscar instituição
        InstituicaoEnsino instituicao = instituicaoRepository.findById(dto.getInstituicaoId())
            .orElseThrow(() -> new RuntimeException("Instituição não encontrada com ID: " + dto.getInstituicaoId()));

        // Atualizar dados
        professor.setNome(dto.getNome());
        professor.setDocumento(dto.getDocumento());
        professor.setEmail(dto.getEmail());
        professor.setLogin(dto.getLogin());
        professor.setSenha(dto.getSenha()); // Em produção: hash com BCrypt
        professor.setDepartamento(dto.getDepartamento());
        professor.setInstituicao(instituicao);

        professor = professorRepository.save(professor);
        return convertToDTO(professor);
    }

    /**
     * Deleta um professor
     */
    @Transactional
    public void deletar(Long id) {
        Professor professor = buscarPorId(id);
        professorRepository.delete(professor);
    }

    /**
     * Converte Professor para ProfessorResponseDTO
     */
    private ProfessorResponseDTO convertToDTO(Professor professor) {
        return new ProfessorResponseDTO(
            professor.getId(),
            professor.getNome(),
            professor.getDocumento(),
            professor.getEmail(),
            professor.getLogin(),
            professor.getDepartamento(),
            professor.getSaldoMoedas(),
            professor.getInstituicao() != null ? professor.getInstituicao().getId() : null,
            professor.getInstituicao() != null ? professor.getInstituicao().getNome() : null
        );
    }
}
