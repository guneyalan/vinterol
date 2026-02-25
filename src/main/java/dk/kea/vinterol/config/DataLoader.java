package dk.kea.vinterol.config;

import dk.kea.vinterol.model.*;
import dk.kea.vinterol.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Component
public class DataLoader implements CommandLineRunner {

    private final NationRepository nationRepository;
    private final SkierRepository skierRepository;
    private final CompetitionRepository competitionRepository;
    private final RunRepository runRepository;
    private final ResultRepository resultRepository;

    public DataLoader(NationRepository nationRepository,
                      SkierRepository skierRepository,
                      CompetitionRepository competitionRepository,
                      RunRepository runRepository,
                      ResultRepository resultRepository) {
        this.nationRepository = nationRepository;
        this.skierRepository = skierRepository;
        this.competitionRepository = competitionRepository;
        this.runRepository = runRepository;
        this.resultRepository = resultRepository;
    }

    @Override
    public void run(String... args) {

        // 10 nationer
        List<Nation> nations = List.of(
                new Nation("Denmark"),
                new Nation("Norway"),
                new Nation("Sweden"),
                new Nation("Finland"),
                new Nation("Germany"),
                new Nation("Austria"),
                new Nation("Switzerland"),
                new Nation("France"),
                new Nation("Italy"),
                new Nation("USA")
        );
        nationRepository.saveAll(nations);

        // flere løbere
        List<Skier> skiers = List.of(
                new Skier("Mads Jensen", nations.get(0)),
                new Skier("Ida Larsen", nations.get(0)),
                new Skier("Ola Nordmann", nations.get(1)),
                new Skier("Kari Hansen", nations.get(1)),
                new Skier("Erik Svensson", nations.get(2)),
                new Skier("Anna Karlsson", nations.get(2)),
                new Skier("Mikko Virtanen", nations.get(3)),
                new Skier("Lea Müller", nations.get(4)),
                new Skier("Hans Gruber", nations.get(5)),
                new Skier("Marco Rossi", nations.get(8)),
                new Skier("John Miller", nations.get(9))
        );
        skierRepository.saveAll(skiers);

        // 1 konkurrence
        Competition comp = new Competition("Downhill Final", LocalDate.now());
        competitionRepository.save(comp);

        // 2 runs i konkurrencen
        Run run1 = new Run(1, comp);
        Run run2 = new Run(2, comp);
        runRepository.saveAll(List.of(run1, run2));

        // results til begge runs
        Random rnd = new Random(42);
        for (Skier s : skiers) {
            double t1 = round2(80 + rnd.nextDouble() * 20); // 80-100 sek
            double t2 = round2(80 + rnd.nextDouble() * 20);

            resultRepository.save(new Result(run1, s, t1));
            resultRepository.save(new Result(run2, s, t2));
        }
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}