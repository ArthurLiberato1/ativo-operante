package unoeste.fipp.ativooperante_be.controller.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import unoeste.fipp.ativooperante_be.model.Denuncia;
import unoeste.fipp.ativooperante_be.model.FeedBack;
import unoeste.fipp.ativooperante_be.model.repositories.FeedBackRepository;

import java.util.List;

@Service
public class FeedBackService {

    @Autowired
    private FeedBackRepository feedRepo;

    public FeedBack salvarFeedBack(FeedBack elemento){
        return feedRepo.save(elemento);
    }
    public FeedBack atualizarFeedBack(FeedBack novo){
        FeedBack elemento = null;
        try{
            elemento = feedRepo.findById(novo.getFee_id()).orElse(null);
            if(elemento!=null)
            {
                elemento.setFee_texto(novo.getFee_texto());
                elemento.setDen_id(novo.getDen_id());
                feedRepo.save(elemento);
            }

        }catch(Exception e){
            return null;
        }
        return elemento;
    }

    public boolean deletarFeedBack(Long id){
        boolean retorno = false;
        try{
            FeedBack feed = feedRepo.findById(id).orElse(null);
            if(feed!=null){
                feedRepo.delete(feed);
                retorno = true;
            }
        }catch(Exception e){
            retorno = false;
        }
        return retorno;
    }

    public List<FeedBack> getAll(){
        return feedRepo.findAll();
    }

    public FeedBack getFeedBackId(Long id){
        return feedRepo.findById(id).orElse(null);
    }

    public FeedBack getByDenunciaId(Long id){
        return feedRepo.getFeedBacksByDenuncia(new Denuncia(id,"","",0,null,null,null,null,null));
    }




}
