package unoeste.fipp.ativooperante_be.security.filters;


import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

import javax.crypto.SecretKey;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

public class JWTTokenProvider {
    private static final SecretKey CHAVE = Keys.hmacShaKeyFor(
            "AbCdEfGhIjKlMnOpQrStUvWxYz123456".getBytes(StandardCharsets.UTF_8)
    );

    static public String getToken(String usuario, String nivel) {
        String jwtToken = Jwts.builder()
                .setSubject(usuario) // ✅ CORREÇÃO: usar o parâmetro usuario
                .setIssuer("localhost:8080")
                .claim("nivel", nivel)
                .claim("email", usuario) // ✅ ADICIONAR: claim do email para facilitar acesso
                .setIssuedAt(new Date())
                .setExpiration(Date.from(LocalDateTime.now().plusMinutes(30L)
                        .atZone(ZoneId.systemDefault()).toInstant()))
                .signWith(CHAVE)
                .compact();
        System.out.println("JWT TOKEN: " + jwtToken);
        System.out.println("Usuario: " + usuario + ", Nivel: " + nivel); // ✅ DEBUG
        return jwtToken;
    }

    static public boolean verifyToken(String token) {
        try {
            // ✅ MELHORAR: remover "Bearer " se presente
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            Jwts.parserBuilder()
                    .setSigningKey(CHAVE)
                    .build()
                    .parseClaimsJws(token).getSignature();
            return true;
        } catch (Exception e) {
            System.out.println("Erro na validação do token: " + e.getMessage());
        }
        return false;
    }

    static public Claims getAllClaimsFromToken(String token) {
        Claims claims = null;
        try {
            // ✅ MELHORAR: remover "Bearer " se presente
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            claims = Jwts.parserBuilder()
                    .setSigningKey(CHAVE)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            System.out.println("Erro ao recuperar as informações (claims): " + e.getMessage());
        }
        return claims;
    }

}
