using System.Net;
using System.Net.Mail;

namespace GestionCurricular.Api.Services;

public sealed class SmtpEmailSender(
    IConfiguration configuration,
    ILogger<SmtpEmailSender> logger) : IEmailSender
{
    public async Task EnviarInvitacionAsync(
        string correo,
        string nombre,
        string token,
        CancellationToken cancellationToken)
    {
        var host = configuration["Email:Smtp:Host"];
        var username = configuration["Email:Smtp:Username"];
        var password = configuration["Email:Smtp:Password"];
        var fromAddress = configuration["Email:Smtp:FromAddress"];
        var frontendBaseUrl = configuration["Frontend:BaseUrl"]?.TrimEnd('/');

        if (string.IsNullOrWhiteSpace(host)
            || string.IsNullOrWhiteSpace(username)
            || string.IsNullOrWhiteSpace(password)
            || string.IsNullOrWhiteSpace(fromAddress)
            || string.IsNullOrWhiteSpace(frontendBaseUrl)
            || !Uri.TryCreate(frontendBaseUrl, UriKind.Absolute, out var frontendUri)
            || (frontendUri.Scheme != Uri.UriSchemeHttp && frontendUri.Scheme != Uri.UriSchemeHttps))
        {
            throw new UsuarioServiceException(
                StatusCodes.Status503ServiceUnavailable,
                "El servicio de correo no está configurado correctamente.");
        }

        var port = configuration.GetValue<int?>("Email:Smtp:Port") ?? 587;
        var enableSsl = configuration.GetValue<bool?>("Email:Smtp:EnableSsl") ?? true;
        var fromName = configuration["Email:Smtp:FromName"] ?? "Gestión Curricular";
        var activationUrl = $"{frontendBaseUrl}/activar-cuenta#token={Uri.EscapeDataString(token)}";
        var encodedName = WebUtility.HtmlEncode(nombre);
        var encodedUrl = WebUtility.HtmlEncode(activationUrl);

        using var message = new MailMessage
        {
            From = new MailAddress(fromAddress, fromName),
            Subject = "Activa tu cuenta de Gestión Curricular",
            Body = $"""
                <p>Hola {encodedName},</p>
                <p>Tu cuenta está pendiente de activación en el Sistema Web de Gestión Curricular.</p>
                <p>Para activar tu cuenta y elegir tu contraseña, utiliza el siguiente enlace dentro de las próximas 24 horas:</p>
                <p><a href="{encodedUrl}">Activar mi cuenta</a></p>
                <p>Si no esperabas este mensaje, puedes ignorarlo.</p>
                """,
            IsBodyHtml = true
        };
        message.To.Add(new MailAddress(correo));

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = enableSsl,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(username, password),
            Timeout = 30000
        };

        try
        {
            await client.SendMailAsync(message, cancellationToken);
        }
        catch (SmtpException exception)
        {
            logger.LogError(exception, "No se pudo enviar el correo de invitación a {Correo}.", correo);
            throw new UsuarioServiceException(
                StatusCodes.Status503ServiceUnavailable,
                "No se pudo enviar el correo de activación. Verifica la configuración de correo e inténtalo nuevamente.");
        }
    }

    public async Task EnviarRestablecimientoContrasenaAsync(
        string correo,
        string nombre,
        string token,
        CancellationToken cancellationToken)
    {
        var host = configuration["Email:Smtp:Host"];
        var username = configuration["Email:Smtp:Username"];
        var password = configuration["Email:Smtp:Password"];
        var fromAddress = configuration["Email:Smtp:FromAddress"];
        var frontendBaseUrl = configuration["Frontend:BaseUrl"]?.TrimEnd('/');

        if (string.IsNullOrWhiteSpace(host)
            || string.IsNullOrWhiteSpace(username)
            || string.IsNullOrWhiteSpace(password)
            || string.IsNullOrWhiteSpace(fromAddress)
            || string.IsNullOrWhiteSpace(frontendBaseUrl)
            || !Uri.TryCreate(frontendBaseUrl, UriKind.Absolute, out var frontendUri)
            || (frontendUri.Scheme != Uri.UriSchemeHttp && frontendUri.Scheme != Uri.UriSchemeHttps))
        {
            throw new UsuarioServiceException(
                StatusCodes.Status503ServiceUnavailable,
                "El servicio de correo no está configurado correctamente.");
        }

        var port = configuration.GetValue<int?>("Email:Smtp:Port") ?? 587;
        var enableSsl = configuration.GetValue<bool?>("Email:Smtp:EnableSsl") ?? true;
        var fromName = configuration["Email:Smtp:FromName"] ?? "Gestión Curricular";
        var resetUrl = $"{frontendBaseUrl}/restablecer-contrasena#token={Uri.EscapeDataString(token)}";
        var encodedName = WebUtility.HtmlEncode(nombre);
        var encodedUrl = WebUtility.HtmlEncode(resetUrl);

        using var message = new MailMessage
        {
            From = new MailAddress(fromAddress, fromName),
            Subject = "Restablece tu contraseña de Gestión Curricular",
            Body = $"""
                <p>Hola {encodedName},</p>
                <p>Se solicitó cambiar la contraseña de tu cuenta de Gestión Curricular.</p>
                <p>Para elegir una contraseña nueva, abre este enlace dentro de las próximas 24 horas:</p>
                <p><a href="{encodedUrl}">Cambiar mi contraseña</a></p>
                <p>El enlace es de un solo uso. Si no reconoces esta solicitud, ignora este correo.</p>
                """,
            IsBodyHtml = true
        };
        message.To.Add(new MailAddress(correo));

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = enableSsl,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(username, password),
            Timeout = 30000
        };

        try
        {
            await client.SendMailAsync(message, cancellationToken);
        }
        catch (SmtpException exception)
        {
            logger.LogError(exception, "No se pudo enviar el enlace de restablecimiento a {Correo}.", correo);
            throw new UsuarioServiceException(
                StatusCodes.Status503ServiceUnavailable,
                "No se pudo enviar el enlace para cambiar la contraseña. Verifica la configuración de correo e inténtalo nuevamente.");
        }
    }

    public async Task EnviarCodigoDesactivacionAsync(
        string correo,
        string nombre,
        string codigo,
        string tipoEntidad,
        string nombreEntidad,
        CancellationToken cancellationToken)
    {
        var host = configuration["Email:Smtp:Host"];
        var username = configuration["Email:Smtp:Username"];
        var password = configuration["Email:Smtp:Password"];
        var fromAddress = configuration["Email:Smtp:FromAddress"];

        if (string.IsNullOrWhiteSpace(host)
            || string.IsNullOrWhiteSpace(username)
            || string.IsNullOrWhiteSpace(password)
            || string.IsNullOrWhiteSpace(fromAddress))
        {
            throw new UsuarioServiceException(
                StatusCodes.Status503ServiceUnavailable,
                "El servicio de correo no está configurado correctamente.");
        }

        var port = configuration.GetValue<int?>("Email:Smtp:Port") ?? 587;
        var enableSsl = configuration.GetValue<bool?>("Email:Smtp:EnableSsl") ?? true;
        var fromName = configuration["Email:Smtp:FromName"] ?? "Gestión Curricular";
        var encodedName = WebUtility.HtmlEncode(nombre);
        var encodedEntityType = WebUtility.HtmlEncode(tipoEntidad);
        var encodedEntityName = WebUtility.HtmlEncode(nombreEntidad);

        using var message = new MailMessage
        {
            From = new MailAddress(fromAddress, fromName),
            Subject = "Código para desactivar una entidad universitaria",
            Body = $"""
                <p>Hola {encodedName},</p>
                <p>Se solicitó desactivar la {encodedEntityType} <strong>{encodedEntityName}</strong>.</p>
                <p>El código de confirmación es <strong>{codigo}</strong>. Es de un solo uso, vence en 10 minutos y permite hasta cinco intentos.</p>
                <p>La desactivación también afecta sus entidades dependientes. Si no reconoces esta solicitud, ignora este mensaje.</p>
                """,
            IsBodyHtml = true
        };
        message.To.Add(new MailAddress(correo));

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = enableSsl,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(username, password),
            Timeout = 30000
        };

        try
        {
            await client.SendMailAsync(message, cancellationToken);
        }
        catch (SmtpException exception)
        {
            logger.LogError(exception, "No se pudo enviar un código de desactivación a {Correo}.", correo);
            throw new UsuarioServiceException(
                StatusCodes.Status503ServiceUnavailable,
                "No se pudo enviar el código de confirmación. Verifica la configuración de correo e inténtalo nuevamente.");
        }
    }
}
