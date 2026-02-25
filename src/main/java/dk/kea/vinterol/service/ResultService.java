package dk.kea.vinterol.service;

import dk.kea.vinterol.dto.LeaderboardEntryDTO;
import dk.kea.vinterol.dto.ResultRequestDTO;
import dk.kea.vinterol.dto.ResultResponseDTO;
import dk.kea.vinterol.model.Result;
import dk.kea.vinterol.model.Run;
import dk.kea.vinterol.model.Skier;
import dk.kea.vinterol.repository.CompetitionRepository;
import dk.kea.vinterol.repository.ResultRepository;
import dk.kea.vinterol.repository.RunRepository;
import dk.kea.vinterol.repository.SkierRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ResultService {

    private final ResultRepository resultRepository;
    private final RunRepository runRepository;
    private final SkierRepository skierRepository;
    private final CompetitionRepository competitionRepository;

    public ResultService(ResultRepository resultRepository,
                         RunRepository runRepository,
                         SkierRepository skierRepository,
                         CompetitionRepository competitionRepository) {
        this.resultRepository = resultRepository;
        this.runRepository = runRepository;
        this.skierRepository = skierRepository;
        this.competitionRepository = competitionRepository;
    }

    public ResultResponseDTO registerResult(ResultRequestDTO req) {
        if (req == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (req.runId == null) {
            throw new IllegalArgumentException("runId is required");
        }
        if (req.skierId == null) {
            throw new IllegalArgumentException("skierId is required");
        }
        if (req.timeSeconds <= 0) {
            throw new IllegalArgumentException("timeSeconds must be > 0");
        }

        Run run = runRepository.findById(req.runId)
                .orElseThrow(() -> new IllegalArgumentException("Run not found: " + req.runId));

        Skier skier = skierRepository.findById(req.skierId)
                .orElseThrow(() -> new IllegalArgumentException("Skier not found: " + req.skierId));

        Result saved = resultRepository.save(new Result(run, skier, req.timeSeconds));
        return toDTO(saved);
    }

    public List<ResultResponseDTO> getResultsForRun(Long runId) {
        if (runId == null) {
            throw new IllegalArgumentException("runId is required");
        }
        return resultRepository.findByRunIdOrderByTimeSecondsAsc(runId).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<LeaderboardEntryDTO> getLeaderboardForCompetition(Long competitionId) {
        if (competitionId == null) {
            throw new IllegalArgumentException("competitionId is required");
        }

        // Bare så vi giver en pæn fejl hvis competition ikke findes
        competitionRepository.findById(competitionId)
                .orElseThrow(() -> new IllegalArgumentException("Competition not found: " + competitionId));

        List<Result> results = resultRepository.findByRunCompetitionId(competitionId);

        // total tid per skier
        Map<Long, Double> totalBySkierId = new HashMap<>();
        Map<Long, Result> sampleBySkierId = new HashMap<>();

        for (Result r : results) {
            Long skierId = r.getSkier().getId();
            totalBySkierId.merge(skierId, r.getTimeSeconds(), Double::sum);
            sampleBySkierId.putIfAbsent(skierId, r);
        }

        // sortér efter total tid
        List<Map.Entry<Long, Double>> sorted = totalBySkierId.entrySet().stream()
                .sorted(Map.Entry.comparingByValue())
                .toList();

        List<LeaderboardEntryDTO> leaderboard = new ArrayList<>();
        int pos = 1;

        for (Map.Entry<Long, Double> e : sorted) {
            Result ref = sampleBySkierId.get(e.getKey());
            leaderboard.add(new LeaderboardEntryDTO(
                    pos++,
                    ref.getSkier().getId(),
                    ref.getSkier().getName(),
                    ref.getSkier().getNation().getName(),
                    e.getValue()
            ));
        }

        return leaderboard;
    }

    private ResultResponseDTO toDTO(Result r) {
        return new ResultResponseDTO(
                r.getId(),
                r.getRun().getId(),
                r.getRun().getRunNumber(),
                r.getSkier().getId(),
                r.getSkier().getName(),
                r.getSkier().getNation().getName(),
                r.getTimeSeconds()
        );
    }
}