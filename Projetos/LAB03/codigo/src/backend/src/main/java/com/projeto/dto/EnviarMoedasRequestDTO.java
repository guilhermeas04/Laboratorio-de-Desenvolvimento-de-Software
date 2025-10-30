package com.projeto.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotBlank;

public class EnviarMoedasRequestDTO {
    
    @NotNull(message = "ID do aluno é obrigatório")
    private Long alunoId;
    
    @NotNull(message = "Quantidade de moedas é obrigatória")
    @Positive(message = "Quantidade deve ser maior que zero")
    private Double quantidade;
    
    @NotBlank(message = "Motivo é obrigatório")
    private String motivo;

    public EnviarMoedasRequestDTO() {}

    public EnviarMoedasRequestDTO(Long alunoId, Double quantidade, String motivo) {
        this.alunoId = alunoId;
        this.quantidade = quantidade;
        this.motivo = motivo;
    }

    // Getters e Setters
    public Long getAlunoId() { return alunoId; }
    public void setAlunoId(Long alunoId) { this.alunoId = alunoId; }

    public Double getQuantidade() { return quantidade; }
    public void setQuantidade(Double quantidade) { this.quantidade = quantidade; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}
