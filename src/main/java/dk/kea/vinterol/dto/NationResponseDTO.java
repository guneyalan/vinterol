package dk.kea.vinterol.dto;

public class NationResponseDTO {
    public Long id;
    public String name;

    public NationResponseDTO() {}

    public NationResponseDTO(Long id, String name) {
        this.id = id;
        this.name = name;
    }
}