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
using DataRequestSystem.Models;

namespace DataRequestSystem.Controllers
{
    public class LinksController : ApiController
    {
        private DataRequestSystemContext db = new DataRequestSystemContext();

        // GET: api/Links
        public IQueryable<Links> GetLinks()
        {
            return db.Links;
        }

        // GET: api/Links/5
        [ResponseType(typeof(Links))]
        public async Task<IHttpActionResult> GetLinks(int id)
        {
            Links links = await db.Links.FindAsync(id);
            if (links == null)
            {
                return NotFound();
            }

            return Ok(links);
        }

        // PUT: api/Links/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutLinks(int id, Links links)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != links.Id)
            {
                return BadRequest();
            }

            db.Entry(links).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LinksExists(id))
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

        // POST: api/Links
        [ResponseType(typeof(Links))]
        public async Task<IHttpActionResult> PostLinks(Links links)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Links.Add(links);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = links.Id }, links);
        }

        // DELETE: api/Links/5
        [ResponseType(typeof(Links))]
        public async Task<IHttpActionResult> DeleteLinks(int id)
        {
            Links links = await db.Links.FindAsync(id);
            if (links == null)
            {
                return NotFound();
            }

            db.Links.Remove(links);
            await db.SaveChangesAsync();

            return Ok(links);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool LinksExists(int id)
        {
            return db.Links.Count(e => e.Id == id) > 0;
        }
    }
}