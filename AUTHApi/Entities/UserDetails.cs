using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AUTHApi.Entities
{
    public class UserDetails
    {
        [Key]
        public int UserId { get; set; }

        public string? ApplicationUserId { get; set; }
        [ForeignKey("ApplicationUserId")]
        public ApplicationUser? User { get; set; }

        // Personal Information
        [Required]
        [MaxLength(255)]
        public string FullName { get; set; } = string.Empty;
        public DateTime? DateOfBirthAd { get; set; }
        [MaxLength(20)]
        public string? DateOfBirthBs { get; set; }
        [MaxLength(20)]
        public string? Gender { get; set; }
        [MaxLength(100)]
        public string? Nationality { get; set; }
        [MaxLength(50)]
        public string? CitizenshipNumber { get; set; }
        public DateTime? CitizenshipIssueDate { get; set; }
        [MaxLength(100)]
        public string? CitizenshipIssueDistrict { get; set; }
        [MaxLength(50)]
        public string? BeneficiaryIdNo { get; set; }
        [MaxLength(50)]
        public string? PanNumber { get; set; }
        [MaxLength(100)]
        public string? IdentificationNoNrn { get; set; }

        // Address Details
        [MaxLength(20)]
        public string? CurrentWardNo { get; set; }
        [MaxLength(100)]
        public string? CurrentMunicipality { get; set; }
        [MaxLength(100)]
        public string? CurrentDistrict { get; set; }
        [MaxLength(100)]
        public string? CurrentProvince { get; set; }
        [MaxLength(100)]
        public string? CurrentCountry { get; set; }
        [MaxLength(20)]
        public string? PermanentWardNo { get; set; }
        [MaxLength(100)]
        public string? PermanentMunicipality { get; set; }
        [MaxLength(100)]
        public string? PermanentDistrict { get; set; }
        [MaxLength(100)]
        public string? PermanentProvince { get; set; }
        [MaxLength(100)]
        public string? PermanentCountry { get; set; }
        [MaxLength(50)]
        public string? ContactNumber { get; set; }
        [MaxLength(255)]
        public string? EmailAddress { get; set; }

        // Family Information
        [MaxLength(255)]
        public string? FatherName { get; set; }
        [MaxLength(255)]
        public string? MotherName { get; set; }
        [MaxLength(255)]
        public string? GrandfatherName { get; set; }
        [MaxLength(255)]
        public string? SpouseName { get; set; }
        public string? ChildrenNames { get; set; }
        public string? InlawsNames { get; set; }

        // Bank Account Details
        [MaxLength(50)]
        public string? AccountType { get; set; }
        [MaxLength(50)]
        public string? AccountNumber { get; set; }
        [MaxLength(255)]
        public string? BankName { get; set; }
        public string? BankAddress { get; set; }

        // Occupation & Financial Details
        [MaxLength(100)]
        public string? Occupation { get; set; }
        [MaxLength(100)]
        public string? BusinessType { get; set; }
        [MaxLength(255)]
        public string? OrganizationName { get; set; }
        public string? OrganizationAddress { get; set; }
        [MaxLength(100)]
        public string? Designation { get; set; }
        [MaxLength(50)]
        public string? EmployeeIdNo { get; set; }
        [MaxLength(50)]
        public string? AnnualIncomeBracket { get; set; }

        // Guardian Information (if minor)
        [MaxLength(255)]
        public string? GuardianName { get; set; }
        [MaxLength(100)]
        public string? GuardianRelationship { get; set; }
        public string? GuardianAddress { get; set; }
        [MaxLength(50)]
        public string? GuardianFaxNo { get; set; }
        [MaxLength(50)]
        public string? GuardianTelephoneNo { get; set; }
        [MaxLength(255)]
        public string? GuardianEmail { get; set; }
        [MaxLength(50)]
        public string? GuardianPanNo { get; set; }
        [MaxLength(50)]
        public string? GuardianMobileNo { get; set; }
        [MaxLength(50)]
        public string? GuardianBirthRegNo { get; set; }
        public DateTime? GuardianIssueDate { get; set; }
        [MaxLength(100)]
        public string? GuardianIssuingAuthority { get; set; }
        public string? GuardianSignature { get; set; }

        // Investment Disclosure
        public bool InvolvedInOtherInvestments { get; set; } = false;
        public string? InvestmentDetails { get; set; }

        // Legal Consent
        public string? LegalDeclaration { get; set; }
        public bool LegalConsent { get; set; } = false;

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<UserImage>? UserImages { get; set; }
    }
}
