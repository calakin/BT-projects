using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace DataRequestSystem.Models
{
    public class FormRequest
    {
        [Key]
        public int Id { get; set; }

        // Request
        public DateTime DateRequested { get; set; }
 
        //[DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        [Required(ErrorMessage = "Pick Date")]
        [DataType(DataType.DateTime)]
        public DateTime DateWanted { get; set; }

        [Required]
        //[DataType(DataType.Text)]
        public string RequesterName { get; set; }

        [Required(ErrorMessage = "Pick Priority Level")]
        public string PriorityLevel { get; set; }

        [Required(ErrorMessage = "Enter valid # of Requests")]
        [Range(0, int.MaxValue, ErrorMessage = "Please enter valid integer Number")]
        public int NumberRequests { get; set; }

        [Required(ErrorMessage = "Enter Request(s)")]
        public string Requests { get; set; }

        [Required(ErrorMessage = "Enter Usage Explanation")]
        public string UsageExplanation { get; set; }

        [Required(ErrorMessage = "Pick Format")]
        public string Format { get; set; }

        [Required(ErrorMessage = "Enter a Description")]
        [MaxLength(200, ErrorMessage = "Name cannot be longer than 200 characters.")]
        public string Description { get; set; }
        public string RequestComments { get; set; }

        [Required(ErrorMessage = "Enter Viewers")]
        public string Viewers { get; set; }

        [Required(ErrorMessage = "Enter valid # of Viewers")]
        [Range(0, int.MaxValue, ErrorMessage = "Please enter valid integer Number")]
        public int NumberViewers { get; set; }

        // For Devs
        public DateTime DatePulled { get; set; }
        public string DataPulledBy { get; set; }
        public string DevComments { get; set; }
        public string UncompletionReason { get; set; }
        public string CompletionStatus { get; set; }
        public int TicketNumber { get; set; }
        public string TicketURL { get; set; }
        //public string SQLQueries { get; set; }

        // Completed Requests only
        //public string FileNames { get; set; }
        //public string FileURLs { get; set; }

        //Filters
        public Boolean filterNDBuilders { get; set; }
        public Boolean filterOpenBuilders{ get; set; }
        public Boolean filterUSBuilders { get; set; }
        public string filterOther { get; set; }

        public DateTime filterToDate { get; set; }
        public DateTime filterFromDate { get; set; }

    }
}