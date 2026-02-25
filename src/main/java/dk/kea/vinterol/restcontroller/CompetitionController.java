package dk.kea.vinterol.restcontroller;

import dk.kea.vinterol.dto.CompetitionResponseDTO;
import dk.kea.vinterol.dto.LeaderboardEntryDTO;
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

    // GET /competitions/{id}/leaderboard
    @GetMapping("/competitions/{id}/leaderboard")
    public ResponseEntity<List<LeaderboardEntryDTO>> leaderboard(@PathVariable Long id) {
        return ResponseEntity.ok(resultService.getLeaderboardForCompetition(id));
    }
}