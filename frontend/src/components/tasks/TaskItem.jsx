import { Card, CardContent, Typography, IconButton, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTasks } from "../../context/TaskContext";

export default function TaskItem({ task }) {
  const { deleteTask } = useTasks();

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between">
          <div>
            <Typography variant="h6">{task.title}</Typography>
            <Typography color="text.secondary">{task.description}</Typography>
          </div>
          <IconButton onClick={() => deleteTask(task._id)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
