
using GestionCurricular.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace GestionCurricular.Infrastructure.Persistence;

public class GestionCurricularDbContext : DbContext
{
    public GestionCurricularDbContext(
        DbContextOptions<GestionCurricularDbContext> options)
        : base(options)
    {
    }

    public DbSet<Sede> Sedes => Set<Sede>();
    public DbSet<Facultad> Facultades => Set<Facultad>();
    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<Carrera> Carreras => Set<Carrera>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<TokenAutenticacion> TokensAutenticacion => Set<TokenAutenticacion>();
    public DbSet<RegistroCambio> RegistrosCambios => Set<RegistroCambio>();
    public DbSet<PlanEstudio> PlanesEstudio => Set<PlanEstudio>();
    public DbSet<UsuarioParticipantePlan> UsuariosParticipantesPlan => Set<UsuarioParticipantePlan>();
    public DbSet<ActividadesArea> ActividadesAreas => Set<ActividadesArea>();
    public DbSet<Actividad> Actividades => Set<Actividad>();
    public DbSet<OrientacionMetodologica> OrientacionesMetodologicas => Set<OrientacionMetodologica>();
    public DbSet<RequisitoPermanenciaGraduacion> RequisitosPermanenciaGraduacion => Set<RequisitoPermanenciaGraduacion>();
    public DbSet<EvaluacionAprendizaje> EvaluacionesAprendizaje => Set<EvaluacionAprendizaje>();
    public DbSet<ItemJustificacion> ItemsJustificacion => Set<ItemJustificacion>();
    public DbSet<MaterialDidactico> MaterialesDidacticos => Set<MaterialDidactico>();
    public DbSet<ObjetivoCarrera> ObjetivosCarrera => Set<ObjetivoCarrera>();
    public DbSet<PerfilCurricular> PerfilesCurriculares => Set<PerfilCurricular>();
    public DbSet<PerfilIngreso> PerfilesIngreso => Set<PerfilIngreso>();
    public DbSet<PerfilEgreso> PerfilesEgreso => Set<PerfilEgreso>();
    public DbSet<ReferenciaBibliograficaPlan> ReferenciasBibliograficasPlan => Set<ReferenciaBibliograficaPlan>();
    public DbSet<Asignatura> Asignaturas => Set<Asignatura>();
    public DbSet<AsignaturaCarrera> AsignaturasCarrera => Set<AsignaturaCarrera>();
    public DbSet<UsuarioParticipanteAsignatura> UsuariosParticipantesAsignatura => Set<UsuarioParticipanteAsignatura>();
    public DbSet<UnidadDidactica> UnidadesDidacticas => Set<UnidadDidactica>();
    public DbSet<Contenido> Contenidos => Set<Contenido>();
    public DbSet<ObjetivoAsignatura> ObjetivosAsignatura => Set<ObjetivoAsignatura>();
    public DbSet<TematicaLey> TematicasLey => Set<TematicaLey>();
    public DbSet<ReferenciaBibliograficaAsignatura> ReferenciasBibliograficasAsignatura => Set<ReferenciaBibliograficaAsignatura>();
    public DbSet<FuenteElectronicaAsignatura> FuentesElectronicasAsignatura => Set<FuenteElectronicaAsignatura>();
    public DbSet<PrerrequisitoAsignatura> PrerrequisitosAsignatura => Set<PrerrequisitoAsignatura>();
    public DbSet<PrerrequisitoNoAsignatura> PrerrequisitosNoAsignatura => Set<PrerrequisitoNoAsignatura>();
    public DbSet<PlanAbsorcion> PlanesAbsorcion => Set<PlanAbsorcion>();
    public DbSet<MatrizCambio> MatricesCambios => Set<MatrizCambio>();
    public DbSet<MatrizCongruencia> MatricesCongruencia => Set<MatrizCongruencia>();
    public DbSet<MatrizCongruenciaAsignatura> MatricesCongruenciaAsignatura => Set<MatrizCongruenciaAsignatura>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Rol>()
            .HasIndex(entity => entity.NombreRol)
            .IsUnique();
        modelBuilder.Entity<Usuario>()
            .HasIndex(entity => entity.Correo)
            .IsUnique();
        modelBuilder.Entity<TokenAutenticacion>()
            .HasIndex(entity => entity.Token)
            .IsUnique();
        modelBuilder.Entity<Asignatura>()
            .HasIndex(entity => entity.NumeroOrden)
            .IsUnique();

        modelBuilder.Entity<PrerrequisitoAsignatura>()
            .HasKey(entity => new { entity.IdPrerrequisitoAsignatura, entity.IdAsignatura });

