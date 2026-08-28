import { useState } from 'react';
import TaskListPage from './task-list-page';
import TaskKanbanPage from './task-kanban-page';

function TasksPage() {
  const [view, setView] = useState<'list' | 'kanban'>('list');

  if (view === 'kanban') {
    return <TaskKanbanPage onToggleView={() => setView('list')} />;
  }
  return <TaskListPage onToggleView={() => setView('kanban')} />;
}

export default TasksPage;
