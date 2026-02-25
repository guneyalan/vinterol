package dk.kea.vinterol.repository;

import dk.kea.vinterol.model.Competition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompetitionRepository extends JpaRepository<Competition, Long> {
}