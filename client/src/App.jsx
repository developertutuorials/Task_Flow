import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import { SignIn } from "@clerk/react";

const App = () => {
  return (
    <>
      <Toaster />
      <Routes>
        <Route
          path="/sign-in/*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
              <SignIn routing="path" path="/sign-in" />
            </div>
          }
        />

        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="team" element={<Team />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projectsDetail" element={<ProjectDetails />} />
          <Route path="taskDetails" element={<TaskDetails />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
