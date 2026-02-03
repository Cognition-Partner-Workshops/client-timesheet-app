/**
 * @fileoverview Joi validation schemas for request body validation.
 * 
 * Defines validation rules for all API endpoints that accept request bodies.
 * Uses Joi library for declarative schema validation with detailed error messages.
 * 
 * Validation rules enforce:
 * - Required fields and data types
 * - String length limits
 * - Numeric ranges and precision
 * - Email format validation
 * - Date format validation (ISO 8601)
 * 
 * @module validation/schemas
 */

const Joi = require('joi');

/**
 * Validation schema for creating a new client.
 * 
 * @constant {Joi.ObjectSchema}
 * @property {string} name - Client name (required, 1-255 characters, trimmed)
 * @property {string} [description] - Client description (optional, max 1000 characters, trimmed)
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
 * 
 * @constant {Joi.ObjectSchema}
 * @property {number} clientId - Associated client ID (required, positive integer)
 * @property {number} hours - Hours worked (required, positive, max 24, up to 2 decimal places)
 * @property {string} [description] - Work description (optional, max 1000 characters, trimmed)
 * @property {string} date - Date of work (required, ISO 8601 format, e.g., "2024-01-15")
 * 
 * @example
 * const { error, value } = workEntrySchema.validate({
 *   clientId: 1,
 *   hours: 8.5,
 *   description: 'Development work',
 *   date: '2024-01-15'
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
 * 
 * @constant {Joi.ObjectSchema}
 * @property {number} [clientId] - Updated client ID (optional, positive integer)
 * @property {number} [hours] - Updated hours (optional, positive, max 24, up to 2 decimal places)
 * @property {string} [description] - Updated description (optional, max 1000 characters, trimmed)
 * @property {string} [date] - Updated date (optional, ISO 8601 format)
 * 
 * @example
 * const { error, value } = updateWorkEntrySchema.validate({ hours: 6.5 });
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
 * 
 * @constant {Joi.ObjectSchema}
 * @property {string} [name] - Updated client name (optional, 1-255 characters, trimmed)
 * @property {string} [description] - Updated description (optional, max 1000 characters, trimmed)
 * 
 * @example
 * const { error, value } = updateClientSchema.validate({ name: 'Acme Corporation' });
 */
const updateClientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  description: Joi.string().trim().max(1000).optional().allow('')
}).min(1);

/**
 * Validation schema for email-based authentication.
 * 
 * @constant {Joi.ObjectSchema}
 * @property {string} email - User's email address (required, valid email format)
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
