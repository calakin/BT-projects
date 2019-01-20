using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

//Data Transfer Object for a card.

namespace SuggestionBox.Models
{
    public class CardDTO
    {
        public int Id { get; set; }
        public string Suggestion { get; set; }
        public DateTime DateAdded { get; set; }
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