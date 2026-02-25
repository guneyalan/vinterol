package dk.kea.vinterol.service;

import dk.kea.vinterol.dto.CompetitionRequestDTO;
import dk.kea.vinterol.dto.CompetitionResponseDTO;
import dk.kea.vinterol.dto.RunRequestDTO;
import dk.kea.vinterol.dto.RunResponseDTO;
import dk.kea.vinterol.model.Competition;
import dk.kea.vinterol.model.Run;
import dk.kea.vinterol.repository.CompetitionRepository;
import dk.kea.vinterol.repository.RunRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CompetitionService {

    private final CompetitionRepository competitionRepository;
    private final RunRepository runRepository;

    public CompetitionService(CompetitionRepository competitionRepository, RunRepository runRepository) {
        this.competitionRepository = competitionRepository;
        this.runRepository = runRepository;
    }

    public List<CompetitionResponseDTO> getAllCompetitions() {
        return competitionRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public CompetitionResponseDTO createCompetition(CompetitionRequestDTO req) {
        if (req == null || req.name == null || req.name.isBlank()) {
            throw new IllegalArgumentException("Competition name is required");
        }
        LocalDate date = (req.date != null) ? req.date : LocalDate.now();
        Competition saved = competitionRepository.save(new Competition(req.name.trim(), date));
        return toDTO(saved);
    }

    public RunResponseDTO createRun(Long competitionId, RunRequestDTO req) {
        if (competitionId == null) {
            throw new IllegalArgumentException("competitionId is required");
        }
        if (req == null || req.runNumber <= 0) {
            throw new IllegalArgumentException("runNumber must be > 0");
        }

        Competition comp = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new IllegalArgumentException("Competition not found: " + competitionId));

        Run saved = runRepository.save(new Run(req.runNumber, comp));
        return new RunResponseDTO(saved.getId(), saved.getRunNumber(), comp.getId());
    }

    public List<RunResponseDTO> getRunsForCompetition(Long competitionId) {
        if (competitionId == null) {
            throw new IllegalArgumentException("competitionId is required");
        }
        competitionRepository.findById(competitionId)
                .orElseThrow(() -> new IllegalArgumentException("Competition not found: " + competitionId));

        return runRepository.findByCompetitionId(competitionId).stream()
                .map(r -> new RunResponseDTO(r.getId(), r.getRunNumber(), r.getCompetition().getId()))
                .toList();
    }

    private CompetitionResponseDTO toDTO(Competition c) {
        return new CompetitionResponseDTO(c.getId(), c.getName(), c.getDate());
    }
}