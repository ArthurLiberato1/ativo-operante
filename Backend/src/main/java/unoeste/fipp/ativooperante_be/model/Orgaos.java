package unoeste.fipp.ativooperante_be.model;

import jakarta.persistence.*;

@Entity
@Table(name="orgaos")
public class Orgaos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "org_id")
    private Long org_id;

    @Column(name="org_nome")
    private String org_nome;


    public Orgaos(){
        this(0L, "");
    }
    public Orgaos(Long org_id, String org_nome) {
        this.org_id = org_id;
        this.org_nome = org_nome;
    }

    public Long getOrg_id() {
        return org_id;
    }

    public void setOrg_id(Long org_id) {
        this.org_id = org_id;
    }

    public String getOrg_nome() {
        return org_nome;
    }

    public void setOrg_nome(String org_nome) {
        this.org_nome = org_nome;
    }
}
