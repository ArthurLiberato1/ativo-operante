package unoeste.fipp.ativooperante_be.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name="usuario")
public class Usuario{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usu_id")
    private Long id;

    @Column(name="usu_cpf")
    private Long cpf;

    @Column(name="usu_senha")
    private Long senha;

    @Column(name = "usu_email")
    private String email;

    @Column(name="usu_nivel")
    private Long nivel;

    public Usuario(Long id, Long cpf) {
        this.id = id;
        this.cpf = cpf;
    }
    public Usuario(){ }
    public Usuario(Long id, Long cpf, Long senha, String email, Long nivel) {
        this.id = id;
        this.cpf = cpf;
        this.senha = senha;
        this.email = email;
        this.nivel = nivel;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCpf() {
        return cpf;
    }

    public void setCpf(Long cpf) {
        this.cpf = cpf;
    }

    public Long getSenha() {
        return senha;
    }

    public void setSenha(Long senha) {
        this.senha = senha;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getNivel() {
        return this.nivel;
    }

    public void setNivel(Long nivel) {
        this.nivel = nivel;
    }

}
