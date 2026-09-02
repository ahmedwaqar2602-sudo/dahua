# Dahua Agent Setup Notes

## PM2 Service Configuration
When setting up `local-agent.js` to run automatically on system boot via PM2, simply running `pm2 start` and installing `pm2-windows-startup` is **not sufficient**.

### REQUIRED STEP: Save the PM2 process list
After starting the agent with PM2 (`pm2 start local-agent.js --name "dahua-agent"`), you **MUST** run the following command to snapshot the current process list:

```bash
pm2 save
```

This ensures that PM2 actually remembers which processes to resurrect after a machine reboot. If this step is skipped, PM2 will launch on Windows boot, but it will not start the `dahua-agent` process, leaving the system offline until manually intervened.
