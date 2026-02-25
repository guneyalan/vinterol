package dk.kea.vinterol.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "runs")
public class Run {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int runNumber;

    @ManyToOne(optional = false)
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    // One Run -> Many Results (kommer i delopgave 11)
    @OneToMany(mappedBy = "run", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Result> results = new ArrayList<>();

    public Run() {}

    public Run(int runNumber, Competition competition) {
        this.runNumber = runNumber;
        this.competition = competition;
    }

    public Long getId() { return id; }

    public int getRunNumber() { return runNumber; }

    public Competition getCompetition() { return competition; }

    public List<Result> getResults() { return results; }

    public void setRunNumber(int runNumber) { this.runNumber = runNumber; }

    public void setCompetition(Competition competition) { this.competition = competition; }
}