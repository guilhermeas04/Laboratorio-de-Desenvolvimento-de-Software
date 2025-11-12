package com.projeto.service;

import com.projeto.model.Aluno;
import com.projeto.model.Professor;
import com.projeto.model.Cupom;
import com.projeto.model.EmpresaParceira;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Serviço para envio de notificações por email
 * Nota: Esta é uma implementação simplificada que registra logs.
 * Em produção, integraria com Spring Mail (JavaMailSender) ou serviço de email externo.
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    /**
     * Notifica um aluno sobre o recebimento de moedas
     * @param aluno Aluno que recebeu as moedas
     * @param professor Professor que enviou as moedas
     * @param quantidade Quantidade de moedas enviadas
     * @param motivo Motivo do envio
     */
    public void notificarRecebimentoMoedas(Aluno aluno, Professor professor, Double quantidade, String motivo) {
        // TODO: Implementar envio real de email em produção
        // Para MVP, apenas registramos em log
        
        String destinatario = aluno.getEmail();
        String assunto = "Você recebeu " + String.format("%.2f", quantidade) + " moedas!";
        String corpo = String.format(
            "Olá %s,\n\n" +
            "Você recebeu %.2f moedas do professor %s.\n\n" +
            "Motivo: %s\n\n" +
            "Seu novo saldo é de %.2f moedas.\n\n" +
            "Aproveite para trocar suas moedas por vantagens!\n\n" +
            "Atenciosamente,\n" +
            "Sistema de Moedas Estudantis",
            aluno.getNome(),
            quantidade,
            professor.getNome(),
            motivo,
            aluno.getSaldoMoedas()
        );

        logger.info("===========================================");
        logger.info("EMAIL ENVIADO");
        logger.info("===========================================");
        logger.info("Para: {}", destinatario);
        logger.info("Assunto: {}", assunto);
        logger.info("Corpo:\n{}", corpo);
        logger.info("===========================================");

        // Exemplo de implementação com Spring Mail (comentado):
        /*
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(destinatario);
            helper.setSubject(assunto);
            helper.setText(corpo);
            helper.setFrom("noreply@sistema-moedas.com");
            
            mailSender.send(message);
            logger.info("Email enviado com sucesso para: {}", destinatario);
        } catch (Exception e) {
            logger.error("Erro ao enviar email para {}: {}", destinatario, e.getMessage());
            // Não lançamos exceção para não interromper a transação
        }
        */
    }

    /**
     * Envia cupom de resgate para o aluno
     * @param aluno Aluno que resgatou a vantagem
     * @param cupom Cupom gerado
     * @param vantagem Descrição da vantagem
     */
    public void enviarCupomAluno(Aluno aluno, Cupom cupom, String vantagem) {
        String destinatario = aluno.getEmail();
        String assunto = "Seu cupom de resgate - " + vantagem;
        String corpo = String.format(
            "Olá %s,\n\n" +
            "Parabéns! Você resgatou com sucesso a vantagem: %s\n\n" +
            "=== CÓDIGO DO CUPOM ===\n" +
            "%s\n" +
            "=======================\n\n" +
            "Válido até: %s\n" +
            "Data de resgate: %s\n\n" +
            "Por favor, apresente este código no local de resgate da vantagem.\n" +
            "Este cupom é pessoal e intransferível.\n\n" +
            "Atenciosamente,\n" +
            "Sistema de Moedas Estudantis",
            aluno.getNome(),
            vantagem,
            cupom.getCodigo(),
            cupom.getDataVencimento(),
            cupom.getDataGeracao()
        );

        logger.info("===========================================");
        logger.info("EMAIL DE CUPOM ENVIADO AO ALUNO");
        logger.info("===========================================");
        logger.info("Para: {}", destinatario);
        logger.info("Assunto: {}", assunto);
        logger.info("Código do Cupom: {}", cupom.getCodigo());
        logger.info("Corpo:\n{}", corpo);
        logger.info("===========================================");
    }

    /**
     * Envia notificação à empresa sobre o resgate de vantagem
     * @param empresa Empresa parceira
     * @param aluno Aluno que resgatou
     * @param cupom Cupom gerado
     * @param vantagem Descrição da vantagem
     * @param custo Custo em moedas
     */
    public void enviarNotificacaoEmpresa(EmpresaParceira empresa, Aluno aluno, Cupom cupom, String vantagem, Double custo) {
        String destinatario = empresa.getEmail();
        String assunto = "Novo resgate de cupom - " + vantagem;
        String corpo = String.format(
            "Olá %s,\n\n" +
            "Um novo cupom foi resgatado em sua loja!\n\n" +
            "=== DETALHES DO RESGATE ===\n" +
            "Código do Cupom: %s\n" +
            "Vantagem: %s\n" +
            "Valor: %.2f moedas\n" +
            "Aluno: %s\n" +
            "Email do Aluno: %s\n" +
            "Data do Resgate: %s\n" +
            "============================\n\n" +
            "O aluno deve apresentar este código para utilizar a vantagem.\n" +
            "Por favor, registre a utilização do cupom em seu sistema.\n\n" +
            "Atenciosamente,\n" +
            "Sistema de Moedas Estudantis",
            empresa.getNomeFantasia() != null ? empresa.getNomeFantasia() : empresa.getNome(),
            cupom.getCodigo(),
            vantagem,
            custo,
            aluno.getNome(),
            aluno.getEmail(),
            cupom.getDataGeracao()
        );

        logger.info("===========================================");
        logger.info("EMAIL DE NOTIFICAÇÃO ENVIADO À EMPRESA");
        logger.info("===========================================");
        logger.info("Para: {}", destinatario);
        logger.info("Assunto: {}", assunto);
        logger.info("Código do Cupom: {}", cupom.getCodigo());
        logger.info("Corpo:\n{}", corpo);
        logger.info("===========================================");
    }
}
