using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using backend.Models;
using Xunit;

namespace backend.Tests;

public class UnitTest1
{
    private IList<ValidationResult> ValidateModel(object model)
    {
        var validationResults = new List<ValidationResult>();
        var ctx = new ValidationContext(model, null, null);
        Validator.TryValidateObject(model, ctx, validationResults, true);
        return validationResults;
    }

    [Fact]
    public void ValidMeter_ShouldPassValidation()
    {
        var meter = new Meter
        {
            SerialNumber = "12345",
            Brand = "Baylan",
            InstallationAddress = "Test Mahalle No:1"
        };

        var results = ValidateModel(meter);

        Assert.Empty(results);
    }

    [Fact]
    public void InvalidMeter_EmptySerialNumber_ShouldFailValidation()
    {
        var meter = new Meter
        {
            SerialNumber = "",
            Brand = "Baylan",
            InstallationAddress = "Test Mahalle No:1"
        };

        var results = ValidateModel(meter);

        Assert.NotEmpty(results);
    }

    [Fact]
    public void InvalidReading_NegativeConsumption_ShouldFailValidation()
    {
        var reading = new Reading
        {
            MeterId = 1,
            ConsumptionValue = -10
        };

        var results = ValidateModel(reading);

        Assert.NotEmpty(results);
    }
}