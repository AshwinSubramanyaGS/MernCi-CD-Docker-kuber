import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TaskList from "./TaskList";
import { TaskContext } from "../../context/TaskContext";

describe("TaskList", () => {
  it("renders empty state", () => {
    render(
      <TaskContext.Provider
        value={{
          tasks: [],
          loading: false,
          error: null,
        }}
      >
        <TaskList />
      </TaskContext.Provider>
    );

    expect(screen.getByText(/My Tasks/i)).toBeInTheDocument();
    expect(
      screen.getByText(/No tasks yet/i)
    ).toBeInTheDocument();
  });
});
