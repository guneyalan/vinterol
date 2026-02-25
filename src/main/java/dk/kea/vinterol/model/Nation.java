package dk.kea.vinterol.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "nations")
public class Nation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    // One Nation -> Many Skiers (kommer i næste delopgave)
    @OneToMany(mappedBy = "nation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Skier> skiers = new ArrayList<>();

    public Nation() {}

    public Nation(String name) {
        this.name = name;
    }

    public Long getId() { return id; }

    public String getName() { return name; }

    public List<Skier> getSkiers() { return skiers; }

    public void setName(String name) { this.name = name; }
}