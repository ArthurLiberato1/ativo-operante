package unoeste.fipp.ativooperante_be.model;

import jakarta.persistence.*;

@Entity
@Table(name="feedback")
public class FeedBack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="fee_id")
    private Long id;

    @Column(name="fee_texto")
    private String texto;

    @OneToOne
    @JoinColumn(name="den_id", nullable = false, unique = true)
    private Denuncia denuncia;


    public FeedBack(Long id, String texto){
        this.id=id;
        this.texto=texto;

    }
    public FeedBack(Long id, String texto, Denuncia den_id) {
        this.id = id;
        this.texto = texto;
        this.denuncia = den_id;
    }
    public FeedBack(){}

    public Long getId() {
        return id;
    }

    public void setId(Long fee_id) {
        this.id = fee_id;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public Denuncia getDen_id() {
        return denuncia;
    }

    public void setDen_id(Denuncia id) {
        this.denuncia = id;
    }
}
