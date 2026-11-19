namespace GestionCurricular.Api.Services;

public sealed class UsuarioServiceException(int statusCode, string message) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}
