package unoeste.fipp.ativooperante_be.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import unoeste.fipp.ativooperante_be.controller.services.FeedBackService;
import unoeste.fipp.ativooperante_be.model.Erro;
import unoeste.fipp.ativooperante_be.model.FeedBack;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("apis/feedback")
public class FeedbackRestController {

    @Autowired
    private FeedBackService feedBackService;

    @GetMapping("/{id}")
    public ResponseEntity<Object> getfeedbackId(@PathVariable Long id){
        FeedBack aux = feedBackService.getFeedBackId(id);
        if(aux!=null)
            return ResponseEntity.ok(aux);

        return ResponseEntity.badRequest().body(new Erro("Este id nao existe"));
    }
    @PostMapping
    public ResponseEntity<Object> save(@RequestBody FeedBack elemento){
        FeedBack feedbackAux=feedBackService.salvarFeedBack(elemento);
        if(feedbackAux!=null)
            return ResponseEntity.ok(feedbackAux);
        return ResponseEntity.badRequest().body(new Erro("Erro ao gravar o feedback"));
    }


    @DeleteMapping("{id}")
    public ResponseEntity<Object> delete(@PathVariable Long id){
        FeedBack aux = feedBackService.getFeedBackId(id);

        if(aux!=null){
            boolean status = feedBackService.deletarFeedBack(aux.getId());
            if(status)
                return ResponseEntity.noContent().build();
            return ResponseEntity.badRequest().body(new Erro("Erro ao apagar feedback"));

        }

        return ResponseEntity.badRequest().body(new Erro("Erro ao encotrar feedback"));

    }

    @PutMapping
    public ResponseEntity<Object> update(@RequestBody FeedBack novo){

        try{
            FeedBack alteradofeedback = feedBackService.salvarFeedBack(novo);
            return ResponseEntity.ok(alteradofeedback);

        }catch(Exception e){
            return ResponseEntity.badRequest().body(new Erro("Erro ao alterar feedback"));
        }

    }


}
