package dk.kea.vinterol.service;

import dk.kea.vinterol.dto.CompetitionResponseDTO;
import dk.kea.vinterol.model.Competition;
import dk.kea.vinterol.repository.CompetitionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompetitionService {

    private final CompetitionRepository competitionRepository;

    public CompetitionService(CompetitionRepository competitionRepository) {
        this.competitionRepository = competitionRepository;
    }

    public List<CompetitionResponseDTO> getAllCompetitions() {
        return competitionRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    private CompetitionResponseDTO toDTO(Competition c) {
        return new CompetitionResponseDTO(c.getId(), c.getName(), c.getDate());
    }
}