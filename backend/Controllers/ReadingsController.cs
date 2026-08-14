using Microsoft.AspNetCore.Mvc;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReadingsController : ControllerBase
{
    private static readonly List<Reading> Readings = new()
    {
        new Reading { Id = 1, MeterId = 1, ConsumptionValue = 120.5, ReadingDate = DateTime.UtcNow.AddDays(-1) },
        new Reading { Id = 2, MeterId = 1, ConsumptionValue = 145.0, ReadingDate = DateTime.UtcNow }
    };

    private static readonly object LockObject = new();

    [HttpGet]
    public IActionResult GetAll()
    {
        lock (LockObject)
        {
            return Ok(Readings.ToList());
        }
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        lock (LockObject)
        {
            var reading = Readings.FirstOrDefault(r => r.Id == id);
            if (reading == null)
            {
                return NotFound(new { message = $"{id} ID'li okuma kaydı bulunamadı." });
            }
            return Ok(reading);
        }
    }

    [HttpPost]
    public IActionResult Create([FromBody] Reading reading)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        lock (LockObject)
        {
            reading.Id = Readings.Count > 0 ? Readings.Max(r => r.Id) + 1 : 1;
            reading.ReadingDate = DateTime.UtcNow;
            Readings.Add(reading);
            return CreatedAtAction(nameof(GetById), new { id = reading.Id }, reading);
        }
    }

    // Var olan kaydı güncelleme (PUT api/readings/1)
    [HttpPut("{id}")]
    public IActionResult Update(int id, [FromBody] Reading updatedReading)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        lock (LockObject)
        {
            var existing = Readings.FirstOrDefault(r => r.Id == id);
            if (existing == null)
            {
                return NotFound(new { message = $"{id} ID'li okuma kaydı bulunamadı." });
            }

            existing.MeterId = updatedReading.MeterId;
            existing.ConsumptionValue = updatedReading.ConsumptionValue;

            return Ok(existing);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        lock (LockObject)
        {
            var reading = Readings.FirstOrDefault(r => r.Id == id);
            if (reading == null)
            {
                return NotFound(new { message = $"{id} ID'li okuma kaydı bulunamadı." });
            }

            Readings.Remove(reading);
            return Ok(new { message = "Okuma kaydı başarıyla silindi." });
        }
    }
}