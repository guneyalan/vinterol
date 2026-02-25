package dk.kea.vinterol.repository;

import dk.kea.vinterol.model.Run;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RunRepository extends JpaRepository<Run, Long> {
    List<Run> findByCompetitionId(Long competitionId);
}