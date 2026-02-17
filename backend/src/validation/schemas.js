/**
 * @file Joi validation schemas for all API request bodies.
 *
 * Each schema is re-used by the corresponding route handler to validate and
 * sanitise incoming JSON payloads before they reach the database layer.
 *
 * @module validation/schemas
 */

const Joi = require('joi');

/**
 * Schema for creating a new client.
 *
 * @property {string} name        - Required. 1–255 characters, trimmed.
 * @property {string} [description] - Optional. Up to 1 000 characters.
 * @property {string} [department]  - Optional. Up to 255 characters.
 * @property {string} [email]       - Optional. Must be a valid email when provided.
 */
const clientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  department: Joi.string().trim().max(255).optional().allow(''),
  email: Joi.string().trim().email().max(255).optional().allow('')
});

/**
 * Schema for creating a new work entry.
 *
 * @property {number} clientId    - Required. Positive integer referencing an existing client.
 * @property {number} hours       - Required. Positive number up to 24, two decimal places.
 * @property {string} [description] - Optional. Up to 1 000 characters.
 * @property {string} date        - Required. ISO-8601 date string.
 */
const workEntrySchema = Joi.object({
  clientId: Joi.number().integer().positive().required(),
  hours: Joi.number().positive().max(24).precision(2).required(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  date: Joi.date().iso().required()
});

/**
 * Schema for partially updating an existing work entry.
 * At least one field must be supplied (enforced by `.min(1)`).
 *
 * @property {number} [clientId]    - Positive integer referencing an existing client.
 * @property {number} [hours]       - Positive number up to 24, two decimal places.
 * @property {string} [description] - Up to 1 000 characters.
 * @property {string} [date]        - ISO-8601 date string.
 */
const updateWorkEntrySchema = Joi.object({
  clientId: Joi.number().integer().positive().optional(),
  hours: Joi.number().positive().max(24).precision(2).optional(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  date: Joi.date().iso().optional()
}).min(1);

/**
 * Schema for partially updating an existing client.
 * At least one field must be supplied (enforced by `.min(1)`).
 *
 * @property {string} [name]        - 1–255 characters, trimmed.
 * @property {string} [description] - Up to 1 000 characters.
 * @property {string} [department]  - Up to 255 characters.
 * @property {string} [email]       - Must be a valid email when provided.
 */
const updateClientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  department: Joi.string().trim().max(255).optional().allow(''),
  email: Joi.string().trim().email().max(255).optional().allow('')
}).min(1);

/**
 * Schema for the login endpoint.
 *
 * @property {string} email - Required. Must be a valid email address.
 */
const emailSchema = Joi.object({
  email: Joi.string().email().required()
});

module.exports = {
  clientSchema,
  workEntrySchema,
  updateWorkEntrySchema,
  updateClientSchema,
  emailSchema
};
