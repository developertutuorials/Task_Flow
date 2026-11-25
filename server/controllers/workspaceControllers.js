import prisma from "../configs/prisma.js";
import { clerkClient } from "@clerk/express";

// Get all workspaces for user
export const getUserWorkspaces = async (req, res) => {
  try {
    const { userId } = await req.auth();

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: { some: { userId: userId } },
      },
      include: {
        members: { include: { user: true } },
        projects: {
          include: {
            tasks: {
              include: {
                assignee: true,
                comments: { include: { user: true } },
              },
            },
            members: { include: { user: true } },
          },
        },
        owner: true,
      },
    });

    res.json({ workspaces });
  } catch (error) {
    console.log("getUserWorkspaces error:", error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Create workspace
export const createWorkspace = async (req, res) => {
  try {
    const { userId, orgId, orgSlug, orgRole } = await req.auth();
    const { organizationId, name, slug, imageUrl } = req.body;

    if (!orgId || organizationId !== orgId || orgRole !== "org:admin") {
      return res
        .status(400)
        .json({ message: "An active organization is required" });
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress;
    if (!email) {
      return res
        .status(400)
        .json({ message: "Your Clerk account needs a primary email address" });
    }

    const workspace = await prisma.$transaction(async (transaction) => {
      await transaction.user.upsert({
        where: { id: userId },
        update: {
          email,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
          image: clerkUser.imageUrl || "",
        },
        create: {
          id: userId,
          email,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
          image: clerkUser.imageUrl || "",
        },
      });

      const workspaceRecord = await transaction.workspace.upsert({
        where: { id: orgId },
        update: {
          name: name || orgSlug || orgId,
          slug: slug || orgSlug || orgId,
          image_url: imageUrl || "",
        },
        create: {
          id: orgId,
          name: name || orgSlug || orgId,
          slug: slug || orgSlug || orgId,
          ownerId: userId,
          image_url: imageUrl || "",
        },
      });

      await transaction.workspaceMember.upsert({
        where: {
          userId_workspaceId: { userId, workspaceId: orgId },
        },
        update: { role: "ADMIN" },
        create: { userId, workspaceId: orgId, role: "ADMIN" },
      });

      return workspaceRecord;
    });

    res.status(201).json({ workspace });
  } catch (error) {
    console.log("createWorkspace error:", error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Add member to workspace
export const addMember = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { email, role, workspaceId, message } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!workspaceId || !email || !role) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    if (!["ADMIN", "MEMBER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace) {
      return res.status(400).json({ message: "workspace not found" });
    }

    if (
      !workspace.members.find(
        (member) => member.userId === userId && member.role === "ADMIN",
      )
    ) {
      return res
        .status(401)
        .json({ message: "you do not have admin privileges" });
    }

    const existingMember = workspace.members.find(
      (member) => member.userId === user.id,
    );

    if (existingMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role,
        message,
      },
    });

    res.status(201).json({ member, message: "Member added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
