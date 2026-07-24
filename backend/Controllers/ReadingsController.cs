using Microsoft.AspNetCore.Mvc;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReadingsController : ControllerBase
{
    // Geçici (In-Memory) Okuma Listesi
    private static readonly List<Reading> Readings = new()
    {
        new Reading { Id = 1, MeterId = 1, ConsumptionValue = 120.5 },
        new Reading { Id = 2, MeterId = 1, ConsumptionValue = 145.0 }
    };

    // Tüm okumaları getiren API ucu (GET api/readings)
    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(Readings);
    }

    // Yeni okuma verisi ekleyen API ucu (POST api/readings)
    [HttpPost]
    public IActionResult Create(Reading reading)
    {
        reading.Id = Readings.Count + 1;
        Readings.Add(reading);
        return CreatedAtAction(nameof(GetAll), new { id = reading.Id }, reading);
    }
}