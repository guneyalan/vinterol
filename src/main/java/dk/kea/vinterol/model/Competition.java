package dk.kea.vinterol.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "competitions")
public class Competition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate date;

    // One Competition -> Many Runs (kommer i næste delopgave)
    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Run> runs = new ArrayList<>();

    public Competition() {}

    public Competition(String name, LocalDate date) {
        this.name = name;
        this.date = date;
    }

    public Long getId() { return id; }

    public String getName() { return name; }

    public LocalDate getDate() { return date; }

    public List<Run> getRuns() { return runs; }

    public void setName(String name) { this.name = name; }

    public void setDate(LocalDate date) { this.date = date; }
}