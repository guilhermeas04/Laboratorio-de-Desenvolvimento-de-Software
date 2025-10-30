package com.projeto.dto;

import java.util.Date;

public class TransacaoResponseDTO {

      private Long id;
      private Long usuarioId;
      private String usuarioNome;
      private Long usuarioDestinoId;
      private String usuarioDestinoNome;
      private Date data;
      private double valor;
      private String tipo; // "ENVIO", "RESGATE", "CREDITO", "TRANSFERENCIA_PROFESSOR_ALUNO"
      private String motivo;

      // Constructors
      public TransacaoResponseDTO() {
      }

      public TransacaoResponseDTO(Long id, Long usuarioId, String usuarioNome, Long usuarioDestinoId,
                  String usuarioDestinoNome, Date data, double valor, String tipo, String motivo) {
            this.id = id;
            this.usuarioId = usuarioId;
            this.usuarioNome = usuarioNome;
            this.usuarioDestinoId = usuarioDestinoId;
            this.usuarioDestinoNome = usuarioDestinoNome;
            this.data = data;
            this.valor = valor;
            this.tipo = tipo;
            this.motivo = motivo;
      }

      // Getters and Setters
      public Long getId() {
            return id;
      }

      public void setId(Long id) {
            this.id = id;
      }

      public Long getUsuarioId() {
            return usuarioId;
      }

      public void setUsuarioId(Long usuarioId) {
            this.usuarioId = usuarioId;
      }

      public String getUsuarioNome() {
            return usuarioNome;
      }

      public void setUsuarioNome(String usuarioNome) {
            this.usuarioNome = usuarioNome;
      }

      public Long getUsuarioDestinoId() {
            return usuarioDestinoId;
      }

      public void setUsuarioDestinoId(Long usuarioDestinoId) {
            this.usuarioDestinoId = usuarioDestinoId;
      }

      public String getUsuarioDestinoNome() {
            return usuarioDestinoNome;
      }

      public void setUsuarioDestinoNome(String usuarioDestinoNome) {
            this.usuarioDestinoNome = usuarioDestinoNome;
      }

      public Date getData() {
            return data;
      }

      public void setData(Date data) {
            this.data = data;
      }

      public double getValor() {
            return valor;
      }

      public void setValor(double valor) {
            this.valor = valor;
      }

      public String getTipo() {
            return tipo;
      }

      public void setTipo(String tipo) {
            this.tipo = tipo;
      }

      public String getMotivo() {
            return motivo;
      }

      public void setMotivo(String motivo) {
            this.motivo = motivo;
      }
}
