using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Meter
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Seri numarası zorunludur.")]
    [StringLength(50, ErrorMessage = "Seri numarası en fazla 50 karakter olabilir.")]
    public string SerialNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Marka bilgisi zorunludur.")]
    [StringLength(50, ErrorMessage = "Marka en fazla 50 karakter olabilir.")]
    public string Brand { get; set; } = string.Empty;

    [Required(ErrorMessage = "Kurulum adresi zorunludur.")]
    [StringLength(200, ErrorMessage = "Adres en fazla 200 karakter olabilir.")]
    public string InstallationAddress { get; set; } = string.Empty;

    public DateTime InstallationDate { get; set; } = DateTime.Now;
}