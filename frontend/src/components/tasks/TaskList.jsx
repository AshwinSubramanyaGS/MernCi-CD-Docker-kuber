import { CircularProgress, Stack, Typography } from "@mui/material";
import { useTasks } from "../../context/TaskContext";
import TaskItem from "./TaskItem";

export default function TaskList() {
  const { tasks, loading, error } = useTasks();

  if (loading) return <CircularProgress />;

  return (
    <Stack spacing={2}>
      <Typography variant="h4">My Tasks</Typography>

      {error && (
        <Typography color="error">
          ⚠️ Backend unavailable. Showing empty list.
        </Typography>
      )}

      {tasks.length === 0 && !error && (
        <Typography color="text.secondary">
          No tasks yet. Click + to add one.
        </Typography>
      )}

      {tasks.map((task) => (
        <TaskItem key={task._id} task={task} />
      ))}
    </Stack>
  );
}
