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

/**
 *
 * @export
 * @interface User
 */
export interface User {
  /**
   *
   * @type {string}
   * @memberof User
   */
  id: string;
  /**
   *
   * @type {string}
   * @memberof User
   */
  avatar: string;
  /**
   *
   * @type {boolean}
   * @memberof User
   */
  hasAvatar: boolean;
  /**
   *
   * @type {string}
   * @memberof User
   */
  name: string;
  /**
   *
   * @type {string}
   * @memberof User
   */
  email: string;
  /**
   *
   * @type {string}
   * @memberof User
   */
  phone: string;
  /**
   *
   * @type {string}
   * @memberof User
   */
  otherConnectionField?: string | null;
  /**
   *
   * @type {{ [key: string]: string; }}
   * @memberof User
   */
  workedProjects: { [key: string]: string };
  /**
   *
   * @type {{ [key: string]: string; }}
   * @memberof User
   */
  projectRoles: { [key: string]: string };
  /**
   *
   * @type {boolean}
   * @memberof User
   */
  agreement?: boolean;
  /**
   *
   * @type {string}
   * @memberof User
   */
  password: string;
  /**
   *
   * @type {string}
   * @memberof User
   */
  username: string;
  /**
   *
   * @type {string}
   * @memberof User
   */
  uiLang?: string | null;
  /**
   *
   * @type {string}
   * @memberof User
   */
  token: string;
  /**
   *
   * @type {boolean}
   * @memberof User
   */
  isAdmin: boolean;
}
