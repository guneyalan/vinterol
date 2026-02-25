package dk.kea.vinterol.restcontroller;

import dk.kea.vinterol.dto.CompetitionRequestDTO;
import dk.kea.vinterol.dto.CompetitionResponseDTO;
import dk.kea.vinterol.dto.LeaderboardEntryDTO;
import dk.kea.vinterol.dto.RunRequestDTO;
import dk.kea.vinterol.dto.RunResponseDTO;
import dk.kea.vinterol.service.CompetitionService;
import dk.kea.vinterol.service.ResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@CrossOrigin
public class CompetitionController {

    private final CompetitionService competitionService;
    private final ResultService resultService;

    public CompetitionController(CompetitionService competitionService, ResultService resultService) {
        this.competitionService = competitionService;
        this.resultService = resultService;
    }

    // GET /competitions
    @GetMapping("/competitions")
    public ResponseEntity<List<CompetitionResponseDTO>> getCompetitions() {
        return ResponseEntity.ok(competitionService.getAllCompetitions());
    }

    // POST /competitions
    @PostMapping("/competitions")
    public ResponseEntity<CompetitionResponseDTO> createCompetition(@RequestBody CompetitionRequestDTO req) {
        return ResponseEntity.ok(competitionService.createCompetition(req));
    }

    // GET /competitions/{id}/runs
    @GetMapping("/competitions/{id}/runs")
    public ResponseEntity<List<RunResponseDTO>> getRuns(@PathVariable Long id) {
        return ResponseEntity.ok(competitionService.getRunsForCompetition(id));
    }

    // POST /competitions/{id}/runs
    @PostMapping("/competitions/{id}/runs")
    public ResponseEntity<RunResponseDTO> createRun(@PathVariable Long id, @RequestBody RunRequestDTO req) {
        return ResponseEntity.ok(competitionService.createRun(id, req));
    }

    // GET /competitions/{id}/leaderboard
    @GetMapping("/competitions/{id}/leaderboard")
    public ResponseEntity<List<LeaderboardEntryDTO>> leaderboard(@PathVariable Long id) {
        return ResponseEntity.ok(resultService.getLeaderboardForCompetition(id));
    }
}