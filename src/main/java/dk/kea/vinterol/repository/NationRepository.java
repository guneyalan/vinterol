package dk.kea.vinterol.repository;

import dk.kea.vinterol.model.Nation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NationRepository extends JpaRepository<Nation, Long> {
}