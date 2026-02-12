/**
 * @fileoverview Joi validation schemas for API request bodies.
 *
 * Each schema is used in its corresponding route handler to validate and
 * sanitise incoming data before it reaches the database layer.  Strings are
 * trimmed automatically, and empty strings are permitted for optional fields so
 * that the frontend can clear a value without omitting the key entirely.
 *
 * @module validation/schemas
 */

const Joi = require('joi');

/**
 * Validation schema for creating a new client.
 *
 * @type {import('joi').ObjectSchema}
 * @property {string} name - Required; 1-255 characters.
 * @property {string} [description] - Optional; up to 1000 characters.
 * @property {string} [department] - Optional; up to 255 characters.
 * @property {string} [email] - Optional; must be a valid email if provided.
 */
const clientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  department: Joi.string().trim().max(255).optional().allow(''),
  email: Joi.string().trim().email().max(255).optional().allow('')
});

/**
 * Validation schema for creating a new work entry.
 *
 * @type {import('joi').ObjectSchema}
 * @property {number} clientId - Required; positive integer referencing a client.
 * @property {number} hours - Required; positive number up to 24, two decimal places.
 * @property {string} [description] - Optional; up to 1000 characters.
 * @property {string} date - Required; ISO-8601 date string.
 */
const workEntrySchema = Joi.object({
  clientId: Joi.number().integer().positive().required(),
  hours: Joi.number().positive().max(24).precision(2).required(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  date: Joi.date().iso().required()
});

/**
 * Validation schema for partially updating an existing work entry.
 *
 * Identical constraints to {@link workEntrySchema} but every field is optional.
 * At least one field must be provided (enforced by `.min(1)`).
 *
 * @type {import('joi').ObjectSchema}
 */
const updateWorkEntrySchema = Joi.object({
  clientId: Joi.number().integer().positive().optional(),
  hours: Joi.number().positive().max(24).precision(2).optional(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  date: Joi.date().iso().optional()
}).min(1); // At least one field must be provided

/**
 * Validation schema for partially updating an existing client.
 *
 * Identical constraints to {@link clientSchema} but every field is optional.
 * At least one field must be provided (enforced by `.min(1)`).
 *
 * @type {import('joi').ObjectSchema}
 */
const updateClientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  department: Joi.string().trim().max(255).optional().allow(''),
  email: Joi.string().trim().email().max(255).optional().allow('')
}).min(1); // At least one field must be provided

/**
 * Validation schema for the login request body.
 *
 * @type {import('joi').ObjectSchema}
 * @property {string} email - Required; must be a valid email address.
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
