using Microsoft.AspNetCore.Mvc;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetersController : ControllerBase
{
    // Geçici (In-Memory) Sayaç Listesi
    private static readonly List<Meter> Meters = new()
    {
        new Meter { Id = 1, SerialNumber = "MTR-1001", Brand = "Baylan", InstallationAddress = "Kadıköy / İstanbul" },
        new Meter { Id = 2, SerialNumber = "MTR-1002", Brand = "Luna", InstallationAddress = "Çankaya / Ankara" }
    };

    // Tüm sayaçları getiren API ucu (GET api/meters)
    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(Meters);
    }

    // Yeni sayaç ekleyen API ucu (POST api/meters)
    [HttpPost]
    public IActionResult Create(Meter meter)
    {
        meter.Id = Meters.Count + 1;
        Meters.Add(meter);
        return CreatedAtAction(nameof(GetAll), new { id = meter.Id }, meter);
    }
}