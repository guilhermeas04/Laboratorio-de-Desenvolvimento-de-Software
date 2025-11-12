package com.projeto.model;

import java.util.Date;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
public class Cupom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigo;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date dataGeracao;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date dataVencimento;
    
    private boolean valido;
    
    // Relacionamentos
    @ManyToOne
    private Aluno aluno;
    
    @ManyToOne
    private Vantagem vantagem;
    
    @ManyToOne
    private EmpresaParceira empresa;
    
    private boolean utilizado;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date dataUtilizacao;

    public Cupom() {}

    public Cupom(String codigo, Date dataGeracao, Date dataVencimento, boolean valido, 
                 Aluno aluno, Vantagem vantagem, EmpresaParceira empresa) {
        this.codigo = codigo;
        this.dataGeracao = dataGeracao;
        this.dataVencimento = dataVencimento;
        this.valido = valido;
        this.aluno = aluno;
        this.vantagem = vantagem;
        this.empresa = empresa;
        this.utilizado = false;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public Date getDataGeracao() { return dataGeracao; }
    public void setDataGeracao(Date dataGeracao) { this.dataGeracao = dataGeracao; }

    public Date getDataVencimento() { return dataVencimento; }
    public void setDataVencimento(Date dataVencimento) { this.dataVencimento = dataVencimento; }

    public boolean isValido() { return valido; }
    public void setValido(boolean valido) { this.valido = valido; }

    public Aluno getAluno() { return aluno; }
    public void setAluno(Aluno aluno) { this.aluno = aluno; }

    public Vantagem getVantagem() { return vantagem; }
    public void setVantagem(Vantagem vantagem) { this.vantagem = vantagem; }

    public EmpresaParceira getEmpresa() { return empresa; }
    public void setEmpresa(EmpresaParceira empresa) { this.empresa = empresa; }

    public boolean isUtilizado() { return utilizado; }
    public void setUtilizado(boolean utilizado) { this.utilizado = utilizado; }

    public Date getDataUtilizacao() { return dataUtilizacao; }
    public void setDataUtilizacao(Date dataUtilizacao) { this.dataUtilizacao = dataUtilizacao; }

    @Override
    public String toString() { 
        return "Cupom{" +
                "codigo='" + codigo + '\'' +
                ", valido=" + valido +
                ", utilizado=" + utilizado +
                '}'; 
    }
}
