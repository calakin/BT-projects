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
using SuggestionBox.Models;

namespace SuggestionBox.Controllers
{
    public class CardsController : ApiController
    {
        private SuggestionBoxContext db = new SuggestionBoxContext();

        // GET: api/Cards
        public IQueryable<CardDTO> GetCards()
        {
            var cards = from c in db.Cards
                        select new CardDTO()
                        {
                            Id = c.Id,
                            Suggestion = c.Suggestion,
                            DateAdded = c.DateAdded,
                            Suggestor = c.Suggestor,
                            Department = c.Department,
                            Team = c.Team,                            
                            Stage = c.Stage,
                            Comment = c.Comment,
                            Deleted = c.Deleted,
                            Tags = c.Tags,
                            Complexity = c.Complexity,
                            Notes = c.Notes,
                            Priority = c.Priority
                        };

            return cards;
        }

        // GET api/Cards/5
        [ResponseType(typeof(CardDTO))]
        public async Task<IHttpActionResult> GetCard(int id)
        {
            var card = await db.Cards.Select(b =>
                new CardDTO()
                {
                    Id = b.Id,
                    Suggestion = b.Suggestion,
                    DateAdded = b.DateAdded,
                    Suggestor = b.Suggestor,
                    Department = b.Department,
                    Team = b.Team,
                    Stage = b.Stage,
                    Comment = b.Comment,
                    Deleted = b.Deleted,
                    Tags = b.Tags,
                    Complexity = b.Complexity,
                    Notes = b.Notes,
                    Priority = b.Priority
                }).SingleOrDefaultAsync(b => b.Id == id);
            if (card == null)
            {
                return NotFound();
            }
         
            return Ok(card);
        }

        // PUT: api/Cards/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutCard(int id, Card card)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != card.Id)
            {
                return BadRequest();
            }

            db.Entry(card).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CardExists(id))
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

        // POST: api/Cards
        [ResponseType(typeof(Card))]
        public async Task<IHttpActionResult> PostCard(Card card)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Cards.Add(card);
            await db.SaveChangesAsync();

            var dto = new CardDTO()
            {
                Id = card.Id,
                Suggestion = card.Suggestion,
                DateAdded = card.DateAdded,
                Suggestor = card.Suggestor,
                Department = card.Department,
                Team = card.Team,                
                Stage = card.Stage,
                Comment = card.Comment,
                Deleted = card.Deleted,
                Tags = card.Tags,
                Complexity = card.Complexity,
                Notes = card.Notes,
                Priority = card.Priority
            };

            return CreatedAtRoute("DefaultApi", new { id = card.Id }, dto);
        }

        // DELETE: api/Cards/5
        [ResponseType(typeof(Card))]
        public async Task<IHttpActionResult> DeleteCard(int id)
        {
            Card card = await db.Cards.FindAsync(id);
            if (card == null)
            {
                return NotFound();
            }

            db.Cards.Remove(card);
            await db.SaveChangesAsync();

            return Ok(card);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CardExists(int id)
        {
            return db.Cards.Count(e => e.Id == id) > 0;
        }
    }
}