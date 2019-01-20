using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SuggestionBox.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";

            return View();
        }

        public ActionResult AddSuggestion()
        {
            ViewBag.Title = "Add a Suggestion";

            return View();
        }

        public ActionResult AdminPage()
        {
            ViewBag.Title = "Admin";

            return View();
        }
    }
}
