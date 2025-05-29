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

    static public String getToken(String usuario,String nivel)
    {
        String jwtToken = Jwts.builder()
                .setSubject("usuario")
                .setIssuer("localhost:8080")
                .claim("nivel", nivel)
                .setIssuedAt(new Date())
                .setExpiration(Date.from(LocalDateTime.now().plusMinutes(30L)
                        .atZone(ZoneId.systemDefault()).toInstant()))
                .signWith(CHAVE)
                .compact();
        System.out.println("JWT TOKEN: "+jwtToken);
        return jwtToken;
    }

    static public boolean verifyToken(String token)
    {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(CHAVE)
                    .build()
                    .parseClaimsJws(token).getSignature();
            return true;
        } catch (Exception e) {
            System.out.println(e);
        }
        return false;
    }

    static public Claims getAllClaimsFromToken(String token)
    {
        Claims claims=null;
        try {
            claims = Jwts.parserBuilder()
                    .setSigningKey(CHAVE)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            System.out.println("Erro ao recuperar as informações (claims)");
        }
        return claims;
    }

}
