using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace SuggestionBox.Models
{
    public class Card
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(500)]
        public string Suggestion { get; set; }

        [Required]
        public DateTime DateAdded { get; set; }

        [Required]
        public string Suggestor { get; set; }

        public string Department { get; set; }       

        public string Team { get; set; }

        public string Stage { get; set; }

        public string Comment { get; set; }

        public bool Deleted { get; set; }

        public string Tags { get; set; }

        public int Complexity { get; set; }

        public string Notes { get; set; }

        public int Priority { get; set; }

    }
}