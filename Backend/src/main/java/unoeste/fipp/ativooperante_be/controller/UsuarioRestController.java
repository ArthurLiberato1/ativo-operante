package unoeste.fipp.ativooperante_be.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import unoeste.fipp.ativooperante_be.controller.services.DenunciaService;
import unoeste.fipp.ativooperante_be.controller.services.UsuarioService;
import unoeste.fipp.ativooperante_be.model.Denuncia;
import unoeste.fipp.ativooperante_be.model.Erro;

import unoeste.fipp.ativooperante_be.model.Usuario;

import java.util.ArrayList;
import java.util.List;


@RestController
@RequestMapping("apis/usuario")
public class UsuarioRestController {
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private DenunciaService denunciaService;

    @GetMapping
    public ResponseEntity<Object> getUsuarios(){
        List<Usuario> lista = usuarioService.getAllUsuarios();
        if(lista!=null)
            return ResponseEntity.ok(lista);
        return ResponseEntity.badRequest().body(new Erro("Problemas em listar usuario"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getUsuarioId(@PathVariable Long id){
        Usuario elemento = usuarioService.getUsuarioId(id);
        if(elemento!=null)
            return ResponseEntity.ok(elemento);
        return ResponseEntity.badRequest().body(new Erro("Erro ao achar este Usuario"));
    }


    @PostMapping
    public ResponseEntity<Object> save(@RequestBody Usuario novo){
        Usuario aux = usuarioService.salvarUsuario(novo);
        if(aux==null){
            return ResponseEntity.badRequest().body(new Erro("Usuario"));
        }
        try{
            Usuario novoUsuario = usuarioService.salvarUsuario(novo);
            return ResponseEntity.ok(novoUsuario);
        }catch(Exception e){
            return ResponseEntity.badRequest().body(new Erro("Erro ao gravar o Usuario"));
        }


    }




    @PutMapping
    public ResponseEntity<Object> update(@RequestBody Usuario novo){
        try{
            Usuario alteradoUsuario = usuarioService.atualizarUsuario(novo);
            return ResponseEntity.ok(alteradoUsuario);
        }catch(Exception e){
            return ResponseEntity.badRequest().body(new Erro("Erro ao alterar Usuario"));

        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Long id){
        Usuario aux = usuarioService.getUsuarioId(id);

        if(aux!=null){
            List<Denuncia> denuncias=new ArrayList<>();
            denuncias=denunciaService.getAllByUsuario(id);
            if(!denuncias.isEmpty()){
                denunciaService.deleteByUsuario(aux);
            }
            boolean status = usuarioService.deletarUsuario(aux);
            if(status)
                return ResponseEntity.noContent().build();
            return ResponseEntity.badRequest().body(new Erro("Erro ao apagar usuario"));

        }
        return ResponseEntity.badRequest().body(new Erro("Erro ao encotrar usuario"));

    }


}
