package dk.kea.vinterol.service;

import dk.kea.vinterol.dto.ResultRequestDTO;
import dk.kea.vinterol.dto.ResultResponseDTO;
import dk.kea.vinterol.model.*;
import dk.kea.vinterol.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ResultRegisterTest {

    @Autowired ResultService resultService;

    @Autowired NationRepository nationRepository;
    @Autowired SkierRepository skierRepository;
    @Autowired CompetitionRepository competitionRepository;
    @Autowired RunRepository runRepository;

    @Test
    void registerResultHappyPath() {
        Nation n = nationRepository.save(new Nation("RegNation_" + System.nanoTime()));
        Skier s = skierRepository.save(new Skier("RegSkier", n));

        Competition c = competitionRepository.save(new Competition("RegComp", LocalDate.now()));
        Run r = runRepository.save(new Run(1, c));

        ResultRequestDTO req = new ResultRequestDTO();
        req.runId = r.getId();
        req.skierId = s.getId();
        req.timeSeconds = 91.23;

        ResultResponseDTO res = resultService.registerResult(req);

        assertNotNull(res.id, "Result id should be created");
        assertEquals(r.getId(), res.runId);
        assertEquals(s.getId(), res.skierId);
        assertEquals(91.23, res.timeSeconds);
    }

    @Test
    void registerResultRejectsInvalidTime() {
        Nation n = nationRepository.save(new Nation("BadNation_" + System.nanoTime()));
        Skier s = skierRepository.save(new Skier("BadSkier", n));

        Competition c = competitionRepository.save(new Competition("BadComp", LocalDate.now()));
        Run r = runRepository.save(new Run(1, c));

        ResultRequestDTO req = new ResultRequestDTO();
        req.runId = r.getId();
        req.skierId = s.getId();
        req.timeSeconds = 0;

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> resultService.registerResult(req));
        assertTrue(ex.getMessage().toLowerCase().contains("timeseconds"), "Error message should mention timeSeconds");
    }
}