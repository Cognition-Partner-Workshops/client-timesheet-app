/**
 * @fileoverview Joi validation schemas for request body validation.
 * This module defines validation rules for all API endpoints that accept user input,
 * ensuring data integrity and providing meaningful error messages.
 * @module validation/schemas
 */

const Joi = require('joi');

/**
 * Validation schema for creating a new client.
 * @constant {Joi.ObjectSchema}
 * @property {string} name - Client name (required, 1-255 characters)
 * @property {string} [description] - Optional client description (max 1000 characters)
 */
const clientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  department: Joi.string().trim().max(255).optional().allow(''),
  email: Joi.string().trim().email().max(255).optional().allow('')
});

/**
 * Validation schema for creating a new work entry.
 * @constant {Joi.ObjectSchema}
 * @property {number} clientId - ID of the associated client (required, positive integer)
 * @property {number} hours - Hours worked (required, 0.01-24, 2 decimal precision)
 * @property {string} [description] - Optional work description (max 1000 characters)
 * @property {string} date - Date of work entry (required, ISO 8601 format)
 */
const workEntrySchema = Joi.object({
  clientId: Joi.number().integer().positive().required(),
  hours: Joi.number().positive().max(24).precision(2).required(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  date: Joi.date().iso().required()
});

/**
 * Validation schema for updating an existing work entry.
 * At least one field must be provided for the update.
 * @constant {Joi.ObjectSchema}
 * @property {number} [clientId] - New client ID (positive integer)
 * @property {number} [hours] - Updated hours (0.01-24, 2 decimal precision)
 * @property {string} [description] - Updated description (max 1000 characters)
 * @property {string} [date] - Updated date (ISO 8601 format)
 */
const updateWorkEntrySchema = Joi.object({
  clientId: Joi.number().integer().positive().optional(),
  hours: Joi.number().positive().max(24).precision(2).optional(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  date: Joi.date().iso().optional()
}).min(1);

/**
 * Validation schema for updating an existing client.
 * At least one field must be provided for the update.
 * @constant {Joi.ObjectSchema}
 * @property {string} [name] - Updated client name (1-255 characters)
 * @property {string} [description] - Updated description (max 1000 characters)
 */
const updateClientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  department: Joi.string().trim().max(255).optional().allow(''),
  email: Joi.string().trim().email().max(255).optional().allow('')
}).min(1);

/**
 * Validation schema for email-based authentication.
 * @constant {Joi.ObjectSchema}
 * @property {string} email - User's email address (required, valid email format)
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
