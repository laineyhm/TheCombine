﻿using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/words")]
    public class WordController : Controller
    {
        private readonly IProjectRepository _projRepo;
        private readonly IWordRepository _wordRepo;
        private readonly IPermissionService _permissionService;
        private readonly IWordService _wordService;

        public WordController(IWordRepository repo, IWordService wordService, IProjectRepository projRepo,
            IPermissionService permissionService)
        {
            _projRepo = projRepo;
            _wordRepo = repo;
            _permissionService = permissionService;
            _wordService = wordService;
        }

        /// <summary> Deletes all <see cref="Word"/>s for specified <see cref="Project"/>. </summary>
        /// <returns> true: if success, false: if there were no words </returns>
        [HttpDelete(Name = "DeleteProjectWords")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> DeleteProjectWords(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Owner))
            {
                return Forbid();
            }
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }
            return Ok(await _wordRepo.DeleteAllWords(projectId));
        }

        /// <summary> Deletes specified Frontier <see cref="Word"/>. </summary>
        [HttpDelete("frontier/{wordId}", Name = "DeleteFrontierWord")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> DeleteFrontierWord(string projectId, string wordId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }
            var id = await _wordService.DeleteFrontierWord(projectId, wordId);
            if (id is null)
            {
                return NotFound(wordId);
            }
            return Ok(wordId);
        }

        /// <summary> Returns all <see cref="Word"/>s for specified <see cref="Project"/>. </summary>
        [HttpGet(Name = "GetProjectWords")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Word>))]
        public async Task<IActionResult> GetProjectWords(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }
            return Ok(await _wordRepo.GetAllWords(projectId));
        }

        /// <summary> Returns <see cref="Word"/> with specified id. </summary>
        [HttpGet("{wordId}", Name = "GetWord")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Word))]
        public async Task<IActionResult> GetWord(string projectId, string wordId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }
            var word = await _wordRepo.GetWord(projectId, wordId);
            if (word is null)
            {
                return NotFound(wordId);
            }
            return Ok(word);
        }

        /// <summary> Checks if Frontier nonempty for specified <see cref="Project"/>. </summary>
        [HttpGet("isfrontiernonempty", Name = "IsFrontierNonempty")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> IsFrontierNonempty(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }
            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return NotFound(projectId);
            }
            return Ok(await _wordRepo.IsFrontierNonempty(projectId));
        }

        /// <summary> Returns all Frontier <see cref="Word"/> in specified <see cref="Project"/>. </summary>
        [HttpGet("frontier", Name = "GetProjectFrontierWords")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Word>))]
        public async Task<IActionResult> GetProjectFrontierWords(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }
            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return NotFound(projectId);
            }
            return Ok(await _wordRepo.GetFrontier(projectId));
        }

        /// <summary>
        /// Checks if a <see cref="Word"/> is a duplicate--i.e., are its primary text fields
        /// (Vernacular, Gloss text, Definition text) contained in a frontier entry?
        /// </summary>
        /// <returns> Id of containing word, or empty string if none. </returns>
        [HttpPost("getduplicateid", Name = "GetDuplicateId")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> GetDuplicateId(string projectId, [FromBody, BindRequired] Word word)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }
            word.ProjectId = projectId;

            return Ok(await _wordService.FindContainingWord(word) ?? "");
        }

        /// <summary> Combines a <see cref="Word"/> into the existing duplicate with specified wordId. </summary>
        /// <returns> Id of updated word. </returns>
        [HttpPost("{dupId}", Name = "UpdateDuplicate")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> UpdateDuplicate(
            string projectId, string dupId, string? userId, [FromBody, BindRequired] Word word)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }
            word.ProjectId = projectId;

            var duplicatedWord = await _wordRepo.GetWord(word.ProjectId, dupId);
            if (duplicatedWord is null)
            {
                return NotFound(dupId);
            }

            if (string.IsNullOrEmpty(userId))
            {
                userId = "";
            }
            if (!duplicatedWord.AppendContainedWordContents(word, userId))
            {
                return Conflict();
            }

            await _wordService.Update(duplicatedWord.ProjectId, duplicatedWord.Id, duplicatedWord);

            return Ok(duplicatedWord.Id);
        }

        /// <summary> Creates a <see cref="Word"/>. </summary>
        /// <returns> Id of created word. </returns>
        [HttpPost(Name = "CreateWord")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> CreateWord(string projectId, [FromBody, BindRequired] Word word)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }
            word.ProjectId = projectId;

            await _wordRepo.Create(word);
            return Ok(word.Id);
        }

        /// <summary> Updates a <see cref="Word"/>. </summary>
        /// <returns> Id of updated word </returns>
        [HttpPut("{wordId}", Name = "UpdateWord")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> UpdateWord(
            string projectId, string wordId, [FromBody, BindRequired] Word word)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }
            var document = await _wordRepo.GetWord(projectId, wordId);
            if (document is null)
            {
                return NotFound(wordId);
            }

            // Add the found id to the updated word.
            word.Id = document.Id;
            await _wordService.Update(projectId, wordId, word);
            return Ok(word.Id);
        }
    }
}
