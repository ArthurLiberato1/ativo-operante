package unoeste.fipp.ativooperante_be.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import unoeste.fipp.ativooperante_be.controller.services.TipoService;
import unoeste.fipp.ativooperante_be.model.Erro;
import unoeste.fipp.ativooperante_be.model.Tipo;

import java.util.List;

@RestController
@RequestMapping("apis/tipo")
public class TipoRestController {
    @Autowired
    private TipoService tipoService;

    @GetMapping
    public ResponseEntity<Object> getTipos(){
        List<Tipo> tipoList;
        tipoList=tipoService.getAll();
        if (!tipoList.isEmpty())
            return ResponseEntity.ok(tipoList);
        else
            return ResponseEntity.badRequest().body(
                    new Erro("Nenhum tipo cadastrado"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getTipoId(@PathVariable Long id){
        Tipo aux = tipoService.getTipoId(id);
        if(aux!=null)
            return ResponseEntity.ok(aux);

        return ResponseEntity.badRequest().body(new Erro("Este id nao existe"));
    }
    @PostMapping
    public ResponseEntity<Object> save(@RequestBody Tipo tipo){
        Tipo tipoAux=tipoService.salvarTipo(tipo);
        if(tipoAux!=null)
            return ResponseEntity.ok(tipoAux);
        return ResponseEntity.badRequest().body(new Erro("Erro ao gravar o tipo"));
    }


    @DeleteMapping("{id}")
    public ResponseEntity<Object> delete(@PathVariable Long id){
        Tipo aux = tipoService.getTipoId(id);

        if(aux!=null){
            boolean status = tipoService.deleteTipo(aux);
            if(status)
                return ResponseEntity.noContent().build();
            return ResponseEntity.badRequest().body(new Erro("Erro ao apagar tipo"));

        }

        return ResponseEntity.badRequest().body(new Erro("Erro ao encotrar tipo"));

    }

    @PutMapping
    public ResponseEntity<Object> update(@RequestBody Tipo novo){

        try{
            Tipo alteradoTipo = tipoService.atualizarTipo(novo);
            return ResponseEntity.ok(alteradoTipo);

        }catch(Exception e){
            return ResponseEntity.badRequest().body(new Erro("Erro ao alterar tipo"));
        }

    }





}
