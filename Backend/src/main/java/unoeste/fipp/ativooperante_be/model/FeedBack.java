package unoeste.fipp.ativooperante_be.model;

import jakarta.persistence.*;

@Entity
@Table(name="feedback")
public class FeedBack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="fee_id")
    private Long fee_id;

    @Column(name="fee_texto")
    private String fee_texto;

    @OneToOne
    @JoinColumn(name="den_id", nullable = false, unique = true)
    private Denuncia denuncia;


    public FeedBack(Long id, String texto){
        this.fee_id=id;
        this.fee_texto=texto;

    }
    public FeedBack(Long fee_id, String fee_texto, Denuncia den_id) {
        this.fee_id = fee_id;
        this.fee_texto = fee_texto;
        this.denuncia = den_id;
    }
    public FeedBack(){}

    public Long getFee_id() {
        return fee_id;
    }

    public void setFee_id(Long fee_id) {
        this.fee_id = fee_id;
    }

    public String getFee_texto() {
        return fee_texto;
    }

    public void setFee_texto(String fee_texto) {
        this.fee_texto = fee_texto;
    }

    public Denuncia getDen_id() {
        return denuncia;
    }

    public void setDen_id(Denuncia den_id) {
        this.denuncia = den_id;
    }
}
