package dk.kea.vinterol.model;

import jakarta.persistence.*;

@Entity
@Table(name = "skiers")
public class Skier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(optional = false)
    @JoinColumn(name = "nation_id", nullable = false)
    private Nation nation;

    public Skier() {}

    public Skier(String name, Nation nation) {
        this.name = name;
        this.nation = nation;
    }

    public Long getId() { return id; }

    public String getName() { return name; }

    public Nation getNation() { return nation; }

    public void setName(String name) { this.name = name; }

    public void setNation(Nation nation) { this.nation = nation; }
}