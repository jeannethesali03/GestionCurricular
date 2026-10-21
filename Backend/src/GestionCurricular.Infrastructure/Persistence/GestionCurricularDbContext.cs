
using Microsoft.EntityFrameworkCore;

namespace GestionCurricular.Infrastructure.Persistence;

public class GestionCurricularDbContext : DbContext
{
    public GestionCurricularDbContext(
        DbContextOptions<GestionCurricularDbContext> options)
        : base(options)
    {
    }
}
