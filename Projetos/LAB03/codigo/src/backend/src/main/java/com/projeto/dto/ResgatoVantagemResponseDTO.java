package com.projeto.dto;

import java.util.Date;

/**
 * DTO para resposta de resgate de vantagem
 * Contém informações do cupom e da transação
 */
public class ResgatoVantagemResponseDTO {
    
    private Long vantagemId;
    private String vantagemDescricao;
    private Double custoMoedas;
    private String codigoCupom;
    private Date dataResgate;
    private Double novoSaldo;
    private String emailAluno;
    private String nomeAluno;
    private String empresaNome;
    private String emailEmpresa;
    private Boolean emailEnviado;

    public ResgatoVantagemResponseDTO() {}

    public ResgatoVantagemResponseDTO(Long vantagemId, String vantagemDescricao, Double custoMoedas,
                                       String codigoCupom, Date dataResgate, Double novoSaldo,
                                       String emailAluno, String nomeAluno, String empresaNome,
                                       String emailEmpresa, Boolean emailEnviado) {
        this.vantagemId = vantagemId;
        this.vantagemDescricao = vantagemDescricao;
        this.custoMoedas = custoMoedas;
        this.codigoCupom = codigoCupom;
        this.dataResgate = dataResgate;
        this.novoSaldo = novoSaldo;
        this.emailAluno = emailAluno;
        this.nomeAluno = nomeAluno;
        this.empresaNome = empresaNome;
        this.emailEmpresa = emailEmpresa;
        this.emailEnviado = emailEnviado;
    }

    // Getters and Setters
    public Long getVantagemId() { return vantagemId; }
    public void setVantagemId(Long vantagemId) { this.vantagemId = vantagemId; }

    public String getVantagemDescricao() { return vantagemDescricao; }
    public void setVantagemDescricao(String vantagemDescricao) { this.vantagemDescricao = vantagemDescricao; }

    public Double getCustoMoedas() { return custoMoedas; }
    public void setCustoMoedas(Double custoMoedas) { this.custoMoedas = custoMoedas; }

    public String getCodigoCupom() { return codigoCupom; }
    public void setCodigoCupom(String codigoCupom) { this.codigoCupom = codigoCupom; }

    public Date getDataResgate() { return dataResgate; }
    public void setDataResgate(Date dataResgate) { this.dataResgate = dataResgate; }

    public Double getNovoSaldo() { return novoSaldo; }
    public void setNovoSaldo(Double novoSaldo) { this.novoSaldo = novoSaldo; }

    public String getEmailAluno() { return emailAluno; }
    public void setEmailAluno(String emailAluno) { this.emailAluno = emailAluno; }

    public String getNomeAluno() { return nomeAluno; }
    public void setNomeAluno(String nomeAluno) { this.nomeAluno = nomeAluno; }

    public String getEmpresaNome() { return empresaNome; }
    public void setEmpresaNome(String empresaNome) { this.empresaNome = empresaNome; }

    public String getEmailEmpresa() { return emailEmpresa; }
    public void setEmailEmpresa(String emailEmpresa) { this.emailEmpresa = emailEmpresa; }

    public Boolean getEmailEnviado() { return emailEnviado; }
    public void setEmailEnviado(Boolean emailEnviado) { this.emailEnviado = emailEnviado; }

    @Override
    public String toString() {
        return "ResgatoVantagemResponseDTO{" +
                "vantagemId=" + vantagemId +
                ", vantagemDescricao='" + vantagemDescricao + '\'' +
                ", custoMoedas=" + custoMoedas +
                ", codigoCupom='" + codigoCupom + '\'' +
                ", dataResgate=" + dataResgate +
                ", novoSaldo=" + novoSaldo +
                ", nomeAluno='" + nomeAluno + '\'' +
                ", empresaNome='" + empresaNome + '\'' +
                ", emailEnviado=" + emailEnviado +
                '}';
    }
}
