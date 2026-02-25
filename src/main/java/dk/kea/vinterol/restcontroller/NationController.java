package dk.kea.vinterol.restcontroller;

import dk.kea.vinterol.dto.SkierResponseDTO;
import dk.kea.vinterol.service.SkierService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@CrossOrigin
public class NationController {

    private final SkierService skierService;

    public NationController(SkierService skierService) {
        this.skierService = skierService;
    }

    // GET /nations/{nationId}/skiers
    @GetMapping("/nations/{nationId}/skiers")
    public ResponseEntity<List<SkierResponseDTO>> getSkiersByNation(@PathVariable Long nationId) {
        return ResponseEntity.ok(skierService.getSkiersByNation(nationId));
    }
}