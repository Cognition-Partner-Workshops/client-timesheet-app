/**
 * @fileoverview Joi validation schemas for request body validation.
 * Provides reusable validation schemas for all API endpoints.
 * Ensures data integrity and provides meaningful error messages.
 * @module validation/schemas
 */

const Joi = require('joi');

/**
 * Validation schema for creating a new client.
 * 
 * @type {Joi.ObjectSchema}
 * @property {string} name - Client name (required, 1-255 characters, trimmed).
 * @property {string} [description] - Optional client description (max 1000 characters, trimmed).
 * 
 * @example
 * const { error, value } = clientSchema.validate({ name: 'Acme Corp', description: 'Main client' });
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
 * @type {Joi.ObjectSchema}
 * @property {number} clientId - Associated client ID (required, positive integer).
 * @property {number} hours - Hours worked (required, positive, max 24, 2 decimal precision).
 * @property {string} [description] - Optional work description (max 1000 characters, trimmed).
 * @property {string} date - Work date in ISO format (required).
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
 * All fields are optional but at least one must be provided.
 * 
 * @type {Joi.ObjectSchema}
 * @property {number} [clientId] - New client ID (positive integer).
 * @property {number} [hours] - Updated hours (positive, max 24, 2 decimal precision).
 * @property {string} [description] - Updated description (max 1000 characters, trimmed).
 * @property {string} [date] - Updated date in ISO format.
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
 * All fields are optional but at least one must be provided.
 * 
 * @type {Joi.ObjectSchema}
 * @property {string} [name] - Updated client name (1-255 characters, trimmed).
 * @property {string} [description] - Updated description (max 1000 characters, trimmed).
 * 
 * @example
 * const { error, value } = updateClientSchema.validate({ name: 'New Name' });
 */
const updateClientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  department: Joi.string().trim().max(255).optional().allow(''),
  email: Joi.string().trim().email().max(255).optional().allow('')
}).min(1);

/**
 * Validation schema for email-based authentication.
 * 
 * @type {Joi.ObjectSchema}
 * @property {string} email - Valid email address (required).
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
