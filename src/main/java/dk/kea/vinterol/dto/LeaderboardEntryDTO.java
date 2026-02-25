package dk.kea.vinterol.dto;

public class LeaderboardEntryDTO {

    public int position;
    public Long skierId;
    public String skierName;
    public String nationName;
    public double totalTimeSeconds;

    public LeaderboardEntryDTO() {}

    public LeaderboardEntryDTO(
            int position,
            Long skierId,
            String skierName,
            String nationName,
            double totalTimeSeconds
    ) {
        this.position = position;
        this.skierId = skierId;
        this.skierName = skierName;
        this.nationName = nationName;
        this.totalTimeSeconds = totalTimeSeconds;
    }
}