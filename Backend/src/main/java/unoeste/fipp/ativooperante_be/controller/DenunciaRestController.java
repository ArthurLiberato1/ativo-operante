package unoeste.fipp.ativooperante_be.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import unoeste.fipp.ativooperante_be.model.Denuncia;
import unoeste.fipp.ativooperante_be.model.Erro;
import unoeste.fipp.ativooperante_be.controller.services.DenunciaService;
import unoeste.fipp.ativooperante_be.model.FeedBack;


import java.util.List;

@RestController
@RequestMapping("apis/denuncia")
public class DenunciaRestController {

    @Autowired
    private DenunciaService denunciaService;


    @PostMapping
    public ResponseEntity<Object> cadastro(@RequestBody Denuncia elemento) {
        Denuncia aux = denunciaService.salvarDenuncia(elemento);
        if (aux != null)
            return ResponseEntity.ok(aux);
        return ResponseEntity.badRequest().body(new Erro("Erro ao cadastrar Denuncia"));
    }


    @GetMapping("/denuncia")
    public ResponseEntity<Object> getDenuncias(){
        List<Denuncia> DenunciaList;
        DenunciaList = denunciaService.getAll();
        if (!DenunciaList.isEmpty())
            return ResponseEntity.ok(DenunciaList);
        return ResponseEntity.badRequest().body(new Erro("Nenhum Denuncia cadastrado"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getDenunciaId(@PathVariable Long id){
        Denuncia aux = denunciaService.getDenunciaId(id);
        if(aux!=null)
            return ResponseEntity.ok(aux);

        return ResponseEntity.badRequest().body(new Erro("Este id nao existe"));
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Long id){
        Denuncia aux = denunciaService.getDenunciaId(id);

        if(aux!=null){
            boolean status = denunciaService.deleteDenuncia(aux);
            if(status)
                return ResponseEntity.noContent().build();
            return ResponseEntity.badRequest().body(new Erro("Erro ao apagar Denuncia"));

        }

        return ResponseEntity.badRequest().body(new Erro("Erro ao encotrar Denuncia"));

    }

    @PutMapping
    public ResponseEntity<Object> update(@RequestBody Denuncia novo){

        try{
            Denuncia alteradoDenuncia = denunciaService.salvarDenuncia(novo);
            return ResponseEntity.ok(alteradoDenuncia);

        }catch(Exception e){
            return ResponseEntity.badRequest().body(new Erro("Erro ao alterar Denuncia"));
        }

    }

    @GetMapping("/add-feedback/{id}/{texto}")
    public ResponseEntity<Object> addFeedBack(@PathVariable Long id, @PathVariable String texto) {
        if(denunciaService.addFeedBack(new FeedBack(id,texto)))
            return ResponseEntity.noContent().build();
        else
            return ResponseEntity.badRequest().body("Não foi possível adicionar o feebback");
    }

    @GetMapping("/usuario/{id}")
    public ResponseEntity<Object> getAllByUsuario(@PathVariable Long id){
        List<Denuncia> denunciaList;
        denunciaList=denunciaService.getAllByUsuario(id);
        if (!denunciaList.isEmpty())
            return ResponseEntity.ok(denunciaList);
        else
            return ResponseEntity.badRequest().body(
                    new Erro("Nenhuma denuncia cadastrada para esse usuário"));
    }


}
