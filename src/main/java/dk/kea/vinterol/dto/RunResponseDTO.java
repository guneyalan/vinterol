package dk.kea.vinterol.dto;

public class RunResponseDTO {
    public Long id;
    public int runNumber;
    public Long competitionId;

    public RunResponseDTO() {}

    public RunResponseDTO(Long id, int runNumber, Long competitionId) {
        this.id = id;
        this.runNumber = runNumber;
        this.competitionId = competitionId;
    }
}