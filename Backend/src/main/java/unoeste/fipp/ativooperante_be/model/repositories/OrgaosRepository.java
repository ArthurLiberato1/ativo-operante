package unoeste.fipp.ativooperante_be.model.repositories;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import unoeste.fipp.ativooperante_be.model.Orgaos;

public interface OrgaosRepository extends JpaRepository<Orgaos, Long> {

    @Modifying
    @Transactional
    @Query(value="INSERT INTO orgaos (org_id, org_nome) VALUES (:org_id, :ord_nome)",nativeQuery = true)
    public void addOrgao(@Param("org_id") Long id, @Param("org_nome") String nome);

}
