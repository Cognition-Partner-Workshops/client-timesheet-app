/**
 * @fileoverview Joi validation schemas for API request validation.
 * 
 * This module defines validation schemas for all API endpoints using the Joi
 * validation library. These schemas ensure data integrity and provide clear
 * error messages for invalid input.
 * 
 * @module validation/schemas
 * @requires joi
 */

const Joi = require('joi');

/**
 * Validation schema for creating a new client.
 * 
 * @constant {Joi.ObjectSchema}
 * @property {string} name - Client name (required, 1-255 characters)
 * @property {string} [description] - Optional client description (max 1000 characters)
 */
const clientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().trim().max(1000).optional().allow('')
});

/**
 * Validation schema for creating a new work entry.
 * 
 * @constant {Joi.ObjectSchema}
 * @property {number} clientId - ID of the associated client (required, positive integer)
 * @property {number} hours - Hours worked (required, 0.01-24, 2 decimal precision)
 * @property {string} [description] - Optional work description (max 1000 characters)
 * @property {string} date - Work date in ISO format (required)
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
 * @constant {Joi.ObjectSchema}
 * @property {number} [clientId] - ID of the associated client (positive integer)
 * @property {number} [hours] - Hours worked (0.01-24, 2 decimal precision)
 * @property {string} [description] - Work description (max 1000 characters)
 * @property {string} [date] - Work date in ISO format
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
 * @constant {Joi.ObjectSchema}
 * @property {string} [name] - Client name (1-255 characters)
 * @property {string} [description] - Client description (max 1000 characters)
 */
const updateClientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  description: Joi.string().trim().max(1000).optional().allow('')
}).min(1);

/**
 * Validation schema for email-based authentication.
 * 
 * @constant {Joi.ObjectSchema}
 * @property {string} email - Valid email address (required)
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
