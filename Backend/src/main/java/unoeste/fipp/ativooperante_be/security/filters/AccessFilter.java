package unoeste.fipp.ativooperante_be.security.filters;

import java.io.IOException;
import java.util.Collections;

import jakarta.servlet.*;
import jakarta.servlet.http.*;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

public class AccessFilter implements Filter {

    private String normalize(String uri) {
        if (uri.endsWith("/") && uri.length() > 1) {
            return uri.substring(0, uri.length() - 1);
        }
        return uri;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest  req  = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        String uri    = normalize(req.getRequestURI());
        String method = req.getMethod();

        // 1) libera /login/**
        if (uri.startsWith("/login")) {
            chain.doFilter(request, response);
            return;
        }

        // 2) extrai token
        String header = req.getHeader("Authorization");
        String token  = (header != null && header.startsWith("Bearer "))
                ? header.substring(7)
                : null;
        if (token == null || !JWTTokenProviderHolder.INSTANCE.verifyToken(token)) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getOutputStream()
                    .write("Não autorizado: Token inválido ou ausente".getBytes());
            return;
        }

        // 3) lê claims
        var claims = JWTTokenProviderHolder.INSTANCE.getAllClaimsFromToken(token);
        String nivel = claims.get("nivel").toString();
        String email = claims.getSubject();

        // 4) define endpoints restritos a ADMIN
        boolean adminOnly =
                // CRUD em /apis/tipo
                ((uri.equals("/apis/tipo")   || uri.startsWith("/apis/tipo/"))
                        && (method.equals("POST") || method.equals("PUT") || method.equals("DELETE")))
                        || // CRUD em /apis/orgao
                        ((uri.equals("/apis/orgaos")  || uri.startsWith("/apis/orgaos/"))
                                && (method.equals("POST") || method.equals("PUT") || method.equals("DELETE")))
                        || // listar todas denúncias
                        (method.equals("GET")    && uri.equals("/apis/denuncia"))
                        || // deletar denúncia
                        (method.equals("DELETE") && uri.matches("/apis/denuncia/\\d+"))
                        || // feedback
                        uri.startsWith("/apis/denuncia/add-feedback");

        // 5) ADMIN: tudo liberado
        if ("1".equals(nivel)) {
            setAuth(email);
            chain.doFilter(request, response);
            return;
        }

        // 6) CIDADÃO: só se NÃO for adminOnly
        if ("2".equals(nivel) && !adminOnly) {
            setAuth(email);
            chain.doFilter(request, response);
            return;
        }

        // 7) caso contrário, 403
        resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
        resp.getOutputStream()
                .write("Não autorizado: Acesso negado".getBytes());
    }

    private void setAuth(String principal) {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    // Holder para fornecer a instância do JWTTokenProvider sem injeção
    private static class JWTTokenProviderHolder {
        private static final JWTTokenProvider INSTANCE = new JWTTokenProvider();
    }
}
