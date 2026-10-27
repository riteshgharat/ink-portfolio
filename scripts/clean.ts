import { execSync } from "child_process";

console.log("Cleaning port 2222...");

try {
    const output = execSync('netstat -ano | findstr :2222').toString();
    const lines = output.split('\n');
    const pids = new Set<string>();

    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
            const pid = parts[parts.length - 1];
            if (pid && pid !== "0" && /^\d+$/.test(pid)) {
                pids.add(pid);
            }
        }
    }

    for (const pid of pids) {
        console.log(`Killing process ${pid}...`);
        try {
            execSync(`taskkill /F /PID ${pid}`);
        } catch (e) {
            // Ignore if process already gone
        }
    }
    
    if (pids.size === 0) {
        console.log("No processes found on port 2222.");
    } else {
        console.log("Port 2222 cleared.");
    }
} catch (err) {
    console.log("No processes found on port 2222.");
}

// Also kill any generic bun.exe processes as a backup
try {
    execSync('taskkill /F /IM bun.exe');
    console.log("Terminated any remaining bun processes.");
} catch (e) {
    // Ignore
}
