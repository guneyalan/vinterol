package dk.kea.vinterol.restcontroller;

import dk.kea.vinterol.dto.ResultRequestDTO;
import dk.kea.vinterol.dto.ResultResponseDTO;
import dk.kea.vinterol.service.ResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@CrossOrigin
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    // POST /results
    @PostMapping("/results")
    public ResponseEntity<ResultResponseDTO> register(@RequestBody ResultRequestDTO req) {
        return ResponseEntity.ok(resultService.registerResult(req));
    }

    // GET /runs/{runId}/results
    @GetMapping("/runs/{runId}/results")
    public ResponseEntity<List<ResultResponseDTO>> getRunResults(@PathVariable Long runId) {
        return ResponseEntity.ok(resultService.getResultsForRun(runId));
    }
}