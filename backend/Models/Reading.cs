namespace backend.Models;

public class Reading
{
    public int Id { get; set; }
    public int MeterId { get; set; }
    public double ConsumptionValue { get; set; }
    public DateTime ReadingDate { get; set; } = DateTime.Now;
}