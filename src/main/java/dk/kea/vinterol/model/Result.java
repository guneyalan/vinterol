package dk.kea.vinterol.model;

import jakarta.persistence.*;

@Entity
@Table(name = "results",
        uniqueConstraints = @UniqueConstraint(columnNames = {"run_id", "skier_id"}))
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "run_id", nullable = false)
    private Run run;

    @ManyToOne(optional = false)
    @JoinColumn(name = "skier_id", nullable = false)
    private Skier skier;

    @Column(nullable = false)
    private double timeSeconds;

    public Result() {}

    public Result(Run run, Skier skier, double timeSeconds) {
        this.run = run;
        this.skier = skier;
        this.timeSeconds = timeSeconds;
    }

    public Long getId() { return id; }

    public Run getRun() { return run; }

    public Skier getSkier() { return skier; }

    public double getTimeSeconds() { return timeSeconds; }

    public void setRun(Run run) { this.run = run; }

    public void setSkier(Skier skier) { this.skier = skier; }

    public void setTimeSeconds(double timeSeconds) { this.timeSeconds = timeSeconds; }
}