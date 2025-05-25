package unoeste.fipp.ativooperante_be.model.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import unoeste.fipp.ativooperante_be.model.Denuncia;
import unoeste.fipp.ativooperante_be.model.FeedBack;

public interface FeedBackRepository extends JpaRepository<FeedBack, Long> {
    public FeedBack getFeedBacksByDenuncia(Denuncia denuncia);
}
