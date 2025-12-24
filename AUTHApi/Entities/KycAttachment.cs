using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AUTHApi.Entities
{
    /// <summary>
    /// Section 9: Attachments and document uploads.
    /// Linked 1:N with the main KycForm.
    /// </summary>
    public class KycAttachment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int KycFormId { get; set; }

        [ForeignKey("KycFormId")]
        public virtual KycForm? KycForm { get; set; }

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? FileType { get; set; } // e.g., "Citizenship", "Passport", "Photo"

        [Required]
        public string FilePath { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}
