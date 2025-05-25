package unoeste.fipp.ativooperante_be.model.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import unoeste.fipp.ativooperante_be.model.Tipo;

@Repository
public interface TipoRepository extends JpaRepository<Tipo,Long> {
}
