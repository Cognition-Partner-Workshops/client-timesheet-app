const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');

// Custom sanitization function to strip all HTML tags and prevent XSS
const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard'
  }).trim();
};

// Custom Joi extension for sanitized strings
const sanitizedString = () => Joi.string().custom((value, helpers) => {
  const sanitized = sanitizeString(value);
  if (sanitized !== value.trim()) {
    // Log potential XSS attempt (don't expose to user)
    console.warn('Potential XSS attempt detected and sanitized');
  }
  return sanitized;
});

const clientSchema = Joi.object({
  name: sanitizedString().min(1).max(255).required(),
  description: sanitizedString().max(1000).optional().allow('')
});

const workEntrySchema = Joi.object({
  clientId: Joi.number().integer().positive().required(),
  hours: Joi.number().positive().max(24).precision(2).required(),
  description: sanitizedString().max(1000).optional().allow(''),
  date: Joi.date().iso().required()
});

const updateWorkEntrySchema = Joi.object({
  clientId: Joi.number().integer().positive().optional(),
  hours: Joi.number().positive().max(24).precision(2).optional(),
  description: sanitizedString().max(1000).optional().allow(''),
  date: Joi.date().iso().optional()
}).min(1); // At least one field must be provided

const updateClientSchema = Joi.object({
  name: sanitizedString().min(1).max(255).optional(),
  description: sanitizedString().max(1000).optional().allow('')
}).min(1); // At least one field must be provided

const emailSchema = Joi.object({
  email: Joi.string().email().lowercase().required()
});

module.exports = {
  clientSchema,
  workEntrySchema,
  updateWorkEntrySchema,
  updateClientSchema,
  emailSchema,
  sanitizeString
};
