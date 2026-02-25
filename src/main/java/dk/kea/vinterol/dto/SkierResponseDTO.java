package dk.kea.vinterol.dto;

public class SkierResponseDTO {
    public Long id;
    public String name;
    public Long nationId;
    public String nationName;

    public SkierResponseDTO() {}

    public SkierResponseDTO(Long id, String name, Long nationId, String nationName) {
        this.id = id;
        this.name = name;
        this.nationId = nationId;
        this.nationName = nationName;
    }
}