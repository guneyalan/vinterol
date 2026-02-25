package dk.kea.vinterol.restcontroller;

import dk.kea.vinterol.dto.SkierRequestDTO;
import dk.kea.vinterol.dto.SkierResponseDTO;
import dk.kea.vinterol.service.SkierService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@CrossOrigin
public class SkierController {

    private final SkierService skierService;

    public SkierController(SkierService skierService) {
        this.skierService = skierService;
    }

    // POST /skiers
    @PostMapping("/skiers")
    public ResponseEntity<SkierResponseDTO> create(@RequestBody SkierRequestDTO req) {
        return ResponseEntity.ok(skierService.createSkier(req));
    }

    // PUT /skiers/{id}
    @PutMapping("/skiers/{id}")
    public ResponseEntity<SkierResponseDTO> update(@PathVariable Long id, @RequestBody SkierRequestDTO req) {
        return ResponseEntity.ok(skierService.updateSkier(id, req));
    }

    // DELETE /skiers/{id}
    @DeleteMapping("/skiers/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        skierService.deleteSkier(id);
        return ResponseEntity.noContent().build();
    }
}