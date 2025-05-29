package unoeste.fipp.ativooperante_be.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import unoeste.fipp.ativooperante_be.controller.services.UsuarioService;
import unoeste.fipp.ativooperante_be.model.Erro;


@RestController
@RequestMapping("/login")
public class AcessoRestController {

    private UsuarioService usuarioService;
    public AcessoRestController(UsuarioService usuarioService){
        this.usuarioService = usuarioService;
    }

    @GetMapping("/autenticar/{email}/{senha}")
    public ResponseEntity<Object> autenticar(@PathVariable String email, @PathVariable Long senha){
        String token=usuarioService.autenticar(email, senha);
        if(token!=null)
            return ResponseEntity.ok(token);
        else
            return ResponseEntity.badRequest().body(new Erro("Usuário não cadastrado"));
    }

}
