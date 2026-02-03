/**
 * @fileoverview Joi validation schemas for the Client Timesheet Application.
 * Defines validation rules for all API request payloads including clients,
 * work entries, and authentication requests.
 * 
 * @module validation/schemas
 * @requires joi
 */

const Joi = require('joi');

/**
 * Validation schema for creating a new client.
 * Enforces required name field and optional description, department, and email fields.
 * 
 * @constant {Joi.ObjectSchema}
 * @property {string} name - Client name (required, 1-255 characters, trimmed)
 * @property {string} [description] - Client description (optional, max 1000 characters)
 * @property {string} [department] - Client department (optional, max 255 characters)
 * @property {string} [email] - Client contact email (optional, valid email format)
 */
const clientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  department: Joi.string().trim().max(255).optional().allow(''),
  email: Joi.string().trim().email().max(255).optional().allow('')
});

/**
 * Validation schema for creating a new work entry.
 * All fields except description are required for time tracking accuracy.
 * 
 * @constant {Joi.ObjectSchema}
 * @property {number} clientId - Associated client ID (required, positive integer)
 * @property {number} hours - Hours worked (required, 0.01-24, 2 decimal precision)
 * @property {string} [description] - Work description (optional, max 1000 characters)
 * @property {Date} date - Date of work (required, ISO format)
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
 * @property {number} [clientId] - New client ID (optional, positive integer)
 * @property {number} [hours] - Updated hours (optional, 0.01-24, 2 decimal precision)
 * @property {string} [description] - Updated description (optional, max 1000 characters)
 * @property {Date} [date] - Updated date (optional, ISO format)
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
 * @property {string} [name] - Updated client name (optional, 1-255 characters)
 * @property {string} [description] - Updated description (optional, max 1000 characters)
 * @property {string} [department] - Updated department (optional, max 255 characters)
 * @property {string} [email] - Updated email (optional, valid email format)
 */
const updateClientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  department: Joi.string().trim().max(255).optional().allow(''),
  email: Joi.string().trim().email().max(255).optional().allow('')
}).min(1);

/**
 * Validation schema for email-based authentication requests.
 * Used for login endpoint to validate user email format.
 * 
 * @constant {Joi.ObjectSchema}
 * @property {string} email - User email address (required, valid email format)
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
