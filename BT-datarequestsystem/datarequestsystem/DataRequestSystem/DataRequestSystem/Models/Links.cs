using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace DataRequestSystem.Models
{
    public class Links
    {

        [Key]
        public int Id { get; set; }

        public int RequestId { get; set; }

        public string Type { get; set; }

        public string Name { get; set; }

        public string URL { get; set; }
    }
}