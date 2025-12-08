namespace UserManagement.Api.Auth;

public static class CustomClaims
{
    public const string CanEditUsers = "CanEditUsers";
    public const string IsSuperAdmin = "IsSuperAdmin";
    public const string ManagedByAdminId = "ManagedBy";
    public const string TargetManagedByAdminId = "TargetManagedBy";
    public const string Permissions = "permissions";
}

