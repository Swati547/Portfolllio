const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const port = Number(process.env.PORT) || 3000;
const rootDirectory = __dirname;
const messagesFile = path.join(rootDirectory, "messages.json");

const contentTypes = {
	".css": "text/css; charset=utf-8",
	".html": "text/html; charset=utf-8",
	".jpg": "image/jpeg",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8"
};

function sendJson(response, statusCode, payload) {
	response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
	response.end(JSON.stringify(payload));
}

function readRequestBody(request) {
	return new Promise((resolve, reject) => {
		let body = "";

		request.on("data", (chunk) => {
			body += chunk;
			if (body.length > 1_000_000) {
				reject(new Error("Request body is too large"));
				request.destroy();
			}
		});
		request.on("end", () => resolve(body));
		request.on("error", reject);
	});
}

async function handleContact(request, response) {
	try {
		const data = JSON.parse(await readRequestBody(request));
		const name = typeof data.name === "string" ? data.name.trim() : "";
		const email = typeof data.email === "string" ? data.email.trim() : "";
		const message = typeof data.message === "string" ? data.message.trim() : "";

		if (!name || !email || !message || !/^\S+@\S+\.\S+$/.test(email)) {
			sendJson(response, 400, { error: "Please provide a valid name, email, and message." });
			return;
		}

		let messages = [];
		if (fs.existsSync(messagesFile)) {
			messages = JSON.parse(fs.readFileSync(messagesFile, "utf8"));
		}
		messages.push({ name, email, message, receivedAt: new Date().toISOString() });
		fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
		sendJson(response, 201, { message: "Your message has been received." });
	} catch (error) {
		const statusCode = error instanceof SyntaxError ? 400 : 500;
		sendJson(response, statusCode, { error: statusCode === 400 ? "Request must contain valid JSON." : "Unable to save your message." });
	}
}

const server = http.createServer(async (request, response) => {
	if (request.method === "GET" && request.url === "/api/health") {
		sendJson(response, 200, { status: "ok" });
		return;
	}

	if (request.method === "POST" && request.url === "/api/contact") {
		await handleContact(request, response);
		return;
	}

	if (request.method !== "GET") {
		sendJson(response, 405, { error: "Method not allowed." });
		return;
	}

	const requestedPath = decodeURIComponent((request.url || "/").split("?")[0]);
	const relativePath = requestedPath === "/" ? "index.html" : requestedPath.slice(1);
	const filePath = path.resolve(rootDirectory, relativePath);

	if (!filePath.startsWith(rootDirectory + path.sep)) {
		sendJson(response, 403, { error: "Forbidden." });
		return;
	}

	if (filePath === messagesFile) {
		sendJson(response, 403, { error: "Forbidden." });
		return;
	}

	fs.readFile(filePath, (error, file) => {
		if (error) {
			sendJson(response, error.code === "ENOENT" ? 404 : 500, { error: "File not found." });
			return;
		}
		response.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
		response.end(file);
	});
});

server.listen(port, () => {
	const url = `http://localhost:${port}`;
	console.log(`Portfolio server running at ${url}`);

	const openCommands = {
	win32: `start "" "${url}"`,
	darwin: `open "${url}"`,
	linux: `xdg-open "${url}"`
	};
	const openCommand = openCommands[process.platform];

	if (openCommand) {
		exec(openCommand);
	}
});
