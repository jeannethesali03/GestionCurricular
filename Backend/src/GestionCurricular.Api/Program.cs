using GestionCurricular.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

//Agregando CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "No se configuró la conexión a MySQL.");

builder.Services.AddDbContext<GestionCurricularDbContext>(
    options => options.UseMySQL(connectionString));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("FrontendDev");

app.UseAuthorization();

app.MapControllers();

app.MapGet("/health/database", async (
    GestionCurricularDbContext db) =>
{
    try
    {
        var conectado = await db.Database.CanConnectAsync();

        if (!conectado)
        {
            return Results.Problem(
                title: "No se pudo conectar con MySQL.",
                statusCode: 503);
        }

        return Results.Ok(new
        {
            estado = "conectado",
            baseDatos = "Gestion_curricular"
        });
    }
    catch (Exception)
    {
        return Results.Problem(
            title: "Error al conectar con la base de datos.",
            statusCode: 503);
    }
});

app.Run();
