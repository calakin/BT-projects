using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Mvc;
using DataRequestSystem.Models;
//using System.DirectoryServices.DirectorySearcher;

namespace DataRequestSystem.Controllers
{
    public class FormRequestsController : ApiController
    {
        private DataRequestSystemContext db = new DataRequestSystemContext();

        // GET: api/
        //[System.Web.Http.Route("api/getDirectory")]
        //public Task<IHttpActionResult> getDirectory()
        //{
        //    //DirectorySearcher directorySearch = new DirectorySearcher();

        //    //return Ok();
        //}

        // GET: api/FormRequests
        public IQueryable<FormRequest> GetFormRequests()
        {
            return db.FormRequests;
        }

        // GET: api/FormRequests/5
        [ResponseType(typeof(FormRequest))]
        public async Task<IHttpActionResult> GetFormRequest(int id)
        {
            FormRequest formRequest = await db.FormRequests.FindAsync(id);
            if (formRequest == null)
            {
                return NotFound();
            }

            return Ok(formRequest);
        }

        // PUT: api/FormRequests/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutFormRequest(int id, FormRequest formRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != formRequest.Id)
            {
                return BadRequest();
            }

            db.Entry(formRequest).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FormRequestExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/FormRequests
        [ResponseType(typeof(FormRequest))]
        public async Task<IHttpActionResult> PostFormRequest(FormRequest formRequest)
        {
            FormRequest newForm = new FormRequest
            {
                Id = (formRequest.Id + 1),
                DateRequested = DateTime.Now.ToLocalTime(),
                DateWanted = formRequest.DateWanted,
                RequesterName = formRequest.RequesterName,
                PriorityLevel = formRequest.PriorityLevel,
                NumberRequests = formRequest.NumberRequests,
                Requests = formRequest.Requests,
                UsageExplanation = formRequest.UsageExplanation,
                RequestComments = formRequest.RequestComments,
                Viewers = formRequest.Viewers,
                Format = formRequest.Format,
                DatePulled = DateTime.Now.ToLocalTime(),
                DataPulledBy = formRequest.DataPulledBy,
                DevComments = formRequest.DevComments,
                //FileNames = formRequest.FileNames,
                //FileURLs = formRequest.FileURLs,
                CompletionStatus = formRequest.CompletionStatus,
                UncompletionReason = formRequest.UncompletionReason,
                //SQLQueries = formRequest.SQLQueries,
                TicketNumber = formRequest.TicketNumber,
                TicketURL = formRequest.TicketURL,
                Description = formRequest.Description,
                filterNDBuilders = formRequest.filterNDBuilders,
                filterOpenBuilders = formRequest.filterOpenBuilders,
                filterUSBuilders = formRequest.filterUSBuilders,
                filterOther = formRequest.filterOther,
                filterToDate = DateTime.Now.ToLocalTime(),
                filterFromDate = DateTime.Now.ToLocalTime(),
            };
            ModelState.Clear();
            this.Validate(newForm);
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            db.FormRequests.Add(formRequest);
            await db.SaveChangesAsync();
            //return Request.CreateResponse(HttpStatusCode.OK, new { Success = true, RedirectUrl = newUrl });
            //System.Diagnostics.Process.Start("localhost:54843/Home/RequestSubmission");
            return CreatedAtRoute("DefaultApi", new
            {
                id = formRequest.Id
            }, formRequest);

        }

        // DELETE: api/FormRequests/5
        [ResponseType(typeof(FormRequest))]
        public async Task<IHttpActionResult> DeleteFormRequest(int id)
        {
            FormRequest formRequest = await db.FormRequests.FindAsync(id);
            if (formRequest == null)
            {
                return NotFound();
            }

            db.FormRequests.Remove(formRequest);
            await db.SaveChangesAsync();

            return Ok(formRequest);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool FormRequestExists(int id)
        {
            return db.FormRequests.Count(e => e.Id == id) > 0;
        }

    }
}