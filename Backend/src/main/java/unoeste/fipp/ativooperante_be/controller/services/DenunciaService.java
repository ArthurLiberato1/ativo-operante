package unoeste.fipp.ativooperante_be.controller.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unoeste.fipp.ativooperante_be.model.Denuncia;
import unoeste.fipp.ativooperante_be.model.Denuncia;
import unoeste.fipp.ativooperante_be.model.FeedBack;
import unoeste.fipp.ativooperante_be.model.Usuario;
import unoeste.fipp.ativooperante_be.model.repositories.DenunciaRepository;

import java.util.List;

@Service
public class DenunciaService {

    @Autowired
    DenunciaRepository denunciaRepository;
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
            denunciaRepository.addFeedBack(feedBack.getFee_id(), feedBack.getFee_texto());
            return true;
        }
        catch (Exception e){
            return false;
        }
    }

    public List<Denuncia> getAllByUsuario(Long id) {
        return denunciaRepository.findAllByUsuario( new Usuario(id,0L));
    }


    public boolean deleteDenuncia(Denuncia Denuncia){
        try{
            Denuncia elemento = denunciaRepository.findById(Denuncia.getId()).orElse(null);
            if(elemento!=null){
                denunciaRepository.delete(elemento);
                return true;
            }

        }catch(Exception e){
            return false;
        }
        return false;
    }/*
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
    }*/
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
