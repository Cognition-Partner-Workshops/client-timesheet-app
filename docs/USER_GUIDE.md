# User Guide

This guide provides step-by-step instructions for using the Employee Time Tracking Application.

## Getting Started

### Accessing the Application

Open your web browser and navigate to the application URL (default: `http://localhost:5173` for development).

### Logging In

The application uses email-based authentication without passwords. This design assumes the application is used within a trusted internal network.

1. On the login page, enter your email address in the email field
2. Click the "Log In" button
3. If this is your first time logging in, a new account will be created automatically
4. You will be redirected to the Dashboard

Note: There is no password requirement. Anyone with access to the application URL can log in with any email address.

## Dashboard

The Dashboard is your home screen after logging in. It provides an overview of your time tracking data and quick access to common actions.

### Dashboard Components

**Statistics Cards**: Three cards at the top display key metrics:
- Total Clients: Number of clients you have created
- Total Work Entries: Number of time entries you have logged
- Total Hours: Sum of all hours logged across all clients

Clicking on any statistics card navigates to the corresponding page.

**Recent Work Entries**: Shows your five most recent work entries with client name, hours, date, and description.

**Quick Actions**: Buttons for common tasks:
- Add Client: Navigate to the Clients page to create a new client
- Add Work Entry: Navigate to the Work Entries page to log time
- View Reports: Navigate to the Reports page to view and export reports

## Managing Clients

Clients represent the organizations or projects you track time for. Navigate to the Clients page using the sidebar menu.

### Viewing Clients

The Clients page displays a table of all your clients with their name, description, and creation date.

### Adding a New Client

1. Click the "Add Client" button at the top of the page
2. In the dialog that appears, enter the client name (required)
3. Optionally enter a description
4. Click "Create" to save the client

### Editing a Client

1. Find the client in the table
2. Click the edit icon (pencil) in the Actions column
3. Modify the name or description in the dialog
4. Click "Save" to update the client

### Deleting a Client

1. Find the client in the table
2. Click the delete icon (trash) in the Actions column
3. Confirm the deletion in the dialog

Warning: Deleting a client will also delete all work entries associated with that client. This action cannot be undone.

## Tracking Work Hours

Work entries represent time spent working for a specific client. Navigate to the Work Entries page using the sidebar menu.

### Viewing Work Entries

The Work Entries page displays a table of all your work entries sorted by date (most recent first). Each entry shows:
- Client name
- Hours worked
- Date
- Description
- Actions (edit/delete)

### Filtering by Client

Use the client dropdown filter at the top of the page to show only entries for a specific client.

### Adding a Work Entry

1. Click the "Add Entry" button at the top of the page
2. In the dialog that appears:
   - Select a client from the dropdown (required)
   - Enter the number of hours worked (required, max 24 hours)
   - Select the date using the date picker (required)
   - Optionally enter a description of the work performed
3. Click "Create" to save the entry

### Editing a Work Entry

1. Find the entry in the table
2. Click the edit icon (pencil) in the Actions column
3. Modify any fields in the dialog
4. Click "Save" to update the entry

### Deleting a Work Entry

1. Find the entry in the table
2. Click the delete icon (trash) in the Actions column
3. Confirm the deletion in the dialog

## Reports

The Reports page allows you to view detailed time reports for each client and export them in CSV or PDF format.

### Viewing a Report

1. Navigate to the Reports page using the sidebar menu
2. Select a client from the dropdown at the top of the page
3. The report will display:
   - Client name
   - Total hours worked
   - Number of entries
   - A table of all work entries for that client

### Exporting to CSV

1. Select a client to view their report
2. Click the "Export CSV" button
3. A CSV file will be downloaded containing all work entries with columns for Date, Hours, Description, and Created At

CSV files can be opened in spreadsheet applications like Microsoft Excel, Google Sheets, or LibreOffice Calc for further analysis.

### Exporting to PDF

1. Select a client to view their report
2. Click the "Export PDF" button
3. A PDF file will be downloaded containing:
   - Report title with client name
   - Summary statistics (total hours, entry count, generation date)
   - A formatted table of all work entries

PDF reports are suitable for sharing with clients or archiving.

## Navigation

### Sidebar Menu

The sidebar on the left provides navigation to all main sections:
- Dashboard: Overview and quick actions
- Clients: Manage your clients
- Work Entries: Log and manage time entries
- Reports: View and export reports

### Logging Out

Click the "Logout" button in the sidebar to log out of the application. You will be redirected to the login page.

## Tips and Best Practices

### Organizing Clients

- Use descriptive names that clearly identify each client or project
- Add descriptions to provide additional context
- Consider creating separate clients for different projects with the same organization

### Tracking Time Effectively

- Log time entries daily to ensure accuracy
- Use the description field to document what work was performed
- Review your entries regularly to catch any mistakes

### Generating Reports

- Export reports at the end of each billing period
- Use CSV exports for detailed analysis in spreadsheets
- Use PDF exports for professional reports to share with clients

## Troubleshooting

### Cannot Log In

- Ensure you are entering a valid email address format
- Check that you have network connectivity to the server
- If rate-limited, wait 15 minutes before trying again

### Data Not Saving

- Check your network connection
- Refresh the page and try again
- Ensure all required fields are filled in

### Missing Data After Server Restart

The application uses an in-memory database by default. All data is lost when the server restarts. This is expected behavior for development environments. For production use, contact your system administrator about enabling persistent storage.

### Export Not Working

- Ensure you have a client selected
- Check that your browser allows file downloads
- Try a different browser if the issue persists

## Keyboard Shortcuts

The application supports standard web keyboard navigation:
- Tab: Move between form fields
- Enter: Submit forms
- Escape: Close dialogs

## Browser Compatibility

The application is tested and supported on:
- Google Chrome (latest)
- Mozilla Firefox (latest)
- Microsoft Edge (latest)
- Safari (latest)

For the best experience, use a modern browser with JavaScript enabled.
