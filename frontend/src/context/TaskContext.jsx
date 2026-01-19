import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // 👈 add error state

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/tasks");
      setTasks(res.data?.data || []); // safe fallback
    } catch (err) {
      console.error("Failed to fetch tasks:", err.message);

      // Backend down → empty UI, not crash
      setTasks([]);
      setError("Backend not available");
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (data) => {
    try {
      const res = await api.post("/tasks", data);
      setTasks((prev) => [res.data.data, ...prev]);
    } catch (err) {
      console.error("Create task failed:", err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Delete task failed:", err.message);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <TaskContext.Provider
      value={{ tasks, loading, error, fetchTasks, createTask, deleteTask }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
