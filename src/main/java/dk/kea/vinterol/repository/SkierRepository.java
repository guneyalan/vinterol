package dk.kea.vinterol.repository;

import dk.kea.vinterol.model.Skier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SkierRepository extends JpaRepository<Skier, Long> {
    List<Skier> findByNationId(Long nationId);
}