package com.projeto.service;

import com.projeto.model.Aluno;
import com.projeto.model.Professor;
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
}
