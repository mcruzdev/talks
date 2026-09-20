#!/usr/bin/env node
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".webp": "image/webp",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
	".mp4": "video/mp4",
	".pdf": "application/pdf",
	".md": "text/markdown; charset=utf-8",
};

function resolveSafePath(urlPath) {
	const decoded = decodeURIComponent(urlPath.split("?")[0]);
	const resolved = path.normalize(path.join(ROOT, decoded));
	if (!resolved.startsWith(ROOT)) return null;
	return resolved;
}

const server = http.createServer((req, res) => {
	let filePath = resolveSafePath(req.url);
	if (!filePath) {
		res.writeHead(400);
		res.end("Bad request");
		return;
	}

	fs.stat(filePath, (err, stats) => {
		if (!err && stats.isDirectory()) {
			filePath = path.join(filePath, "index.html");
		}

		fs.readFile(filePath, (readErr, content) => {
			if (readErr) {
				res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
				res.end("404 - Not found");
				return;
			}

			const ext = path.extname(filePath).toLowerCase();
			res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
			res.end(content);
		});
	});
});

server.listen(PORT, () => {
	console.log(`Serving ${ROOT} at http://localhost:${PORT}`);
});
