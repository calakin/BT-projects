using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using DataRequestSystem.Models;

namespace DataRequestSystem.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult RequestSubmission()
        {

            return View();
        }

        //[HttpGet]
        public async Task<ActionResult> AddRequestSubmission(FormRequest form)
        {
            using (DataRequestSystemContext db = new DataRequestSystemContext())
            {
                if(ModelState.IsValid)
                {
                    FormRequest newForm = new FormRequest
                    {
                        DateRequested = DateTime.Now.ToLocalTime(),
                        DateWanted = form.DateWanted,
                        RequesterName = form.RequesterName,
                        PriorityLevel = form.PriorityLevel,
                        NumberRequests = form.NumberRequests,
                        Requests = form.Requests,
                        UsageExplanation = form.UsageExplanation,
                        RequestComments = form.RequestComments,
                        Viewers = form.Viewers,
                        Format = form.Format,
                        DatePulled = DateTime.Now.ToLocalTime(),
                        //DataPulledBy = form.DataPulledBy,
                        //DevComments = form.DevComments,
                        //FileName = form.FileName,
                        //FileURL = form.FileURL,
                        //CompletionStatus = form.CompletionStatus,
                        //UncompletionReason = form.UncompletionReason,
                        //SQLQueries = form.SQLQueries,
                        //TicketNumber = form.TicketNumber,
                        //TicketURL = form.TicketURL,
                        //Type = form.Type
                    };
                    db.FormRequests.Add(newForm);
                    await db.SaveChangesAsync();
                    return RedirectToAction("RequestSubmission");
                }
             
            }
            ViewResult v = View(form);
            return RedirectToAction("RequestSubmission");
        }
        public ActionResult CompletedRequests()
        {
            ViewBag.Message = "";

            return View();
        }

        public ActionResult RequestQueue()
        {
            ViewBag.Message = "";

            return View();
        }
    }
}