import prisma from "../configs/prisma.js";
import { inngest } from "../inngest/index.js";

//  Cretae Task

export const createTask = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {
      projectId,
      title,
      description,
      type,
      status,
      priority,
      assigneedId,
      due_date,
    } = req.body;
    const origin = req.get("origin");

    // check if user has admin role project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { include: { user: true } } },
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ message: "You do not have admin privilages for this project" });
    } else if (
      assigneedId &&
      !project.members.find(() => member.user.id === assigneedId)
    ) {
      return res
        .status(403)
        .json({ message: "Assignee is not member of the project/workspace" });
    }
    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        priority,
        assigneedId,
        status,
        due_date: new Date(due_date),
      },
    });

    const taskWithAssignee = await prisma.task.findUnique({
      where: { id: task.id },
      include: { assignee: true },
    });
    await inngest.send({
      name: "app/task.assigned",
      data: {
        taskId: task.id,
        origin,
      },
    });
    res.json({ task: taskWithAssignee, message: "Task created succesfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// updte task
export const updateTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const { userId } = await req.auth();
    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      include: { members: { include: { user: true } } },
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ message: "You do not have admin privilages for this project" });
    }
    const updatedTask = await prisma.task.create({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ task: updateTask, message: "Task updated succesfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { tasksIds } = req.body;
    const tasks = await prisma.task.findMany({
      where: { id: { in: tasksIds } },
    });

    if (tasks.length === 0) {
      return res.status(404).json({ message: "Task Not Found" });
    }

    const project = await prisma.project.findUnique({
      where: { id: tasks[0].projectId },
      include: { members: { include: { user: true } } },
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ message: "You do not have admin privilages for this project" });
    }
    await prisma.task.deleteMany({
      where: { id: { in: tasksIds } },
    });

    res.json({ message: "Task deleted succesfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
