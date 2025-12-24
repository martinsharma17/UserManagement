using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AUTHApi.Entities
{
    public class UserImage
    {
        [Key]
        public int ImageId { get; set; }

        public int UserDetailsId { get; set; }
        [ForeignKey("UserDetailsId")]
        public UserDetails? UserDetails { get; set; }

        [MaxLength(100)]
        public string? ImageType { get; set; } // e.g., 'Location Map', 'ID Proof'
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}
