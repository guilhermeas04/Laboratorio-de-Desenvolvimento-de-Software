package com.projeto.service;

import com.projeto.dto.TransacaoResponseDTO;
import com.projeto.model.Transacao;
import com.projeto.repository.TransacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TransacaoService {

    @Autowired
    private TransacaoRepository transacaoRepository;

    /**
     * Lista todas as transações
     */
    public List<TransacaoResponseDTO> listarTodas() {
        List<Transacao> transacoes = transacaoRepository.findAll();
        return transacoes.stream()
                .map(this::converterParaResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca uma transação por ID
     */
    public Optional<TransacaoResponseDTO> buscarPorId(Long id) {
        Optional<Transacao> transacao = transacaoRepository.findById(id);
        return transacao.map(this::converterParaResponseDTO);
    }

    /**
     * Lista transações de um usuário específico
     * Retorna todas as transações onde o usuário é o remetente OU o destinatário
     */
    public List<TransacaoResponseDTO> listarPorUsuario(Long usuarioId) {
        List<Transacao> transacoes = transacaoRepository.findAll();
        return transacoes.stream()
                .filter(t -> 
                    (t.getUsuario() != null && t.getUsuario().getId().equals(usuarioId)) ||
                    (t.getUsuarioDestino() != null && t.getUsuarioDestino().getId().equals(usuarioId))
                )
                .map(this::converterParaResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista transações de uma empresa específica
     * DEPRECATED: Este método não é mais usado pois removemos o campo empresa
     */
    @Deprecated
    public List<TransacaoResponseDTO> listarPorEmpresa(Long empresaId) {
        // Retorna lista vazia já que não temos mais empresa nas transações
        return List.of();
    }

    /**
     * Lista transações por tipo
     */
    public List<TransacaoResponseDTO> listarPorTipo(String tipo) {
        List<Transacao> transacoes = transacaoRepository.findAll();
        return transacoes.stream()
                .filter(t -> t.getTipo() != null && t.getTipo().equalsIgnoreCase(tipo))
                .map(this::converterParaResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Cria uma nova transação
     */
    @Transactional
    public TransacaoResponseDTO criar(Transacao transacao) {
        Transacao transacaoSalva = transacaoRepository.save(transacao);
        return converterParaResponseDTO(transacaoSalva);
    }

    /**
     * Converte Transacao para TransacaoResponseDTO
     */
    private TransacaoResponseDTO converterParaResponseDTO(Transacao transacao) {
        return new TransacaoResponseDTO(
                transacao.getId(),
                transacao.getUsuario() != null ? transacao.getUsuario().getId() : null,
                transacao.getUsuario() != null ? transacao.getUsuario().getNome() : null,
                transacao.getUsuarioDestino() != null ? transacao.getUsuarioDestino().getId() : null,
                transacao.getUsuarioDestino() != null ? transacao.getUsuarioDestino().getNome() : null,
                transacao.getData(),
                transacao.getValor(),
                transacao.getTipo(),
                transacao.getMotivo()
        );
    }
}
