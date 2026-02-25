package dk.kea.vinterol.service;

import dk.kea.vinterol.dto.NationRequestDTO;
import dk.kea.vinterol.dto.NationResponseDTO;
import dk.kea.vinterol.model.Nation;
import dk.kea.vinterol.repository.NationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NationService {

    private final NationRepository nationRepository;

    public NationService(NationRepository nationRepository) {
        this.nationRepository = nationRepository;
    }

    public NationResponseDTO createNation(NationRequestDTO req) {
        if (req == null || req.name == null || req.name.isBlank()) {
            throw new IllegalArgumentException("Nation name is required");
        }
        Nation saved = nationRepository.save(new Nation(req.name.trim()));
        return new NationResponseDTO(saved.getId(), saved.getName());
    }

    public List<NationResponseDTO> getAllNations() {
        return nationRepository.findAll().stream()
                .map(n -> new NationResponseDTO(n.getId(), n.getName()))
                .toList();
    }
}