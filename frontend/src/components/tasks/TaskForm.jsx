import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useTasks } from "../../context/TaskContext";

export default function TaskForm({ open, onClose }) {
  const { createTask } = useTasks();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    await createTask(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Add Task</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Title" {...register("title")} />
          <TextField label="Description" {...register("description")} />

          <Button variant="contained" onClick={handleSubmit(onSubmit)}>
            Create Task
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
