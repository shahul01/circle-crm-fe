import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectTasksView, setTasksView } from '@/store/slices/ui-slice';
import TaskListPage from './task-list-page';
import TaskKanbanPage from './task-kanban-page';

function TasksPage() {
  const view = useAppSelector(selectTasksView);
  const dispatch = useAppDispatch();

  const toggleView = () =>
    dispatch(setTasksView(view === 'list' ? 'kanban' : 'list'));

  if (view === 'kanban') {
    return <TaskKanbanPage onToggleView={toggleView} />;
  }
  return <TaskListPage onToggleView={toggleView} />;
}

export default TasksPage;
