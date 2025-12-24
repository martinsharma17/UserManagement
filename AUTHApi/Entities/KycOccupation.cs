using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AUTHApi.Entities
{
    /// <summary>
    /// Section 5: Professional and Income information.
    /// Linked 1:1 with the main KycForm.
    /// </summary>
    public class KycOccupation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int KycFormId { get; set; }

        [ForeignKey("KycFormId")]
        public virtual KycForm? KycForm { get; set; }

        [MaxLength(100)]
        public string? Occupation { get; set; }

        [MaxLength(255)]
        public string? OrgName { get; set; }

        public string? OrgAddress { get; set; }

        [MaxLength(100)]
        public string? Designation { get; set; }

        [MaxLength(50)]
        public string? EmployeeIdNo { get; set; }

        [MaxLength(50)]
        public string? AnnualIncomeBracket { get; set; }
    }
}
