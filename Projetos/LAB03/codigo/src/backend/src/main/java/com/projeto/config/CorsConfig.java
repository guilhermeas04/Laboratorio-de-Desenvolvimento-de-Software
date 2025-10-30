package com.projeto.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

/**
 * Configuração global de CORS para permitir requisições cross-origin
 * de aplicações frontend rodando em diferentes portas/domínios
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Permite requisições de qualquer origem (em produção, especifique os domínios)
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        
        // Permite todos os headers
        config.addAllowedHeader("*");
        
        // Permite todos os métodos HTTP
        config.addAllowedMethod("*");
        
        // Expõe headers de resposta
        config.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "X-Requested-With",
            "Cache-Control"
        ));
        
        // Aplica a configuração para todas as rotas
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
