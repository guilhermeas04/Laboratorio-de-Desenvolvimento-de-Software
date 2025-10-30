package com.projeto.dto;

import java.util.Date;

public class EnviarMoedasResponseDTO {
    
    private Long transacaoId;
    private String professorNome;
    private String alunoNome;
    private Double quantidade;
    private String motivo;
    private Date dataTransacao;
    private Double saldoRestanteProfessor;
    private Double novoSaldoAluno;
    private String mensagem;

    public EnviarMoedasResponseDTO() {}

    public EnviarMoedasResponseDTO(Long transacaoId, String professorNome, String alunoNome, 
                                   Double quantidade, String motivo, Date dataTransacao,
                                   Double saldoRestanteProfessor, Double novoSaldoAluno, String mensagem) {
        this.transacaoId = transacaoId;
        this.professorNome = professorNome;
        this.alunoNome = alunoNome;
        this.quantidade = quantidade;
        this.motivo = motivo;
        this.dataTransacao = dataTransacao;
        this.saldoRestanteProfessor = saldoRestanteProfessor;
        this.novoSaldoAluno = novoSaldoAluno;
        this.mensagem = mensagem;
    }

    // Getters e Setters
    public Long getTransacaoId() { return transacaoId; }
    public void setTransacaoId(Long transacaoId) { this.transacaoId = transacaoId; }

    public String getProfessorNome() { return professorNome; }
    public void setProfessorNome(String professorNome) { this.professorNome = professorNome; }

    public String getAlunoNome() { return alunoNome; }
    public void setAlunoNome(String alunoNome) { this.alunoNome = alunoNome; }

    public Double getQuantidade() { return quantidade; }
    public void setQuantidade(Double quantidade) { this.quantidade = quantidade; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public Date getDataTransacao() { return dataTransacao; }
    public void setDataTransacao(Date dataTransacao) { this.dataTransacao = dataTransacao; }

    public Double getSaldoRestanteProfessor() { return saldoRestanteProfessor; }
    public void setSaldoRestanteProfessor(Double saldoRestanteProfessor) { 
        this.saldoRestanteProfessor = saldoRestanteProfessor; 
    }

    public Double getNovoSaldoAluno() { return novoSaldoAluno; }
    public void setNovoSaldoAluno(Double novoSaldoAluno) { this.novoSaldoAluno = novoSaldoAluno; }

    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }
}
