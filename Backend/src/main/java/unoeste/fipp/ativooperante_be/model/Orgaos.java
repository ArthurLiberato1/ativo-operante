package unoeste.fipp.ativooperante_be.model;

import jakarta.persistence.*;

@Entity
@Table(name="orgaos")
public class Orgaos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "org_id")
    private Long id;

    @Column(name="org_nome")
    private String nome;


    public Orgaos(){
        this(0L, "");
    }
    public Orgaos(Long org_id, String org_nome) {
        this.id = org_id;
        this.nome = org_nome;
    }

    public Long getOrg_id() {
        return id;
    }

    public void setOrg_id(Long id) {
        this.id = id;
    }

    public String getOrg_nome() {
        return nome;
    }

    public void setOrg_nome(String nome) {
        this.nome = nome;
    }
}
