package unoeste.fipp.ativooperante_be.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import unoeste.fipp.ativooperante_be.controller.services.OrgaosService;
import unoeste.fipp.ativooperante_be.model.Erro;
import unoeste.fipp.ativooperante_be.model.Orgaos;

import java.util.List;


@RestController
@RequestMapping("apis/orgaos")
public class OrgaoRestController {

    @Autowired
    private OrgaosService orgaosService;


    @GetMapping("/listar")
    public ResponseEntity<Object> getOrgaos(){
        List<Orgaos> OrgaosList;
        OrgaosList=orgaosService.getAllOrgaos();
        if (!OrgaosList.isEmpty())
            return ResponseEntity.ok(OrgaosList);
        else
            return ResponseEntity.badRequest().body(
                    new Erro("Nenhum Orgaos cadastrado"));
    }

    @GetMapping("/buscar-id/{id}")
    public ResponseEntity<Object> getOrgaosId(@PathVariable Long id){
        Orgaos aux = orgaosService.getOrgaoId(id);
        if(aux!=null)
            return ResponseEntity.ok(aux);

        return ResponseEntity.badRequest().body(new Erro("Este id nao existe"));
    }

    @GetMapping("/buscar-nome/{nome}")
    public ResponseEntity<Object> getOrgaosNome(@PathVariable String nome){
        Orgaos aux = orgaosService.getOrgaoNome(nome);
        if(aux!=null)
            return ResponseEntity.ok(aux);

        return ResponseEntity.badRequest().body(new Erro("Este id nao existe"));
    }
    @PostMapping
    public ResponseEntity<Object> save(@RequestBody Orgaos Orgaos){
        Orgaos OrgaosAux=orgaosService.salvarOrgao(Orgaos);
        if(OrgaosAux!=null)
            return ResponseEntity.ok(OrgaosAux);
        return ResponseEntity.badRequest().body(new Erro("Erro ao gravar o Orgaos"));
    }


    @DeleteMapping("{id}")
    public ResponseEntity<Object> delete(@PathVariable Long id){
        Orgaos aux = orgaosService.getOrgaoId(id);

        if(aux!=null){
            boolean status = orgaosService.apagarOrgao(aux);
            if(status)
                return ResponseEntity.noContent().build();
            return ResponseEntity.badRequest().body(new Erro("Erro ao apagar Orgaos"));

        }

        return ResponseEntity.badRequest().body(new Erro("Erro ao encotrar Orgaos"));

    }

    @PutMapping
    public ResponseEntity<Object> update(@RequestBody Orgaos novo){

        try{
            Orgaos alteradoOrgaos = orgaosService.atualizarOrgao(novo);
            return ResponseEntity.ok(alteradoOrgaos);

        }catch(Exception e){
            return ResponseEntity.badRequest().body(new Erro("Erro ao alterar Orgaos"));
        }

    }



}
