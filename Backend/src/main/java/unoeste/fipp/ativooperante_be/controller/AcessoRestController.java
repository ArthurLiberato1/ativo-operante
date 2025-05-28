package unoeste.fipp.ativooperante_be.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import unoeste.fipp.ativooperante_be.controller.services.UsuarioService;
import unoeste.fipp.ativooperante_be.model.Erro;


@RestController
@RequestMapping("/login")
public class AcessoRestController {
    @Autowired
    UsuarioService usuarioService;

    @GetMapping("/autenticar/{nome}/{senha}")
    public ResponseEntity<Object> autenticar(@PathVariable String nome, @PathVariable Long senha){
        System.out.println("CHEGOU EM AUTENTICAR");
        String token=usuarioService.autenticar(nome, senha);
        if(token!=null)
            return ResponseEntity.ok(token);
        else
            return ResponseEntity.badRequest().body(new Erro("Usuário ou senha inválidos"));
    }

}
