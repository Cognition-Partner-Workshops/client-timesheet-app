/**
 * Localizable strings for the Work Entries page.
 * This file contains all text prompts that can be translated for internationalization.
 * 
 * To add a new language:
 * 1. Add a new locale object (e.g., workEntriesStrings_es for Spanish)
 * 2. Export it and use it based on the user's language preference
 */

export const workEntriesStrings = {
  // Page header
  pageTitle: 'Work Entries',
  addWorkEntryButton: 'Add Work Entry',

  // Table headers
  tableHeaderClient: 'Client',
  tableHeaderDate: 'Date',
  tableHeaderHours: 'Hours',
  tableHeaderDescription: 'Description',
  tableHeaderActions: 'Actions',

  // Table content
  noWorkEntriesMessage: 'No work entries found. Add your first work entry to get started.',
  noDescription: 'No description',
  hoursLabel: (hours: number) => `${hours} hours`,

  // Empty state (no clients)
  noClientsMessage: 'You need to create at least one client before adding work entries.',
  createClientButton: 'Create Client',

  // Dialog titles
  addDialogTitle: 'Add New Work Entry',
  editDialogTitle: 'Edit Work Entry',

  // Form labels
  clientLabel: 'Client',
  hoursFieldLabel: 'Hours',
  dateLabel: 'Date',
  descriptionLabel: 'Description',

  // Form buttons
  cancelButton: 'Cancel',
  createButton: 'Create',
  updateButton: 'Update',

  // Validation messages
  selectClientError: 'Please select a client',
  hoursRangeError: 'Hours must be between 0 and 24',
  selectDateError: 'Please select a date',

  // Error messages
  createError: 'Failed to create work entry',
  updateError: 'Failed to update work entry',
  deleteError: 'Failed to delete work entry',

  // Confirmation messages
  deleteConfirmation: (hours: number, clientName: string) => 
    `Are you sure you want to delete this ${hours} hour entry for ${clientName}?`,
};

export type WorkEntriesStrings = typeof workEntriesStrings;
