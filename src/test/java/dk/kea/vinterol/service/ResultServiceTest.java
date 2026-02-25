package dk.kea.vinterol.service;

import dk.kea.vinterol.dto.LeaderboardEntryDTO;
import dk.kea.vinterol.model.*;
import dk.kea.vinterol.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ResultServiceTest {

    @Autowired ResultService resultService;

    @Autowired NationRepository nationRepository;
    @Autowired SkierRepository skierRepository;
    @Autowired CompetitionRepository competitionRepository;
    @Autowired RunRepository runRepository;
    @Autowired ResultRepository resultRepository;

    @Test
    void leaderboardIsSortedByTotalTime() {
        // Arrange: minimal test-data uafhængigt af DataLoader
        Nation n = nationRepository.save(new Nation("TestNation_" + System.nanoTime()));

        Skier a = skierRepository.save(new Skier("A", n));
        Skier b = skierRepository.save(new Skier("B", n));

        Competition c = competitionRepository.save(new Competition("TestComp", LocalDate.now()));

        Run r1 = runRepository.save(new Run(1, c));
        Run r2 = runRepository.save(new Run(2, c));

        // A total: 20
        resultRepository.save(new Result(r1, a, 10.0));
        resultRepository.save(new Result(r2, a, 10.0));

        // B total: 11 (skal vinde)
        resultRepository.save(new Result(r1, b, 5.0));
        resultRepository.save(new Result(r2, b, 6.0));

        // Act
        List<LeaderboardEntryDTO> lb = resultService.getLeaderboardForCompetition(c.getId());

        // Assert
        assertEquals(2, lb.size(), "Leaderboard should contain 2 entries");
        assertEquals(1, lb.get(0).position, "First entry should have position 1");
        assertEquals("B", lb.get(0).skierName, "B should be first (lowest total time)");
        assertTrue(lb.get(0).totalTimeSeconds < lb.get(1).totalTimeSeconds, "First total time should be lower than second");
    }
}