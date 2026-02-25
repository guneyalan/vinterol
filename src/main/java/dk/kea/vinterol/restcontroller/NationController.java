package dk.kea.vinterol.restcontroller;

import dk.kea.vinterol.dto.NationRequestDTO;
import dk.kea.vinterol.dto.NationResponseDTO;
import dk.kea.vinterol.dto.SkierResponseDTO;
import dk.kea.vinterol.service.NationService;
import dk.kea.vinterol.service.SkierService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@CrossOrigin
public class NationController {

    private final SkierService skierService;
    private final NationService nationService;

    public NationController(SkierService skierService, NationService nationService) {
        this.skierService = skierService;
        this.nationService = nationService;
    }

    // GET /nations
    @GetMapping("/nations")
    public ResponseEntity<List<NationResponseDTO>> getAllNations() {
        return ResponseEntity.ok(nationService.getAllNations());
    }

    // POST /nations
    @PostMapping("/nations")
    public ResponseEntity<NationResponseDTO> createNation(@RequestBody NationRequestDTO req) {
        return ResponseEntity.ok(nationService.createNation(req));
    }

    // GET /nations/{nationId}/skiers
    @GetMapping("/nations/{nationId}/skiers")
    public ResponseEntity<List<SkierResponseDTO>> getSkiersByNation(@PathVariable Long nationId) {
        return ResponseEntity.ok(skierService.getSkiersByNation(nationId));
    }
}