package dk.kea.vinterol.repository;

import dk.kea.vinterol.model.Result;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResultRepository extends JpaRepository<Result, Long> {
    List<Result> findByRunIdOrderByTimeSecondsAsc(Long runId);
    List<Result> findByRunCompetitionId(Long competitionId);
}