        modelBuilder.Entity<Usuario>()
            .Property(entity => entity.EstadoCuenta)
            .HasConversion(new ValueConverter<EstadoCuenta, string>(
                value => EstadoCuentaToDatabase(value),
                value => EstadoCuentaFromDatabase(value)));
        modelBuilder.Entity<TokenAutenticacion>()
            .Property(entity => entity.TipoToken)
            .HasConversion(new ValueConverter<TipoTokenAutenticacion, string>(
                value => TokenTypeToDatabase(value),
                value => TokenTypeFromDatabase(value)));
        modelBuilder.Entity<PlanEstudio>()
            .Property(entity => entity.Modalidad)
            .HasConversion(new ValueConverter<ModalidadPlanEstudio, string>(
                value => ModalidadPlanToDatabase(value),
                value => ModalidadPlanFromDatabase(value)));
        modelBuilder.Entity<PlanEstudio>()
            .Property(entity => entity.EstadoPlan)
            .HasConversion(new ValueConverter<EstadoPlanEstudio, string>(
                value => EstadoPlanToDatabase(value),
                value => EstadoPlanFromDatabase(value)));
        modelBuilder.Entity<ObjetivoCarrera>()
            .Property(entity => entity.TipoObjetivo)
            .HasConversion(new ValueConverter<TipoObjetivo, string>(
                value => TipoObjetivoToDatabase(value),
                value => TipoObjetivoFromDatabase(value)));
        modelBuilder.Entity<Asignatura>()
            .Property(entity => entity.Modalidad)
            .HasConversion(new ValueConverter<ModalidadAsignatura, string>(
                value => ModalidadAsignaturaToDatabase(value),
                value => ModalidadAsignaturaFromDatabase(value)));
        modelBuilder.Entity<Asignatura>()
            .Property(entity => entity.EstadoAsignatura)
            .HasConversion(new ValueConverter<EstadoAsignatura, string>(
                value => EstadoAsignaturaToDatabase(value),
                value => EstadoAsignaturaFromDatabase(value)));
        modelBuilder.Entity<ObjetivoAsignatura>()
            .Property(entity => entity.TipoObjetivo)
            .HasConversion(new ValueConverter<TipoObjetivo, string>(
                value => TipoObjetivoToDatabase(value),
                value => TipoObjetivoFromDatabase(value)));

        modelBuilder.Entity<PlanEstudio>()
            .Property(entity => entity.EstadoPlan)
            .HasDefaultValueSql("'borrador'");
        modelBuilder.Entity<TokenAutenticacion>()
            .Property(entity => entity.Consumido)
            .HasDefaultValue(false);
        modelBuilder.Entity<Asignatura>()
            .Property(entity => entity.EstadoAsignatura)
            .HasDefaultValueSql("'activo'");

        var estadoRegistroConverter = new ValueConverter<EstadoRegistro, string>(
            value => EstadoRegistroToDatabase(value),
            value => EstadoRegistroFromDatabase(value));
        foreach (var tipoEntidad in new[] { typeof(Sede), typeof(Facultad), typeof(Carrera) })
        {
            modelBuilder.Entity(tipoEntidad)
                .Property(nameof(Sede.EstadoRegistro))
                .HasConversion(estadoRegistroConverter)
                .HasDefaultValueSql("'activo'");
        }

