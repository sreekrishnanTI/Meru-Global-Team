import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth.js";
import { store } from "../db/store.js";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
    return res.json({
        moments: [...store.get("historyMoments")].sort((a, b) => a.displayOrder - b.displayOrder),
        milestones: [...store.get("historyMilestones")].sort((a, b) => a.displayOrder - b.displayOrder),
    });
});

router.post("/moments", authenticate, (req: Request, res: Response) => {
    const moments = store.get("historyMoments");
    const body = req.body;
    if (!body.year || !body.title) return res.status(400).json({ error: "Year and title are required" });
    const moment = {
        id: crypto.randomUUID(),
        year: String(body.year),
        title: body.title,
        tag: body.tag || "Event",
        imagePath: body.imagePath || "",
        grad: body.grad || "from-blue-400 to-indigo-500",
        description: body.description || "",
        displayOrder: moments.length + 1,
    };
    store.set("historyMoments", [...moments, moment]);
    return res.status(201).json(moment);
});

router.put("/moments/:id", authenticate, (req: Request, res: Response) => {
    const moments = store.get("historyMoments");
    const index = moments.findIndex((item) => String(item.id) === req.params.id);
    if (index === -1) return res.status(404).json({ error: "History moment not found" });
    moments[index] = { ...moments[index], ...req.body, id: moments[index].id };
    store.set("historyMoments", moments);
    return res.json(moments[index]);
});

router.delete("/moments/:id", authenticate, (req: Request, res: Response) => {
    const moments = store.get("historyMoments");
    const filtered = moments.filter((item) => String(item.id) !== req.params.id);
    if (filtered.length === moments.length) return res.status(404).json({ error: "History moment not found" });
    store.set("historyMoments", filtered);
    return res.json({ success: true });
});

router.post("/milestones", authenticate, (req: Request, res: Response) => {
    const milestones = store.get("historyMilestones");
    const body = req.body;
    if (!body.year || !body.title) return res.status(400).json({ error: "Year and title are required" });
    const milestone = {
        id: crypto.randomUUID(),
        year: String(body.year),
        title: body.title,
        desc: body.desc || body.description || "",
        icon: body.icon || "Compass",
        color: body.color || "border-blue-500 text-blue-600 bg-blue-50",
        imageGrad: body.imageGrad || "from-blue-400 to-indigo-500",
        displayOrder: milestones.length + 1,
    };
    store.set("historyMilestones", [...milestones, milestone]);
    return res.status(201).json(milestone);
});

router.put("/milestones/:id", authenticate, (req: Request, res: Response) => {
    const milestones = store.get("historyMilestones");
    const index = milestones.findIndex((item) => String(item.id) === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Milestone not found" });
    milestones[index] = { ...milestones[index], ...req.body, id: milestones[index].id };
    store.set("historyMilestones", milestones);
    return res.json(milestones[index]);
});

router.delete("/milestones/:id", authenticate, (req: Request, res: Response) => {
    const milestones = store.get("historyMilestones");
    const filtered = milestones.filter((item) => String(item.id) !== req.params.id);
    if (filtered.length === milestones.length) return res.status(404).json({ error: "Milestone not found" });
    store.set("historyMilestones", filtered);
    return res.json({ success: true });
});

export default router;
