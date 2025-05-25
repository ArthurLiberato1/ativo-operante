package unoeste.fipp.ativooperante_be.controller.services;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import unoeste.fipp.ativooperante_be.model.Orgaos;
import unoeste.fipp.ativooperante_be.model.repositories.OrgaosRepository;

import java.util.*;

@Service
public class OrgaosService {
    @Autowired
    private OrgaosRepository orgaoRepo;


    /*
    * Criar: Create(save), Read(get), Update, Delete
    * */
    public Orgaos salvarOrgao(Orgaos elemento){
        Orgaos novoOrgao;
        try{
            novoOrgao = orgaoRepo.save(elemento);
        }catch(Exception e){
            novoOrgao = null;
        }
        return novoOrgao;
    }

    public List<Orgaos> getAllOrgaos(){
        return orgaoRepo.findAll();
    }

    public Orgaos getOrgaoId(Long id){
        return orgaoRepo.findById(id).orElse(null);
    }

    public boolean apagarOrgao(Orgaos elemento){
        Orgaos orgao = orgaoRepo.findById(elemento.getOrg_id()).orElse(null);
        try{
            if(orgao!=null){
                orgaoRepo.delete(orgao);
                return true;
            }

        }catch(Exception e){
            return false;
        }

        return false;
    }

    public Orgaos atualizarOrgao(Orgaos novo){
        try{
            Orgaos elemento = orgaoRepo.findById(novo.getOrg_id()).orElse(null);
            if(elemento!=null){
                elemento.setOrg_nome(novo.getOrg_nome());
                return orgaoRepo.save(elemento);
            }

        }catch(Exception e){
            return null;
        }
        return null;
    }
}
