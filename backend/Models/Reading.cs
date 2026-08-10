using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Reading
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Sayaç ID zorunludur.")]
    [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir Sayaç ID giriniz.")]
    public int MeterId { get; set; }

    [Range(0, 1000000, ErrorMessage = "Tüketim değeri negatif olamaz.")]
    public double ConsumptionValue { get; set; }

    public DateTime ReadingDate { get; set; } = DateTime.Now;
}