        modelBuilder.Entity<Facultad>()
            .HasOne(entity => entity.Sede)
            .WithMany(entity => entity.Facultades)
            .HasForeignKey(entity => entity.IdSede)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Carrera>()
            .HasOne(entity => entity.Facultad)
            .WithMany(entity => entity.Carreras)
            .HasForeignKey(entity => entity.IdFacultad)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Usuario>()
            .HasOne(entity => entity.Rol)
            .WithMany(entity => entity.Usuarios)
            .HasForeignKey(entity => entity.IdRol)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Usuario>()
            .HasOne(entity => entity.Facultad)
            .WithMany(entity => entity.Usuarios)
            .HasForeignKey(entity => entity.IdFacultad)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<TokenAutenticacion>()
            .HasOne(entity => entity.Usuario)
            .WithMany(entity => entity.TokensAutenticacion)
            .HasForeignKey(entity => entity.IdUsuario)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<RegistroCambio>()
            .HasOne(entity => entity.Usuario)
            .WithMany(entity => entity.RegistrosCambios)
            .HasForeignKey(entity => entity.IdUsuario)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PlanEstudio>()
            .HasOne(entity => entity.Carrera)
            .WithMany(entity => entity.PlanesEstudio)
            .HasForeignKey(entity => entity.IdCarrera)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<UsuarioParticipantePlan>()
            .HasOne(entity => entity.PlanEstudio)
            .WithMany(entity => entity.UsuariosParticipantes)
            .HasForeignKey(entity => entity.IdPlan)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<UsuarioParticipantePlan>()
            .HasOne(entity => entity.Usuario)
            .WithMany(entity => entity.PlanesParticipados)
            .HasForeignKey(entity => entity.IdUsuario)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ActividadesArea>()
            .HasOne(entity => entity.PlanEstudio)
            .WithMany(entity => entity.ActividadesAreas)
            .HasForeignKey(entity => entity.IdPlan)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Actividad>()
            .HasOne(entity => entity.ActividadesArea)
            .WithMany(entity => entity.Actividades)
            .HasForeignKey(entity => entity.IdArea)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<OrientacionMetodologica>()
            .HasOne(entity => entity.PlanEstudio)
            .WithMany(entity => entity.OrientacionesMetodologicas)
            .HasForeignKey(entity => entity.IdPlan)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<RequisitoPermanenciaGraduacion>()
            .HasOne(entity => entity.PlanEstudio)
            .WithMany(entity => entity.RequisitosPermanenciaGraduacion)
            .HasForeignKey(entity => entity.IdPlan)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<EvaluacionAprendizaje>()
            .HasOne(entity => entity.PlanEstudio)
            .WithMany(entity => entity.EvaluacionesAprendizaje)
            .HasForeignKey(entity => entity.IdPlan)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ItemJustificacion>()
            .HasOne(entity => entity.PlanEstudio)
            .WithMany(entity => entity.ItemsJustificacion)
            .HasForeignKey(entity => entity.IdPlan)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<MaterialDidactico>()
            .HasOne(entity => entity.PlanEstudio)
            .WithMany(entity => entity.MaterialesDidacticos)
            .HasForeignKey(entity => entity.IdPlan)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ObjetivoCarrera>()
            .HasOne(entity => entity.PlanEstudio)
            .WithMany(entity => entity.ObjetivosCarrera)
            .HasForeignKey(entity => entity.IdPlan)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<PerfilCurricular>()
            .HasOne(entity => entity.PlanEstudio)
            .WithMany(entity => entity.PerfilesCurriculares)
            .HasForeignKey(entity => entity.IdPlan)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<PerfilIngreso>()
            .HasOne(entity => entity.PerfilCurricular)
            .WithMany(entity => entity.PerfilesIngreso)
            .HasForeignKey(entity => entity.IdPerfilCurricular)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<PerfilEgreso>()
            .HasOne(entity => entity.PerfilCurricular)
            .WithMany(entity => entity.PerfilesEgreso)
            .HasForeignKey(entity => entity.IdPerfilCurricular)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ReferenciaBibliograficaPlan>()
            .HasOne(entity => entity.PlanEstudio)
            .WithMany(entity => entity.ReferenciasBibliograficas)
            .HasForeignKey(entity => entity.IdPlan)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AsignaturaCarrera>()
            .HasOne(entity => entity.Carrera)
            .WithMany(entity => entity.AsignaturasCarrera)
            .HasForeignKey(entity => entity.IdCarrera)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<AsignaturaCarrera>()
            .HasOne(entity => entity.Asignatura)
            .WithMany(entity => entity.Carreras)
            .HasForeignKey(entity => entity.IdAsignatura)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<UsuarioParticipanteAsignatura>()
            .HasOne(entity => entity.Asignatura)
            .WithMany(entity => entity.UsuariosParticipantes)
            .HasForeignKey(entity => entity.IdAsignatura)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<UsuarioParticipanteAsignatura>()
            .HasOne(entity => entity.Usuario)
            .WithMany(entity => entity.AsignaturasParticipadas)
            .HasForeignKey(entity => entity.IdUsuario)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<UnidadDidactica>()
            .HasOne(entity => entity.Asignatura)
            .WithMany(entity => entity.UnidadesDidacticas)
            .HasForeignKey(entity => entity.IdAsignatura)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Contenido>()
            .HasOne(entity => entity.UnidadDidactica)
            .WithMany(entity => entity.Contenidos)
            .HasForeignKey(entity => entity.IdUnidadDidactica)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ObjetivoAsignatura>()
            .HasOne(entity => entity.Asignatura)
            .WithMany(entity => entity.Objetivos)
            .HasForeignKey(entity => entity.IdAsignatura)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<TematicaLey>()
            .HasOne(entity => entity.Asignatura)
            .WithMany(entity => entity.TematicasLey)
            .HasForeignKey(entity => entity.IdAsignatura)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ReferenciaBibliograficaAsignatura>()
            .HasOne(entity => entity.Asignatura)
            .WithMany(entity => entity.ReferenciasBibliograficas)
            .HasForeignKey(entity => entity.IdAsignatura)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<FuenteElectronicaAsignatura>()
            .HasOne(entity => entity.Asignatura)
            .WithMany(entity => entity.FuentesElectronicas)
            .HasForeignKey(entity => entity.IdAsignatura)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<PrerrequisitoNoAsignatura>()
            .HasOne(entity => entity.Asignatura)
            .WithMany(entity => entity.PrerrequisitosNoAsignatura)
            .HasForeignKey(entity => entity.IdAsignatura)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<PrerrequisitoAsignatura>()
            .HasOne(entity => entity.Prerrequisito)
            .WithMany(entity => entity.ComoPrerrequisito)
            .HasForeignKey(entity => entity.IdPrerrequisitoAsignatura)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<PrerrequisitoAsignatura>()
            .HasOne(entity => entity.Asignatura)
            .WithMany(entity => entity.ComoAsignatura)
            .HasForeignKey(entity => entity.IdAsignatura)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<PlanAbsorcion>()
            .HasOne(entity => entity.Asignatura)
            .WithMany(entity => entity.PlanesAbsorcion)
            .HasForeignKey(entity => entity.IdAsignatura)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<PlanAbsorcion>()
            .HasOne(entity => entity.AsignaturaEquivalente)
            .WithMany(entity => entity.PlanesAbsorcionEquivalentes)
            .HasForeignKey(entity => entity.IdAsignaturaEquivalente)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<PlanAbsorcion>()
            .HasOne(entity => entity.PlanEstudio)
            .WithMany(entity => entity.PlanesAbsorcion)
            .HasForeignKey(entity => entity.IdPlan)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<MatrizCambio>()
            .HasOne(entity => entity.PlanEstudio)
            .WithMany(entity => entity.MatricesCambios)
            .HasForeignKey(entity => entity.IdPlan)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<MatrizCambio>()
            .HasOne(entity => entity.Asignatura)
            .WithMany(entity => entity.MatricesCambios)
            .HasForeignKey(entity => entity.IdAsignatura)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<MatrizCongruencia>()
            .HasOne(entity => entity.PlanEstudio)
            .WithMany(entity => entity.MatricesCongruencia)
            .HasForeignKey(entity => entity.IdPlan)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<MatrizCongruencia>()
            .HasOne(entity => entity.ObjetivoCarrera)
            .WithMany(entity => entity.MatricesCongruencia)
            .HasForeignKey(entity => entity.IdObjetivoCarrera)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<MatrizCongruenciaAsignatura>()
            .HasOne(entity => entity.MatrizCongruencia)
            .WithMany(entity => entity.Asignaturas)
            .HasForeignKey(entity => entity.IdMatrizCongruencia)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<MatrizCongruenciaAsignatura>()
            .HasOne(entity => entity.Asignatura)
            .WithMany(entity => entity.MatricesCongruencia)
            .HasForeignKey(entity => entity.IdAsignatura)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static string TokenTypeToDatabase(TipoTokenAutenticacion value) => value switch
    {
        TipoTokenAutenticacion.Activacion => "activacion",
        TipoTokenAutenticacion.Invitacion => "invitacion",
        TipoTokenAutenticacion.ResetPassword => "reset_password",
        _ => throw new InvalidOperationException($"Tipo de token no soportado: {value}.")
    };

