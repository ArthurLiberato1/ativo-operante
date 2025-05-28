package unoeste.fipp.ativooperante_be.controller.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import unoeste.fipp.ativooperante_be.model.Tipo;
import unoeste.fipp.ativooperante_be.model.repositories.TipoRepository;

import java.util.List;

@Service
public class TipoService {
    @Autowired
    private TipoRepository tipoRepository;

    public List<Tipo> getAll(){
        return tipoRepository.findAll();
    }
    public Tipo getTipoId(Long id){
        return tipoRepository.findById(id).orElse(null);
    }
    public Tipo getTipoNome(String nome){ return tipoRepository.findByNome(nome);}
    public Tipo salvarTipo(Tipo tipo){
        return tipoRepository.save(tipo);
    }
    public boolean deleteTipo(Tipo tipo){
        try{
            Tipo elemento = tipoRepository.findById(tipo.getId()).orElse(null);
            if(elemento!=null){
                tipoRepository.delete(elemento);
                return true;
            }

        }catch(Exception e){
            return false;
        }
        return false;
    }
    public Tipo atualizarTipo(Tipo novo){
        Tipo status = null;
        try{
            Tipo elemento = tipoRepository.findById(novo.getId()).orElse(null);
            if(elemento!=null){
               
                status = elemento;
                tipoRepository.save(elemento);

            }

        }catch(Exception e){
            return status;
        }
        return status;
    }






}
