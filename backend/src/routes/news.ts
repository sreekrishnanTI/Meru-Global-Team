import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth.js";
import { store } from "../db/store.js";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
    return res.json({
        articles: [...store.get("newsArticles")].sort((a, b) => a.displayOrder - b.displayOrder),
        events: [...store.get("newsEvents")].sort((a, b) => a.displayOrder - b.displayOrder),
        mentions: [],
    });
});

router.post("/articles", authenticate, (req: Request, res: Response) => {
    const articles = store.get("newsArticles");
    const body = req.body;
    if (!body.title || !body.date) return res.status(400).json({ error: "Title and date are required" });
    const article = {
        id: crypto.randomUUID(),
        title: body.title,
        date: body.date,
        category: body.category || "Announcement",
        desc: body.desc || body.excerpt || "",
        content: body.content || "",
        imagePath: body.imagePath || "",
        grad: body.grad || "from-blue-400 to-indigo-500",
        author: body.author || "Media Relations Board",
        displayOrder: articles.length + 1,
    };
    store.set("newsArticles", [...articles, article]);
    return res.status(201).json(article);
});

router.put("/articles/:id", authenticate, (req: Request, res: Response) => {
    const articles = store.get("newsArticles");
    const index = articles.findIndex((item) => String(item.id) === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Article not found" });
    articles[index] = { ...articles[index], ...req.body, id: articles[index].id };
    store.set("newsArticles", articles);
    return res.json(articles[index]);
});

router.delete("/articles/:id", authenticate, (req: Request, res: Response) => {
    const articles = store.get("newsArticles");
    const filtered = articles.filter((item) => String(item.id) !== req.params.id);
    if (filtered.length === articles.length) return res.status(404).json({ error: "Article not found" });
    store.set("newsArticles", filtered);
    return res.json({ success: true });
});

router.post("/events", authenticate, (req: Request, res: Response) => {
    const events = store.get("newsEvents");
    const body = req.body;
    if (!body.title || !body.day || !body.month) return res.status(400).json({ error: "Title, day, and month are required" });
    const event = {
        id: crypto.randomUUID(),
        day: String(body.day),
        month: String(body.month).toUpperCase(),
        title: body.title,
        time: body.time || "",
        location: body.location || "",
        desc: body.desc || body.description || "",
        link: body.link || "",
        displayOrder: events.length + 1,
    };
    store.set("newsEvents", [...events, event]);
    return res.status(201).json(event);
});

router.put("/events/:id", authenticate, (req: Request, res: Response) => {
    const events = store.get("newsEvents");
    const index = events.findIndex((item) => String(item.id) === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Event not found" });
    events[index] = { ...events[index], ...req.body, id: events[index].id };
    store.set("newsEvents", events);
    return res.json(events[index]);
});

router.delete("/events/:id", authenticate, (req: Request, res: Response) => {
    const events = store.get("newsEvents");
    const filtered = events.filter((item) => String(item.id) !== req.params.id);
    if (filtered.length === events.length) return res.status(404).json({ error: "Event not found" });
    store.set("newsEvents", filtered);
    return res.json({ success: true });
});

export default router;
