/**
 * @module validation/schemas
 * @description Joi validation schemas for the timesheet application.
 * Provides input validation for all API endpoints to ensure data integrity.
 * All schemas use Joi for declarative validation with detailed error messages.
 */

const Joi = require('joi');

/**
 * Validation schema for creating a new client.
 * @type {Joi.ObjectSchema}
 * @property {string} name - Client name (required, 1-255 characters, trimmed)
 * @property {string} [description] - Client description (optional, max 1000 characters, trimmed, allows empty string)
 *
 * @example
 * const { error, value } = clientSchema.validate({ name: 'Acme Corp', description: 'Main client' });
 */
const clientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().trim().max(1000).optional().allow('')
});

/**
 * Validation schema for creating a new work entry.
 * @type {Joi.ObjectSchema}
 * @property {number} clientId - Client ID (required, positive integer)
 * @property {number} hours - Hours worked (required, positive number, max 24, up to 2 decimal places)
 * @property {string} [description] - Work description (optional, max 1000 characters, trimmed, allows empty string)
 * @property {Date} date - Date of work (required, ISO format)
 *
 * @example
 * const { error, value } = workEntrySchema.validate({
 *   clientId: 1,
 *   hours: 8,
 *   date: '2024-01-15',
 *   description: 'Feature development'
 * });
 */
const workEntrySchema = Joi.object({
  clientId: Joi.number().integer().positive().required(),
  hours: Joi.number().positive().max(24).precision(2).required(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  date: Joi.date().iso().required()
});

/**
 * Validation schema for updating an existing work entry.
 * Supports partial updates - at least one field must be provided.
 * @type {Joi.ObjectSchema}
 * @property {number} [clientId] - New client ID (optional, positive integer)
 * @property {number} [hours] - New hours value (optional, positive number, max 24, up to 2 decimal places)
 * @property {string} [description] - New work description (optional, max 1000 characters, trimmed, allows empty string)
 * @property {Date} [date] - New date of work (optional, ISO format)
 *
 * @example
 * const { error, value } = updateWorkEntrySchema.validate({ hours: 6 });
 */
const updateWorkEntrySchema = Joi.object({
  clientId: Joi.number().integer().positive().optional(),
  hours: Joi.number().positive().max(24).precision(2).optional(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  date: Joi.date().iso().optional()
}).min(1);

/**
 * Validation schema for updating an existing client.
 * Supports partial updates - at least one field must be provided.
 * @type {Joi.ObjectSchema}
 * @property {string} [name] - New client name (optional, 1-255 characters, trimmed)
 * @property {string} [description] - New client description (optional, max 1000 characters, trimmed, allows empty string)
 *
 * @example
 * const { error, value } = updateClientSchema.validate({ name: 'Updated Corp Name' });
 */
const updateClientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  description: Joi.string().trim().max(1000).optional().allow('')
}).min(1);

/**
 * Validation schema for user email in authentication requests.
 * @type {Joi.ObjectSchema}
 * @property {string} email - User's email address (required, must be valid email format)
 *
 * @example
 * const { error, value } = emailSchema.validate({ email: 'user@example.com' });
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
