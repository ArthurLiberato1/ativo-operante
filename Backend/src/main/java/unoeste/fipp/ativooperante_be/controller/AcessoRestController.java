package unoeste.fipp.ativooperante_be.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import unoeste.fipp.ativooperante_be.controller.services.UsuarioService;
import unoeste.fipp.ativooperante_be.model.Erro;
import unoeste.fipp.ativooperante_be.security.filters.JWTTokenProvider;


@RestController
@RequestMapping("/login")
public class AcessoRestController {
    @Autowired
    UsuarioService usuarioService;

    @Autowired
    HttpServletRequest request;

    @PostMapping("/autenticar/{login}/{senha}")
    public ResponseEntity<Object> autenticar(@PathVariable String login, @PathVariable Long senha){

        String token="";
        if (login.equals("admin@pm.br") && senha == 123321)
        {
            token = JWTTokenProvider.getToken(login, "ADM");
            return new ResponseEntity<>(token, HttpStatus.OK);
        }
        else{
            token=usuarioService.autenticar(login, senha);
            if(token!=null)
                return ResponseEntity.ok(token);
            else
                return ResponseEntity.badRequest().body(new Erro("Usuário não cadastrado"));

        }
        //return new ResponseEntity<>("ACESSO NAO PERMITIDO",HttpStatus.NOT_ACCEPTABLE);
    }

    @PostMapping("/acesso")
    public ResponseEntity <Object> acesso(){
        String token = request.getHeader("Authorization");
        if(JWTTokenProvider.verifyToken(token)){
            return new ResponseEntity<>("Requisição atendida",HttpStatus.OK);
        }
        return new ResponseEntity<>("Problemas com o token", HttpStatus.NON_AUTHORITATIVE_INFORMATION);

    }

}
