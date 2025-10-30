package com.projeto.service;

import com.projeto.dto.VantagemRequestDTO;
import com.projeto.dto.VantagemResponseDTO;
import com.projeto.model.Vantagem;
import com.projeto.model.Aluno;
import com.projeto.model.Transacao;
import com.projeto.model.EmpresaParceira;
import com.projeto.repository.VantagemRepository;
import com.projeto.repository.AlunoRepository;
import com.projeto.repository.TransacaoRepository;
import com.projeto.repository.EmpresaParceiraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VantagemService {

    @Autowired
    private VantagemRepository vantagemRepository;

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private TransacaoRepository transacaoRepository;

    @Autowired
    private EmpresaParceiraRepository empresaParceiraRepository;

    /**
     * Lista todas as vantagens
     */
    public List<VantagemResponseDTO> listarTodas() {
        List<Vantagem> vantagens = vantagemRepository.findAll();
        return vantagens.stream()
                .map(v -> converterParaResponseDTO(v, null))
                .collect(Collectors.toList());
    }

    /**
     * Busca uma vantagem por ID
     */
    public Optional<VantagemResponseDTO> buscarPorId(Long id) {
        Optional<Vantagem> vantagem = vantagemRepository.findById(id);
        return vantagem.map(v -> converterParaResponseDTO(v, null));
    }

    /**
     * Lista vantagens de uma empresa específica
     * Nota: Como o modelo Vantagem não tem relação com Empresa,
     * esta implementação retorna uma lista vazia por enquanto
     */
    public List<VantagemResponseDTO> listarPorEmpresa(Long empresaId) {
        // TODO: Adicionar relação ManyToOne entre Vantagem e EmpresaParceira no modelo
        // Por enquanto, retorna lista vazia
        return List.of();
    }

    /**
     * Cria uma nova vantagem
     */
    @Transactional
    public VantagemResponseDTO criar(VantagemRequestDTO requestDTO) {
        Vantagem vantagem = new Vantagem();
        vantagem.setDescricao(requestDTO.getDescricao());
        vantagem.setCustoMoedas(requestDTO.getCustoMoedas());
        
        // Converter foto de Base64 para byte array se fornecida
        if (requestDTO.getFoto() != null && !requestDTO.getFoto().isEmpty()) {
            try {
                byte[] fotoBytes = Base64.getDecoder().decode(requestDTO.getFoto());
                vantagem.setFoto(fotoBytes);
            } catch (IllegalArgumentException e) {
                // Se não for Base64 válido, ignorar
                vantagem.setFoto(null);
            }
        }

        Vantagem vantagemSalva = vantagemRepository.save(vantagem);
        
        // Buscar empresa se fornecida
        EmpresaParceira empresa = null;
        if (requestDTO.getEmpresaId() != null) {
            empresa = empresaParceiraRepository.findById(requestDTO.getEmpresaId()).orElse(null);
        }
        
        return converterParaResponseDTO(vantagemSalva, empresa);
    }

    /**
     * Atualiza uma vantagem existente
     */
    @Transactional
    public Optional<VantagemResponseDTO> atualizar(Long id, VantagemRequestDTO requestDTO) {
        Optional<Vantagem> vantagemExistente = vantagemRepository.findById(id);
        
        if (vantagemExistente.isPresent()) {
            Vantagem vantagem = vantagemExistente.get();
            
            vantagem.setDescricao(requestDTO.getDescricao());
            vantagem.setCustoMoedas(requestDTO.getCustoMoedas());
            
            // Converter foto de Base64 para byte array se fornecida
            if (requestDTO.getFoto() != null && !requestDTO.getFoto().isEmpty()) {
                try {
                    byte[] fotoBytes = Base64.getDecoder().decode(requestDTO.getFoto());
                    vantagem.setFoto(fotoBytes);
                } catch (IllegalArgumentException e) {
                    // Se não for Base64 válido, manter foto atual
                }
            }

            Vantagem vantagemAtualizada = vantagemRepository.save(vantagem);
            
            // Buscar empresa se fornecida
            EmpresaParceira empresa = null;
            if (requestDTO.getEmpresaId() != null) {
                empresa = empresaParceiraRepository.findById(requestDTO.getEmpresaId()).orElse(null);
            }
            
            return Optional.of(converterParaResponseDTO(vantagemAtualizada, empresa));
        }
        
        return Optional.empty();
    }

    /**
     * Deleta uma vantagem
     */
    @Transactional
    public boolean deletar(Long id) {
        if (vantagemRepository.existsById(id)) {
            vantagemRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Resgata uma vantagem (aluno troca moedas por vantagem)
     */
    @Transactional
    public VantagemResponseDTO resgatarVantagem(Long vantagemId, Long alunoId) {
        // Buscar vantagem
        Vantagem vantagem = vantagemRepository.findById(vantagemId)
                .orElseThrow(() -> new IllegalArgumentException("Vantagem não encontrada"));

        // Buscar aluno
        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new IllegalArgumentException("Aluno não encontrado"));

        // Verificar se o aluno tem moedas suficientes
        if (aluno.getSaldoMoedas() < vantagem.getCustoMoedas()) {
            throw new IllegalArgumentException("Saldo de moedas insuficiente. " +
                    "Necessário: " + vantagem.getCustoMoedas() + ", Disponível: " + aluno.getSaldoMoedas());
        }

        // Debitar moedas do aluno
        aluno.setSaldoMoedas(aluno.getSaldoMoedas() - vantagem.getCustoMoedas());
        alunoRepository.save(aluno);

        // Criar transação de resgate
        // Aluno é quem está resgatando (usuario), não há destinatário neste caso
        Transacao transacao = new Transacao();
        transacao.setUsuario(aluno);
        transacao.setUsuarioDestino(null); // Não há destinatário em resgate de vantagem
        transacao.setData(new Date());
        transacao.setValor(vantagem.getCustoMoedas());
        transacao.setTipo("RESGATE");
        transacao.setMotivo("Resgate de vantagem: " + vantagem.getDescricao());
        transacaoRepository.save(transacao);

        return converterParaResponseDTO(vantagem, null);
    }

    /**
     * Converte Vantagem para VantagemResponseDTO
     */
    private VantagemResponseDTO converterParaResponseDTO(Vantagem vantagem, EmpresaParceira empresa) {
        // Converter foto de byte array para Base64
        String fotoBase64 = null;
        if (vantagem.getFoto() != null && vantagem.getFoto().length > 0) {
            fotoBase64 = Base64.getEncoder().encodeToString(vantagem.getFoto());
        }

        return new VantagemResponseDTO(
                vantagem.getId(),
                vantagem.getDescricao(),
                fotoBase64,
                vantagem.getCustoMoedas(),
                empresa != null ? empresa.getId() : null,
                empresa != null ? empresa.getNome() : null
        );
    }
}
