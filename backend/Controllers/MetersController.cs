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
        meter.Id = Meters.Count > 0 ? Meters.Max(m => m.Id) + 1 : 1;
        Meters.Add(meter);
        return CreatedAtAction(nameof(GetAll), new { id = meter.Id }, meter);
    }

    // Sayacı güncelleyen API ucu (PUT api/meters/1)
    [HttpPut("{id}")]
    public IActionResult Update(int id, Meter updatedMeter)
    {
        var existingMeter = Meters.FirstOrDefault(m => m.Id == id);
        if (existingMeter == null)
        {
            return NotFound(new { message = "Sayaç bulunamadı!" });
        }

        existingMeter.SerialNumber = updatedMeter.SerialNumber;
        existingMeter.Brand = updatedMeter.Brand;
        existingMeter.InstallationAddress = updatedMeter.InstallationAddress;

        return Ok(existingMeter);
    }

    // Sayacı silen API ucu (DELETE api/meters/1)
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var meter = Meters.FirstOrDefault(m => m.Id == id);
        if (meter == null)
        {
            return NotFound(new { message = "Sayaç bulunamadı!" });
        }

        Meters.Remove(meter);
        return Ok(new { message = "Sayaç başarıyla silindi." });
    }
}