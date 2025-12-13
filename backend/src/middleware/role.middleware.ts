export const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Admin only" });
    next();
  };
  