var builder = WebApplication.CreateBuilder(args);

// Controller ve Swagger servislerini ekliyoruz
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Frontend (React) erişim izni (CORS)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",          // Local React adresin
            "https://onurrmtl-07.github.io"   // Canlıdaki GitHub Pages adresin
        )
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});

var app = builder.Build();

// Swagger konfigürasyonu (Ana dizinde otomatik açılması için)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Staj Projesi API v1");
    c.RoutePrefix = string.Empty; // Ana adresi (/) doğrudan Swagger ekranı yapar
});

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();