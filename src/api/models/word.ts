/* tslint:disable */
/* eslint-disable */
/**
 * BackendFramework
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { Flag } from "./flag";
import { Note } from "./note";
import { Sense } from "./sense";
import { State } from "./state";

/**
 *
 * @export
 * @interface Word
 */
export interface Word {
  /**
   *
   * @type {string}
   * @memberof Word
   */
  id: string;
  /**
   *
   * @type {string}
   * @memberof Word
   */
  guid: string;
  /**
   *
   * @type {string}
   * @memberof Word
   */
  vernacular: string;
  /**
   *
   * @type {string}
   * @memberof Word
   */
  plural?: string | null;
  /**
   *
   * @type {Array<Sense>}
   * @memberof Word
   */
  senses: Array<Sense>;
  /**
   *
   * @type {Array<string>}
   * @memberof Word
   */
  audio: Array<string>;
  /**
   *
   * @type {string}
   * @memberof Word
   */
  created: string;
  /**
   *
   * @type {string}
   * @memberof Word
   */
  modified: string;
  /**
   *
   * @type {State}
   * @memberof Word
   */
  accessibility: State;
  /**
   *
   * @type {Array<string>}
   * @memberof Word
   */
  history: Array<string>;
  /**
   *
   * @type {string}
   * @memberof Word
   */
  partOfSpeech?: string | null;
  /**
   *
   * @type {Array<string>}
   * @memberof Word
   */
  editedBy?: Array<string> | null;
  /**
   *
   * @type {string}
   * @memberof Word
   */
  otherField?: string | null;
  /**
   *
   * @type {string}
   * @memberof Word
   */
  projectId: string;
  /**
   *
   * @type {Note}
   * @memberof Word
   */
  note: Note;
  /**
   *
   * @type {Flag}
   * @memberof Word
   */
  flag: Flag;
}
