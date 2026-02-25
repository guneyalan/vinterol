package dk.kea.vinterol.dto;

public class ResultResponseDTO {
    public Long id;
    public Long runId;
    public int runNumber;
    public Long skierId;
    public String skierName;
    public String nationName;
    public double timeSeconds;

    public ResultResponseDTO() {}

    public ResultResponseDTO(
            Long id,
            Long runId,
            int runNumber,
            Long skierId,
            String skierName,
            String nationName,
            double timeSeconds
    ) {
        this.id = id;
        this.runId = runId;
        this.runNumber = runNumber;
        this.skierId = skierId;
        this.skierName = skierName;
        this.nationName = nationName;
        this.timeSeconds = timeSeconds;
    }
}