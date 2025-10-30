package com.projeto.model;

import java.util.Date;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Transacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Usuario usuario;

    @ManyToOne
    private Usuario usuarioDestino;

    private Date data;
    private double valor;
    private String tipo;
    private String motivo;

    public Transacao() {}

    public Transacao(Usuario usuario, Usuario usuarioDestino, Date data, double valor, String tipo, String motivo) {
        this.usuario = usuario;
        this.usuarioDestino = usuarioDestino;
        this.data = data;
        this.valor = valor;
        this.tipo = tipo;
        this.motivo = motivo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Usuario getUsuarioDestino() { return usuarioDestino; }
    public void setUsuarioDestino(Usuario usuarioDestino) { this.usuarioDestino = usuarioDestino; }

    public Date getData() { return data; }
    public void setData(Date data) { this.data = data; }

    public double getValor() { return valor; }
    public void setValor(double valor) { this.valor = valor; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    @Override
    public String toString() {
        return "Transacao{id=" + id + ", data=" + data + ", valor=" + valor + ", tipo='" + tipo + "'}";
    }
}