    private static string EstadoCuentaToDatabase(EstadoCuenta value) => value switch
    {
        EstadoCuenta.Activo => "activo",
        EstadoCuenta.Inactivo => "inactivo",
        _ => throw new InvalidOperationException($"Estado de cuenta no soportado: {value}.")
    };

    private static string EstadoAsignaturaToDatabase(EstadoAsignatura value) => value switch
    {
        EstadoAsignatura.Activo => "activo",
        EstadoAsignatura.Inactivo => "inactivo",
        _ => throw new InvalidOperationException($"Estado de asignatura no soportado: {value}.")
    };

    private static string EstadoRegistroToDatabase(EstadoRegistro value) => value switch
    {
        EstadoRegistro.Activo => "activo",
        EstadoRegistro.Inactivo => "inactivo",
        _ => throw new InvalidOperationException($"Estado de registro no soportado: {value}.")
    };

    private static EstadoRegistro EstadoRegistroFromDatabase(string value) => value switch
    {
        "activo" => EstadoRegistro.Activo,
        "inactivo" => EstadoRegistro.Inactivo,
        _ => throw new InvalidOperationException($"Estado de registro almacenado no soportado: {value}.")
    };

    private static EstadoAsignatura EstadoAsignaturaFromDatabase(string value) => value switch
    {
        "activo" => EstadoAsignatura.Activo,
        "inactivo" => EstadoAsignatura.Inactivo,
        _ => throw new InvalidOperationException($"Estado de asignatura almacenado no soportado: {value}.")
    };

