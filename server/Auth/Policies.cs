namespace UserManagement.Api.Auth;

public static class Policies
{
    public const string RequireCanEditUsers = "RequireCanEditUsers";
    public const string RequireSuperAdmin = "RequireSuperAdmin";
    public const string RequireManagedUserAccess = "RequireManagedUserAccess";
}

