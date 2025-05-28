package unoeste.fipp.ativooperante_be.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import unoeste.fipp.ativooperante_be.controller.services.UsuarioService;
import unoeste.fipp.ativooperante_be.model.Erro;
import unoeste.fipp.ativooperante_be.model.Usuario;

import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/login")
public class AcessoRestController {
    @Autowired
    UsuarioService usuarioService;

    @GetMapping("/autenticar/{email}/{senha}")
    public ResponseEntity<Object> autenticar(@PathVariable String email, @PathVariable Long senha){
        Usuario usuario=usuarioService.getUsuarioByEmail(email);
        if(usuario!=null && usuario.getSenha().equals(senha)){
            String token=usuarioService.autenticar(email, senha);
            Map<String,String> body = new HashMap<>();
            body.put("token", token);
            body.put("nivel", usuario.getNivel().toString());
            return ResponseEntity.ok(body);
        }
        else
            return ResponseEntity.badRequest().body(new Erro("Usuário ou senha inválidos"));
    }

}
