namespace backend.Models;

public class Meter
{
    public int Id { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string InstallationAddress { get; set; } = string.Empty;
    public DateTime InstallationDate { get; set; } = DateTime.Now;
}