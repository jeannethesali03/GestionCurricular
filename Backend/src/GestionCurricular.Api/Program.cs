using GestionCurricular.Domain.Entities;
using GestionCurricular.Infrastructure.Persistence;
using GestionCurricular.Api.Middleware;
using GestionCurricular.Api.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
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
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "GestionCurricular.Session";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        options.ExpireTimeSpan = TimeSpan.FromHours(8);
        options.SlidingExpiration = true;
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddScoped<IPasswordHasher<Usuario>, PasswordHasher<Usuario>>();
builder.Services.AddScoped<IUsuariosService, UsuariosService>();
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<IDesactivacionesUniversidadService, DesactivacionesUniversidadService>();
builder.Services.AddExceptionHandler<UsuarioServiceExceptionHandler>();
builder.Services.AddProblemDetails();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "No se configuró la conexión a MySQL.");

builder.Services.AddDbContext<GestionCurricularDbContext>(
    options => options.UseMySQL(connectionString));

var app = builder.Build();

await InicializadorRoles.InicializarAsync(app.Services);

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("FrontendDev");

app.UseAuthentication();
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
