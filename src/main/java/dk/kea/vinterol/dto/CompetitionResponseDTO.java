package dk.kea.vinterol.dto;

import java.time.LocalDate;

public class CompetitionResponseDTO {

    public Long id;
    public String name;
    public LocalDate date;

    public CompetitionResponseDTO() {}

    public CompetitionResponseDTO(Long id, String name, LocalDate date) {
        this.id = id;
        this.name = name;
        this.date = date;
    }
}