    private static EstadoCuenta EstadoCuentaFromDatabase(string value) => value switch
    {
        "activo" => EstadoCuenta.Activo,
        "inactivo" => EstadoCuenta.Inactivo,
        _ => throw new InvalidOperationException($"Estado de cuenta almacenado no soportado: {value}.")
    };

    private static string TipoObjetivoToDatabase(TipoObjetivo value) => value switch
    {
        TipoObjetivo.General => "general",
        TipoObjetivo.Especifico => "especifico",
        _ => throw new InvalidOperationException($"Tipo de objetivo no soportado: {value}.")
    };

    private static TipoObjetivo TipoObjetivoFromDatabase(string value) => value switch
    {
        "general" => TipoObjetivo.General,
        "especifico" => TipoObjetivo.Especifico,
        _ => throw new InvalidOperationException($"Tipo de objetivo almacenado no soportado: {value}.")
    };

    private static TipoTokenAutenticacion TokenTypeFromDatabase(string value) => value switch
    {
        "activacion" => TipoTokenAutenticacion.Activacion,
        "invitacion" => TipoTokenAutenticacion.Invitacion,
        "reset_password" => TipoTokenAutenticacion.ResetPassword,
        _ => throw new InvalidOperationException($"Tipo de token almacenado no soportado: {value}.")
    };

    private static string ModalidadPlanToDatabase(ModalidadPlanEstudio value) => value switch
    {
        ModalidadPlanEstudio.Presencial => "presencial",
        ModalidadPlanEstudio.Semipresencial => "semipresencial",
        ModalidadPlanEstudio.Virtual => "virtual",
        _ => throw new InvalidOperationException($"Modalidad de plan no soportada: {value}.")
    };

    private static ModalidadPlanEstudio ModalidadPlanFromDatabase(string value) => value switch
    {
        "presencial" => ModalidadPlanEstudio.Presencial,
        "semipresencial" => ModalidadPlanEstudio.Semipresencial,
        "virtual" => ModalidadPlanEstudio.Virtual,
        _ => throw new InvalidOperationException($"Modalidad de plan almacenada no soportada: {value}.")
    };

    private static string EstadoPlanToDatabase(EstadoPlanEstudio value) => value switch
    {
        EstadoPlanEstudio.Borrador => "borrador",
        EstadoPlanEstudio.EnRevision => "en_revision",
        EstadoPlanEstudio.Aprobado => "aprobado",
        EstadoPlanEstudio.SalienteHistorico => "saliente_historico",
        EstadoPlanEstudio.Desactivado => "desactivado",
        _ => throw new InvalidOperationException($"Estado de plan no soportado: {value}.")
    };

    private static EstadoPlanEstudio EstadoPlanFromDatabase(string value) => value switch
    {
        "borrador" => EstadoPlanEstudio.Borrador,
        "en_revision" => EstadoPlanEstudio.EnRevision,
        "aprobado" => EstadoPlanEstudio.Aprobado,
        "saliente_historico" => EstadoPlanEstudio.SalienteHistorico,
        "desactivado" => EstadoPlanEstudio.Desactivado,
        _ => throw new InvalidOperationException($"Estado de plan almacenado no soportado: {value}.")
    };

    private static string ModalidadAsignaturaToDatabase(ModalidadAsignatura value) => value switch
    {
        ModalidadAsignatura.Presencial => "presencial",
        ModalidadAsignatura.Semipresencial => "semipresencial",
        ModalidadAsignatura.Nopresencial => "nopresencial",
        _ => throw new InvalidOperationException($"Modalidad de asignatura no soportada: {value}.")
    };

    private static ModalidadAsignatura ModalidadAsignaturaFromDatabase(string value) => value switch
    {
        "presencial" => ModalidadAsignatura.Presencial,
        "semipresencial" => ModalidadAsignatura.Semipresencial,
        "nopresencial" => ModalidadAsignatura.Nopresencial,
        _ => throw new InvalidOperationException($"Modalidad de asignatura almacenada no soportada: {value}.")
    };
}
