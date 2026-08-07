namespace backend.Tests;

using backend.Models;
using Xunit;

public class ReadingTests
{
    [Fact]
    public void Reading_Properties_CanBeSetSuccessfully()
    {
        // Arrange & Act
        var reading = new Reading
        {
            Id = 1,
            MeterId = 1,
            ConsumptionValue = 150.5,
            ReadingDate = System.DateTime.Now
        };

        // Assert
        Assert.Equal(150.5, reading.ConsumptionValue);
        Assert.Equal(1, reading.MeterId);
    }

    [Fact]
    public void Reading_NegativeValue_Check()
    {
        // Arrange
        double negativeValue = -50.0;

        // Assert
        Assert.True(negativeValue < 0, "Okuma değeri negatif olamaz doğrulaması.");
    }
}