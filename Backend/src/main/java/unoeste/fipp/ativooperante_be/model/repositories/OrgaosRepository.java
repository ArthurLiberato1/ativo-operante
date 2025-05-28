package unoeste.fipp.ativooperante_be.model.repositories;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import unoeste.fipp.ativooperante_be.model.Orgaos;

import java.util.List;

public interface OrgaosRepository extends JpaRepository<Orgaos, Long> {

    @Override
    List<Orgaos> findAllById(Iterable<Long> longs);
    Orgaos findByNome(String nome);
}
