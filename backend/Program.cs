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


    app.UseSwagger();
    app.UseSwaggerUI();


app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();