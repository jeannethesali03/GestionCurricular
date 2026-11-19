using GestionCurricular.Domain.Entities;
using GestionCurricular.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GestionCurricular.Tests;

public class UnitTest1
{
    [Fact]
    public void ModelContainsAllEntitiesAndCompositePrerequisiteKey()
    {
        var options = new DbContextOptionsBuilder<GestionCurricularDbContext>()
            .UseMySQL("Server=localhost;Database=Gestion_curricular;User=root;Password=test")
            .Options;

        using var context = new GestionCurricularDbContext(options);
        var model = context.Model;

        Assert.Equal(37, model.GetEntityTypes().Count());

        var prerequisite = model.FindEntityType(typeof(PrerrequisitoAsignatura));
        Assert.NotNull(prerequisite);
        Assert.Equal(
            2,
            prerequisite.FindPrimaryKey()!.Properties.Count);

        var accountStatus = model.FindEntityType(typeof(Usuario))!
            .FindProperty(nameof(Usuario.EstadoCuenta))!
            .GetTypeMapping()
            .Converter!;
        Assert.Equal("activo", accountStatus.ConvertToProvider(EstadoCuenta.Activo));

        var assignmentStatus = model.FindEntityType(typeof(Asignatura))!
            .FindProperty(nameof(Asignatura.EstadoAsignatura))!
            .GetTypeMapping()
            .Converter!;
        Assert.Equal("activo", assignmentStatus.ConvertToProvider(EstadoAsignatura.Activo));
        Assert.Equal("inactivo", assignmentStatus.ConvertToProvider(EstadoAsignatura.Inactivo));

        var planCareerRelationship = model.FindEntityType(typeof(PlanEstudio))!
            .GetForeignKeys()
            .Single(foreignKey => foreignKey.Properties
                .Any(property => property.Name == nameof(PlanEstudio.IdCarrera)));
        Assert.True(planCareerRelationship.IsRequired);

        var stateFreeTypes = new[]
        {
            typeof(AsignaturaCarrera),
            typeof(UsuarioParticipanteAsignatura),
            typeof(UnidadDidactica),
            typeof(Contenido),
            typeof(ObjetivoAsignatura),
            typeof(TematicaLey),
            typeof(ReferenciaBibliograficaAsignatura),
            typeof(PrerrequisitoAsignatura),
            typeof(PrerrequisitoNoAsignatura),
            typeof(UsuarioParticipantePlan),
            typeof(ActividadesArea),
            typeof(Actividad),
            typeof(OrientacionMetodologica),
            typeof(RequisitoPermanenciaGraduacion),
            typeof(EvaluacionAprendizaje),
            typeof(ItemJustificacion),
            typeof(MaterialDidactico),
            typeof(ObjetivoCarrera),
            typeof(PerfilCurricular),
            typeof(PerfilIngreso),
            typeof(PerfilEgreso),
            typeof(ReferenciaBibliograficaPlan),
            typeof(PlanAbsorcion),
            typeof(MatrizCambio),
            typeof(MatrizCongruencia),
            typeof(MatrizCongruenciaAsignatura),
            typeof(FuenteElectronicaAsignatura)
        };

        foreach (var entityType in stateFreeTypes)
        {
            Assert.Null(model.FindEntityType(entityType)!
                .FindProperty("EstadoRegistro"));
        }

        Assert.Equal(
            "estado_registro",
            model.FindEntityType(typeof(Asignatura))!
                .FindProperty(nameof(Asignatura.EstadoAsignatura))!
                .GetColumnName());
        Assert.Equal(
            "Actividades_areas",
            model.FindEntityType(typeof(ActividadesArea))!.GetTableName());
        Assert.Equal(
            "Fuentes_electronicas_asignatura",
            model.FindEntityType(typeof(FuenteElectronicaAsignatura))!.GetTableName());
    }
}
