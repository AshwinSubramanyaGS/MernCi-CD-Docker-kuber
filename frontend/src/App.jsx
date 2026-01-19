import { Container, Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import TaskList from "./components/tasks/TaskList";
import TaskForm from "./components/tasks/TaskForm";
import { TaskProvider } from "./context/TaskContext";

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <TaskProvider>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <TaskList />

        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 32, right: 32 }}
          onClick={() => setOpen(true)}
        >
          <AddIcon />
        </Fab>

        <TaskForm open={open} onClose={() => setOpen(false)} />
      </Container>
    </TaskProvider>
  );
}
