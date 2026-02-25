package dk.kea.vinterol.service;

import dk.kea.vinterol.dto.SkierRequestDTO;
import dk.kea.vinterol.dto.SkierResponseDTO;
import dk.kea.vinterol.model.Nation;
import dk.kea.vinterol.model.Skier;
import dk.kea.vinterol.repository.NationRepository;
import dk.kea.vinterol.repository.SkierRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SkierService {

    private final SkierRepository skierRepository;
    private final NationRepository nationRepository;

    public SkierService(SkierRepository skierRepository, NationRepository nationRepository) {
        this.skierRepository = skierRepository;
        this.nationRepository = nationRepository;
    }

    public SkierResponseDTO createSkier(SkierRequestDTO req) {
        if (req == null || req.name == null || req.name.isBlank()) {
            throw new IllegalArgumentException("Skier name is required");
        }
        if (req.nationId == null) {
            throw new IllegalArgumentException("nationId is required");
        }

        Nation nation = nationRepository.findById(req.nationId)
                .orElseThrow(() -> new IllegalArgumentException("Nation not found: " + req.nationId));

        Skier skier = new Skier(req.name.trim(), nation);
        Skier saved = skierRepository.save(skier);
        return toDTO(saved);
    }

    public SkierResponseDTO updateSkier(Long id, SkierRequestDTO req) {
        if (id == null) {
            throw new IllegalArgumentException("id is required");
        }
        if (req == null || req.name == null || req.name.isBlank()) {
            throw new IllegalArgumentException("Skier name is required");
        }
        if (req.nationId == null) {
            throw new IllegalArgumentException("nationId is required");
        }

        Skier skier = skierRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Skier not found: " + id));

        Nation nation = nationRepository.findById(req.nationId)
                .orElseThrow(() -> new IllegalArgumentException("Nation not found: " + req.nationId));

        skier.setName(req.name.trim());
        skier.setNation(nation);

        Skier saved = skierRepository.save(skier);
        return toDTO(saved);
    }

    public void deleteSkier(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("id is required");
        }
        if (!skierRepository.existsById(id)) {
            throw new IllegalArgumentException("Skier not found: " + id);
        }
        skierRepository.deleteById(id);
    }

    public List<SkierResponseDTO> getSkiersByNation(Long nationId) {
        if (nationId == null) {
            throw new IllegalArgumentException("nationId is required");
        }

        // ✅ NYT: hvis nation ikke findes -> fejl (så frontend kan vise error)
        if (!nationRepository.existsById(nationId)) {
            throw new IllegalArgumentException("Nation not found: " + nationId);
        }

        return skierRepository.findByNationId(nationId).stream()
                .map(this::toDTO)
                .toList();
    }

    private SkierResponseDTO toDTO(Skier s) {
        return new SkierResponseDTO(
                s.getId(),
                s.getName(),
                s.getNation().getId(),
                s.getNation().getName()
        );
    }
}