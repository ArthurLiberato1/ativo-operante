package unoeste.fipp.ativooperante_be.controller.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import unoeste.fipp.ativooperante_be.model.Usuario;
import unoeste.fipp.ativooperante_be.model.repositories.UsuarioRepository;
import unoeste.fipp.ativooperante_be.security.filters.JWTTokenProvider;

import java.util.List;

@Service
public class UsuarioService {
    @Autowired
    UsuarioRepository usuRepo;

    public List<Usuario> getAllUsuarios(){return usuRepo.findAll();}

    public Usuario getUsuarioId(Long id){
        return usuRepo.findById(id).orElse(null);
    }
    public Usuario getUsuarioByEmail(String email){
        return usuRepo.findAllByEmail(email);
    }
    /*public Usuario salvarUsuario(Usuario elemento){
        return usuRepo.save(elemento);
    }*/

    public String autenticar(String Email, Long senha){
        String token=null;
        Usuario usuario = usuRepo.findAllByEmail(Email);
        if(usuario!=null && usuario.getSenha()==senha){
            token= JWTTokenProvider.getToken(Email,""+usuario.getNivel());
            System.out.println("TOKEN DE ACESSO: "+token);
        }
        return token;
    }

    public Usuario salvarUsuario(Usuario usuario){
        return usuRepo.save(usuario);

    }




    public boolean deletarUsuario(Usuario elemento){

        try{
            Usuario usuario = usuRepo.findById(elemento.getId()).orElse(null);
            if(usuario!=null){

                usuRepo.delete(usuario);
                return true;
            }
        }catch(Exception e){
            return false;
        }
        return false;
    }

    public Usuario atualizarUsuario(Usuario novo){
        Usuario usu = null;
        try{
            usu = usuRepo.findById(novo.getId()).orElse(null);
            if(usu!=null){
                usu.setCpf(novo.getCpf());
                usu.setEmail(novo.getEmail());
                usu.setNivel(novo.getNivel());
                usu.setSenha(novo.getSenha());
            }

        }catch(Exception e){
            return usu;
        }
        return usu;
    }


}
