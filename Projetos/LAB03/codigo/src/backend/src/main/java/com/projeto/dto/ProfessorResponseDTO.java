package com.projeto.dto;

public class ProfessorResponseDTO {
    
    private Long id;
    private String nome;
    private String documento;
    private String email;
    private String login;
    private String departamento;
    private Double saldoMoedas;
    private Long instituicaoId;
    private String instituicaoNome;

    // Construtores
    public ProfessorResponseDTO() {}

    public ProfessorResponseDTO(Long id, String nome, String documento, String email, 
                               String login, String departamento, Double saldoMoedas,
                               Long instituicaoId, String instituicaoNome) {
        this.id = id;
        this.nome = nome;
        this.documento = documento;
        this.email = email;
        this.login = login;
        this.departamento = departamento;
        this.saldoMoedas = saldoMoedas;
        this.instituicaoId = instituicaoId;
        this.instituicaoNome = instituicaoNome;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }

    public Double getSaldoMoedas() { return saldoMoedas; }
    public void setSaldoMoedas(Double saldoMoedas) { this.saldoMoedas = saldoMoedas; }

    public Long getInstituicaoId() { return instituicaoId; }
    public void setInstituicaoId(Long instituicaoId) { this.instituicaoId = instituicaoId; }

    public String getInstituicaoNome() { return instituicaoNome; }
    public void setInstituicaoNome(String instituicaoNome) { this.instituicaoNome = instituicaoNome; }
}
