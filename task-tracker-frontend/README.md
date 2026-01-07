# Task Tracker Frontend

A React-based Kanban board for task tracking with drag-and-drop functionality.

## Tech Stack

- React 18 with TypeScript
- Vite for build tooling
- Material UI for components
- @dnd-kit for drag and drop
- React Router for navigation
- Axios for API calls
- Day.js for date handling

## Features

- Kanban board with 4 default buckets (To Do, In Progress, Review, Done)
- Drag and drop tasks between buckets
- Create new tasks with title, description, assignee, priority, and dates
- View and edit task details on a dedicated page
- Delete tasks with confirmation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will run at `http://localhost:5173`

### Build

```bash
npm run build
```

### Environment Variables

Create a `.env` file with:

```
VITE_API_URL=http://localhost:8080
```

## Project Structure

```
src/
├── api/
│   └── taskApi.ts          # API client
├── components/
│   ├── BucketColumn.tsx    # Kanban column
│   ├── TaskCard.tsx        # Draggable task card
│   └── TaskDialog.tsx      # Create task dialog
├── pages/
│   ├── TaskBoardPage.tsx   # Main Kanban board
│   └── TaskDetailPage.tsx  # Task detail/edit page
├── types/
│   └── task.ts             # TypeScript interfaces
├── App.tsx                 # Root component with routing
└── main.tsx               # Entry point
```

## API Integration

The frontend expects the backend to be running at the URL specified in `VITE_API_URL`. The Vite dev server is configured to proxy `/api` requests to the backend.

## Note

This is a POC frontend. For production use, consider adding:
- Error boundaries
- Loading skeletons
- Form validation
- Unit tests
- E2E tests
