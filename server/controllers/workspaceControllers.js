// Create workspace
export const createWorkspace = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: "ADMIN",
          },
        },
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

    res.status(201).json({ workspace });
  } catch (error) {
    console.log("createWorkspace error:", error);
    res.status(500).json({ message: error.code || error.message });
  }
};
