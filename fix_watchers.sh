#!/bin/bash
echo "Current limit:"
cat /proc/sys/fs/inotify/max_user_watches

echo "Attempting to increase file watcher limit to 524288 for Expo..."
echo "This requires sudo privileges."

echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

echo "New limit:"
cat /proc/sys/fs/inotify/max_user_watches
echo "Done! Please restart your Expo server."
