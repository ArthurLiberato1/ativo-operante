package unoeste.fipp.ativooperante_be.security.filters;

import java.io.IOException;
import java.util.Collections;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

public class AccessFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest  req  = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;
        String uri = req.getRequestURI();

        // 1) Se for login, deixa passar
        if (uri.startsWith("/login/")) {
            chain.doFilter(request, response);
            return;
        }

        // 2) Extrai JWT
        String header = req.getHeader("Authorization");
        String token  = (header != null && header.startsWith("Bearer "))
                ? header.substring(7) : null;

        if (token != null && JWTTokenProvider.verifyToken(token)) {
            String nivel = JWTTokenProvider.getAllClaimsFromToken(token).get("nivel").toString();

            // 3) Decide quem pode
            if ((uri.startsWith("/apis/admin")    && nivel.equals("1")) ||
                    (uri.startsWith("/apis/cidadao") && nivel.equals("2")) ||
                    (uri.startsWith("/apis/tipo")    && nivel.equals("2"))) {

                // 4) Popula o SecurityContext para o Spring Security
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken("user", null, Collections.emptyList());
                SecurityContextHolder.getContext().setAuthentication(auth);

                // 5) deixa passar
                chain.doFilter(request, response);
                return;
            } else {
                resp.setStatus(403);
                resp.getOutputStream().write("Não autorizado: Acesso negado".getBytes());
                return;
            }
        }

        // 6) Sem token ou inválido
        resp.setStatus(401);
        resp.getOutputStream().write("Não autorizado: Token inválido ou ausente".getBytes());
    }
}
