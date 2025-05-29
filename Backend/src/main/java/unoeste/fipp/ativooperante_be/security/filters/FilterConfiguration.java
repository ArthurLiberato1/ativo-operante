package unoeste.fipp.ativooperante_be.security.filters;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class FilterConfiguration {

    // CORS

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // ✅ CONFIGURAÇÕES MAIS PERMISSIVAS PARA DEBUG
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*"); // ou especifique: "http://localhost:3000", "http://127.0.0.1:5500"
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        // ✅ HEADERS ESPECÍFICOS PARA JWT
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Content-Type");

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    // Expõe o AccessFilter como bean para injeção no SecurityConfig
    @Bean
    public AccessFilter accessFilter() {
        return new AccessFilter();
    }
}


