package unoeste.fipp.ativooperante_be.controller.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unoeste.fipp.ativooperante_be.model.Denuncia;
import unoeste.fipp.ativooperante_be.model.Denuncia;
import unoeste.fipp.ativooperante_be.model.FeedBack;
import unoeste.fipp.ativooperante_be.model.Usuario;
import unoeste.fipp.ativooperante_be.model.repositories.DenunciaRepository;
import unoeste.fipp.ativooperante_be.model.repositories.FeedBackRepository;

import java.util.List;

@Service
public class DenunciaService {

    @Autowired
    DenunciaRepository denunciaRepository;

    @Autowired
    FeedBackRepository feedBackRepository;

    @Transactional
    public void deleteByUsuario(Usuario usuario) {
        denunciaRepository.deleteByUsuario(usuario);
    }
    public List<Denuncia> getAll(){
        return denunciaRepository.findAll();
    }
    public Denuncia getDenunciaId(Long id){
        return denunciaRepository.findById(id).orElse(null);
    }
    //

    public Denuncia salvarDenuncia(Denuncia Denuncia){
        return denunciaRepository.save(Denuncia);
    }
    public boolean addFeedBack(FeedBack feedBack){
        try {
            denunciaRepository.addFeedBack(feedBack.getId(), feedBack.getTexto());
            return true;
        }
        catch (Exception e){
            return false;
        }
    }

    public List<Denuncia> getAllByUsuario(Long id) {
        return denunciaRepository.findAllByUsuario( new Usuario(id,0L));
    }




    public boolean deleteByUsuarios(Usuario usuario) {
        try {
            List<Denuncia> denuncias = denunciaRepository.findAllByUsuario(usuario);

            for (Denuncia d : denuncias) {
                denunciaRepository.delete(d);
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean deleteDenuncia(Denuncia denuncia){
        FeedBack feedBack = denuncia.getFeedBack();
        if(feedBack!= null && feedBack.getDen_id().getId() == denuncia.getId()){
            feedBackRepository.delete(feedBack);

        }

        denunciaRepository.delete(denuncia);
        
        return true;

    }



    public Denuncia atualizarDenuncia(Denuncia novo){
        Denuncia status = null;
        try{
            Denuncia elemento = denunciaRepository.findById(novo.getId()).orElse(null);
            if(elemento!=null){
                elemento.setTexto(novo.getTexto());
                status = elemento;
                denunciaRepository.save(elemento);

            }

        }catch(Exception e){
            return status;
        }
        return status;
    }

    
}
