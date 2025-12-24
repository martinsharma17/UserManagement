using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AUTHApi.Entities
{
    /// <summary>
    /// Section 6: Guardian Details (Required if the user is a minor).
    /// Linked 1:1 with the main KycForm.
    /// </summary>
    public class KycGuardian
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int KycFormId { get; set; }

        [ForeignKey("KycFormId")]
        public virtual KycForm? KycForm { get; set; }

        [MaxLength(255)]
        public string? Name { get; set; }

        [MaxLength(100)]
        public string? Relationship { get; set; }

        public string? Address { get; set; }

        [MaxLength(50)]
        public string? ContactNo { get; set; }

        [MaxLength(255)]
        public string? Email { get; set; }

        [MaxLength(50)]
        public string? PanNo { get; set; }

        public DateTime? Dob { get; set; }

        [MaxLength(100)]
        public string? IssueDistrict { get; set; }
    }
}
